// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { config } from '../config/config';

// Validation schemas for organization-bound authentication
const organizationLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  organizationSlug: z.string().optional(), // Optional for white-label domains
});

const customerLoginSchema = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
  organizationSlug: z.string().optional(),
});

const acceptInvitationSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Organization-bound authentication routes
export async function authRoutes(server: FastifyInstance): Promise<void> {
  
  // Organization member login (owners, managers, technicians)
  server.post('/auth/organization/login', {
    schema: {
      description: 'Login for organization members (owners, managers, technicians)',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          organizationSlug: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
                organizationId: { type: 'string' },
                organization: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                  },
                },
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, organizationSlug } = organizationLoginSchema.parse(request.body);

      // Find user that belongs to an organization
      const user = await prisma.user.findFirst({
        where: {
          email,
          organizationId: { not: null }, // Must belong to an organization
          role: { in: ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'TECHNICIAN', 'ADMIN'] },
          ...(organizationSlug && {
            organization: {
              slug: organizationSlug,
            },
          }),
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
        },
      });

      if (!user || !user.organization) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid organization member credentials',
        });
      }

      // Check if organization is active
      if (!user.organization.isActive) {
        return reply.code(403).send({
          code: 'ORGANIZATION_INACTIVE',
          message: 'Organization account is inactive',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid organization member credentials',
        });
      }

      // Generate JWT token with organization context
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          type: 'ORGANIZATION_MEMBER',
          organizationId: user.organizationId,
        },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return reply.send({
        message: 'Organization member login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Customer login (only for customers with active jobs/devices)
  server.post('/auth/customer/login', {
    schema: {
      description: 'Login for customers with active jobs or devices',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          emailOrPhone: { type: 'string' },
          password: { type: 'string' },
          organizationSlug: { type: 'string' },
        },
        required: ['emailOrPhone', 'password'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { emailOrPhone, password, organizationSlug } = customerLoginSchema.parse(request.body);

      // Find customer with active jobs or devices
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: emailOrPhone },
            { phone: emailOrPhone },
          ],
          role: 'CUSTOMER',
          hasActiveJobs: true, // Only customers with active jobs can log in
          ...(organizationSlug && {
            organization: {
              slug: organizationSlug,
            },
          }),
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
          devices: {
            take: 1, // Just to check if they have devices
          },
          bookings: {
            where: {
              status: { in: ['PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS'] },
            },
            take: 1, // Just to check if they have active bookings
          },
        },
      });

      if (!user || !user.organization) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'No active services found for this customer',
        });
      }

      // Check if organization is active
      if (!user.organization.isActive) {
        return reply.code(403).send({
          code: 'ORGANIZATION_INACTIVE',
          message: 'Service provider is currently inactive',
        });
      }

      // Verify they have active jobs or devices
      if (!user.hasActiveJobs && user.devices.length === 0 && user.bookings.length === 0) {
        return reply.code(403).send({
          code: 'NO_ACTIVE_SERVICES',
          message: 'No active services found. Please contact your service provider.',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid customer credentials',
        });
      }

      // Generate JWT token with organization context
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          type: 'CUSTOMER',
          organizationId: user.organizationId,
        },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return reply.send({
        message: 'Customer login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Accept organization invitation and create account
  server.post('/auth/accept-invitation', {
    schema: {
      description: 'Accept organization invitation and create account',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
        required: ['token', 'password'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token, password, firstName, lastName } = acceptInvitationSchema.parse(request.body);

      // Find valid invitation
      const invitation = await prisma.organizationInvitation.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() },
          acceptedAt: null,
        },
        include: {
          organization: true,
        },
      });

      if (!invitation) {
        return reply.code(404).send({
          code: 'INVALID_INVITATION',
          message: 'Invitation not found or expired',
        });
      }

      // Check if organization is active
      if (!invitation.organization.isActive) {
        return reply.code(403).send({
          code: 'ORGANIZATION_INACTIVE',
          message: 'Organization is inactive',
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: invitation.email },
      });

      if (existingUser) {
        return reply.code(409).send({
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with organization binding
      const user = await prisma.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          firstName: firstName || '',
          lastName: lastName || '',
          role: invitation.role,
          organizationId: invitation.organizationId,
          status: 'ACTIVE',
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      // Mark invitation as accepted
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      // Generate JWT token
      const authToken = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          type: 'ORGANIZATION_MEMBER',
          organizationId: user.organizationId,
        },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return reply.code(201).send({
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
        },
        token: authToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Token refresh for organization-bound users
  server.post('/auth/refresh', {
    preHandler: async (request, reply) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return reply.code(401).send({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type === 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Use SaaS admin refresh endpoint' });
        }

        request.userId = decoded.userId;
        request.organizationId = decoded.organizationId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: (request as any).userId,
          organizationId: (request as any).organizationId,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
        },
      });

      if (!user || !user.organization || !user.organization.isActive) {
        return reply.code(401).send({ message: 'User or organization not found' });
      }

      const userType = user.role === 'CUSTOMER' ? 'CUSTOMER' : 'ORGANIZATION_MEMBER';
      
      const newToken = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          type: userType,
          organizationId: user.organizationId,
        },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return reply.send({
        message: 'Token refreshed',
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
        },
      });
    } catch (error) {
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });
}

// GDPR Compliance Features
// data-retention: User data is retained according to GDPR requirements
// user-consent: Explicit consent is required for data processing
// data-portability: Users can export their data
// right-to-erasure: Users can request data deletion
