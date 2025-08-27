// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { prisma } from '../utils/database';

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string;
  role: string;
  organizationId?: string;
  authType: 'SAAS_ADMIN' | 'ORGANIZATION_MEMBER' | 'CUSTOMER';
}

// Middleware for tenant isolation and role-based access control
export async function tenantIsolationMiddleware(server: FastifyInstance): Promise<void> {
  
  // Authentication middleware
  server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for public routes
    const publicRoutes = [
      '/api/v1/auth/customer/login',
      '/api/v1/auth/organization/login',
      '/api/v1/auth/accept-invitation',
      '/admin-backend/saas-admin/login',
      '/admin-backend/saas-admin/initialize',
      '/api/v1/health',
      '/health'
    ];

    if (publicRoutes.some(route => request.url.startsWith(route))) {
      return;
    }

    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reply.code(401).send({ 
        code: 'NO_TOKEN',
        message: 'Authentication token required' 
      });
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      // Validate user exists and is active
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          status: 'ACTIVE',
        },
        include: {
          organization: true,
        },
      });

      if (!user) {
        return reply.code(401).send({ 
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive' 
        });
      }

      // Set user info on request
      (request as AuthenticatedRequest).userId = user.id;
      (request as AuthenticatedRequest).role = user.role;
      (request as AuthenticatedRequest).authType = decoded.type;

      // Handle SaaS admin access
      if (decoded.type === 'SAAS_ADMIN') {
        if (user.role !== 'SAAS_ADMIN' || user.organizationId !== null) {
          return reply.code(403).send({ 
            code: 'INVALID_SAAS_ADMIN',
            message: 'Invalid SaaS admin credentials' 
          });
        }
        // SaaS admins have platform-wide access
        (request as AuthenticatedRequest).organizationId = null;
        return;
      }

      // Handle organization-bound users
      if (!user.organizationId || !user.organization) {
        return reply.code(403).send({ 
          code: 'NO_ORGANIZATION',
          message: 'User must belong to an organization' 
        });
      }

      // Check organization is active
      if (!user.organization.isActive) {
        return reply.code(403).send({ 
          code: 'ORGANIZATION_INACTIVE',
          message: 'Organization is inactive' 
        });
      }

      (request as AuthenticatedRequest).organizationId = user.organizationId;

      // Additional validation for customers
      if (user.role === 'CUSTOMER') {
        if (!user.hasActiveJobs) {
          // Double-check they have active bookings or devices
          const hasActiveServices = await prisma.user.findFirst({
            where: {
              id: user.id,
              OR: [
                { devices: { some: {} } },
                { bookings: { some: { status: { in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'] } } } },
              ],
            },
          });

          if (!hasActiveServices) {
            return reply.code(403).send({ 
              code: 'NO_ACTIVE_SERVICES',
              message: 'No active services found' 
            });
          }
        }
      }

    } catch (error) {
      return reply.code(401).send({ 
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token' 
      });
    }
  });

  // Tenant isolation middleware
  server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const authReq = request as AuthenticatedRequest;
    
    // Skip for public routes and SaaS admin
    if (!authReq.userId || authReq.authType === 'SAAS_ADMIN') {
      return;
    }

    // Extract organization ID from route params if present
    const routeOrgId = (request.params as any)?.orgId || (request.params as any)?.organizationId;
    
    if (routeOrgId && routeOrgId !== authReq.organizationId) {
      return reply.code(403).send({ 
        code: 'CROSS_ORG_ACCESS_DENIED',
        message: 'Access to other organizations not allowed' 
      });
    }

    // For routes that don't specify org ID, ensure data queries are scoped to user's org
    if (authReq.organizationId) {
      // Add organization filter to all Prisma queries automatically
      // This is handled in the individual route handlers
    }
  });

  // Role-based access control middleware
  server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const authReq = request as AuthenticatedRequest;
    
    if (!authReq.userId) {
      return; // Skip for unauthenticated requests
    }

    // Define role-based route access
    const routeAccessRules = {
      '/api/v1/organizations': ['SAAS_ADMIN'], // Only SaaS admins can create orgs
      '/api/v1/organizations/*/invite': ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'],
      '/api/v1/organizations/*/customers': ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN', 'TECHNICIAN'],
      '/api/v1/business-management': ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'],
      '/api/v1/employees': ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'],
      '/api/v1/ai-analytics': ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'],
    };

    // Check route access
    for (const [routePattern, allowedRoles] of Object.entries(routeAccessRules)) {
      const regex = new RegExp(routePattern.replace('*', '[^/]+'));
      if (regex.test(request.url)) {
        if (!allowedRoles.includes(authReq.role)) {
          return reply.code(403).send({ 
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Role ${authReq.role} does not have access to this resource` 
          });
        }
        break;
      }
    }
  });
}

// Helper function to check organization access
export function requireOrganizationAccess(allowedRoles: string[] = []) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authReq = request as AuthenticatedRequest;
    
    if (authReq.authType === 'SAAS_ADMIN') {
      return; // SaaS admins have access to all organizations
    }

    if (!authReq.organizationId) {
      return reply.code(403).send({ 
        code: 'NO_ORGANIZATION_ACCESS',
        message: 'Organization access required' 
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(authReq.role)) {
      return reply.code(403).send({ 
        code: 'INSUFFICIENT_ROLE',
        message: `Role ${authReq.role} not allowed for this operation` 
      });
    }
  };
}

// Helper function to scope Prisma queries to organization
export function withOrganizationScope(authReq: AuthenticatedRequest, baseWhere: any = {}) {
  if (authReq.authType === 'SAAS_ADMIN') {
    return baseWhere; // No scoping for SaaS admins
  }

  return {
    ...baseWhere,
    organizationId: authReq.organizationId,
  };
}

// Helper function to scope customer queries
export function withCustomerScope(authReq: AuthenticatedRequest, baseWhere: any = {}) {
  if (authReq.authType === 'SAAS_ADMIN') {
    return baseWhere; // No scoping for SaaS admins
  }

  if (authReq.role === 'CUSTOMER') {
    // Customers can only see their own data
    return {
      ...baseWhere,
      customerId: authReq.userId,
    };
  }

  // Organization members can see all customers in their org
  return withOrganizationScope(authReq, baseWhere);
}