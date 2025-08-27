// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

// Organization invitation management routes
const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['TECHNICIAN', 'ORGANIZATION_MANAGER', 'ADMIN']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const createOrganizationSchema = z.object({
  name: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  domain: z.string().optional(),
  ownerFirstName: z.string().min(2),
  ownerLastName: z.string().min(2),
  ownerPassword: z.string().min(8),
});

const provisionCustomerSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  deviceBrand: z.string().optional(),
  deviceModel: z.string().optional(),
  serviceType: z.string().optional(),
});

export async function organizationManagementRoutes(server: FastifyInstance): Promise<void> {
  
  // Create new organization (for SaaS admin only)
  server.post('/organizations', {
    preHandler: async (request, reply) => {
      // Only SaaS admins can create organizations
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type !== 'SAAS_ADMIN' || decoded.role !== 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Only SaaS admins can create organizations' });
        }
        request.userId = decoded.userId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
    schema: {
      description: 'Create new organization (SaaS admin only)',
      tags: ['Organizations'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          contactEmail: { type: 'string', format: 'email' },
          contactPhone: { type: 'string' },
          address: { type: 'string' },
          domain: { type: 'string' },
          ownerFirstName: { type: 'string', minLength: 2 },
          ownerLastName: { type: 'string', minLength: 2 },
          ownerPassword: { type: 'string', minLength: 8 },
        },
        required: ['name', 'contactEmail', 'ownerFirstName', 'ownerLastName', 'ownerPassword'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orgData = createOrganizationSchema.parse(request.body);

      // Generate unique slug from organization name
      const baseSlug = orgData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (await prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Check if owner email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: orgData.contactEmail },
      });

      if (existingUser) {
        return reply.code(409).send({
          code: 'EMAIL_EXISTS',
          message: 'User with this email already exists',
        });
      }

      // Create organization and owner in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create organization
        const organization = await tx.organization.create({
          data: {
            name: orgData.name,
            slug,
            contactEmail: orgData.contactEmail,
            contactPhone: orgData.contactPhone,
            address: orgData.address,
            domain: orgData.domain,
            isActive: true,
            subscriptionTier: 'BASIC',
          },
        });

        // Hash owner password
        const hashedPassword = await bcrypt.hash(orgData.ownerPassword, 12);

        // Create organization owner
        const owner = await tx.user.create({
          data: {
            email: orgData.contactEmail,
            password: hashedPassword,
            firstName: orgData.ownerFirstName,
            lastName: orgData.ownerLastName,
            role: 'ORGANIZATION_OWNER',
            organizationId: organization.id,
            status: 'ACTIVE',
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        });

        return { organization, owner };
      });

      return reply.code(201).send({
        message: 'Organization created successfully',
        organization: result.organization,
        owner: result.owner,
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

  // Invite user to organization (owners and managers only)
  server.post('/organizations/:orgId/invite', {
    preHandler: async (request, reply) => {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type === 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Use organization management interface' });
        }

        const user = await prisma.user.findFirst({
          where: {
            id: decoded.userId,
            organizationId: (request.params as any).orgId,
            role: { in: ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'] },
          },
        });

        if (!user) {
          return reply.code(403).send({ message: 'Insufficient permissions' });
        }

        request.userId = decoded.userId;
        request.organizationId = decoded.organizationId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
    schema: {
      description: 'Invite user to organization',
      tags: ['Organizations'],
      params: {
        type: 'object',
        properties: {
          orgId: { type: 'string' },
        },
        required: ['orgId'],
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['TECHNICIAN', 'ORGANIZATION_MANAGER', 'ADMIN'] },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
        required: ['email', 'role'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as any;
      const inviteData = inviteUserSchema.parse(request.body);

      // Check if user already exists in the organization
      const existingUser = await prisma.user.findFirst({
        where: {
          email: inviteData.email,
          organizationId: orgId,
        },
      });

      if (existingUser) {
        return reply.code(409).send({
          code: 'USER_EXISTS',
          message: 'User already exists in this organization',
        });
      }

      // Check if there's already a pending invitation
      const existingInvitation = await prisma.organizationInvitation.findFirst({
        where: {
          organizationId: orgId,
          email: inviteData.email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvitation) {
        return reply.code(409).send({
          code: 'INVITATION_EXISTS',
          message: 'Pending invitation already exists for this email',
        });
      }

      // Create invitation
      const invitationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const invitation = await prisma.organizationInvitation.create({
        data: {
          organizationId: orgId,
          email: inviteData.email,
          role: inviteData.role,
          invitedBy: (request as any).userId,
          token: invitationToken,
          expiresAt,
        },
        include: {
          organization: {
            select: {
              name: true,
              slug: true,
            },
          },
          inviter: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // In a real implementation, you'd send an email here
      // await sendInvitationEmail(invitation);

      return reply.code(201).send({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          organizationName: invitation.organization.name,
          inviteLink: `${process.env.FRONTEND_URL}/auth/accept-invitation?token=${invitationToken}`,
        },
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

  // Provision customer access (organization members only)
  server.post('/organizations/:orgId/customers', {
    preHandler: async (request, reply) => {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type === 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Use organization interface' });
        }

        const user = await prisma.user.findFirst({
          where: {
            id: decoded.userId,
            organizationId: (request.params as any).orgId,
            role: { in: ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN', 'TECHNICIAN'] },
          },
        });

        if (!user) {
          return reply.code(403).send({ message: 'Insufficient permissions' });
        }

        request.userId = decoded.userId;
        request.organizationId = decoded.organizationId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
    schema: {
      description: 'Provision customer access after job/device submission',
      tags: ['Organizations'],
      params: {
        type: 'object',
        properties: {
          orgId: { type: 'string' },
        },
        required: ['orgId'],
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          firstName: { type: 'string', minLength: 2 },
          lastName: { type: 'string', minLength: 2 },
          password: { type: 'string', minLength: 8 },
          deviceBrand: { type: 'string' },
          deviceModel: { type: 'string' },
          serviceType: { type: 'string' },
        },
        required: ['email', 'firstName', 'lastName', 'password'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as any;
      const customerData = provisionCustomerSchema.parse(request.body);

      // Check if customer already exists
      const existingCustomer = await prisma.user.findFirst({
        where: {
          email: customerData.email,
          organizationId: orgId,
        },
      });

      if (existingCustomer) {
        return reply.code(409).send({
          code: 'CUSTOMER_EXISTS',
          message: 'Customer already exists in this organization',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(customerData.password, 12);

      // Create customer with organization binding and active job status
      const customer = await prisma.user.create({
        data: {
          email: customerData.email,
          password: hashedPassword,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          role: 'CUSTOMER',
          organizationId: orgId,
          hasActiveJobs: true, // Mark as having active service
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

      // Optionally create a device if provided
      if (customerData.deviceBrand && customerData.deviceModel) {
        await prisma.device.create({
          data: {
            brand: customerData.deviceBrand,
            model: customerData.deviceModel,
            category: customerData.serviceType || 'Electronics',
            condition: 'FAIR',
            customerId: customer.id,
          },
        });
      }

      return reply.code(201).send({
        message: 'Customer access provisioned successfully',
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          organization: customer.organization,
          loginUrl: `${process.env.FRONTEND_URL}/auth/customer/login`,
        },
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

  // Get organization invitations (owners and managers only)
  server.get('/organizations/:orgId/invitations', {
    preHandler: async (request, reply) => {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        const user = await prisma.user.findFirst({
          where: {
            id: decoded.userId,
            organizationId: (request.params as any).orgId,
            role: { in: ['ORGANIZATION_OWNER', 'ORGANIZATION_MANAGER', 'ADMIN'] },
          },
        });

        if (!user) {
          return reply.code(403).send({ message: 'Insufficient permissions' });
        }

        request.userId = decoded.userId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orgId } = request.params as any;

      const invitations = await prisma.organizationInvitation.findMany({
        where: {
          organizationId: orgId,
        },
        include: {
          inviter: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        invitations: invitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          status: inv.acceptedAt ? 'ACCEPTED' : (new Date() > inv.expiresAt ? 'EXPIRED' : 'PENDING'),
          expiresAt: inv.expiresAt,
          acceptedAt: inv.acceptedAt,
          invitedBy: inv.inviter,
          createdAt: inv.createdAt,
        })),
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