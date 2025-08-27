// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { config } from '../config/config';

// Validation schemas for SaaS Admin
const saasAdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  adminKey: z.string().min(10), // Special admin access key
});

// SaaS Admin routes - only accessible via dedicated backend endpoint
export async function saasAdminAuthRoutes(server: FastifyInstance): Promise<void> {
  // SaaS Admin Login - separate from regular user authentication
  server.post('/saas-admin/login', {
    schema: {
      description: 'SaaS Admin login - platform administration only',
      tags: ['SaaS Admin'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          adminKey: { type: 'string', minLength: 10 },
        },
        required: ['email', 'password', 'adminKey'],
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
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, adminKey } = saasAdminLoginSchema.parse(request.body);

      // Verify admin access key
      const expectedAdminKey = config.SAAS_ADMIN_KEY || process.env.SAAS_ADMIN_KEY;
      if (!expectedAdminKey || adminKey !== expectedAdminKey) {
        return reply.code(401).send({
          code: 'INVALID_ADMIN_KEY',
          message: 'Invalid SaaS admin access key',
        });
      }

      // Find SaaS admin user (must have SAAS_ADMIN role and no organization)
      const user = await prisma.user.findFirst({
        where: {
          email,
          role: 'SAAS_ADMIN',
          organizationId: null, // SaaS admins are not bound to any organization
        },
      });

      if (!user) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid SaaS admin credentials',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid SaaS admin credentials',
        });
      }

      // Generate JWT token with special SaaS admin permissions
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          type: 'SAAS_ADMIN',
          organizationId: null, // SaaS admins have no org restriction
        },
        config.JWT_SECRET,
        { expiresIn: '8h' } // Shorter session for admin
      );

      return reply.send({
        message: 'SaaS Admin login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
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

  // SaaS Admin token refresh
  server.post('/saas-admin/refresh', {
    preHandler: async (request, reply) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return reply.code(401).send({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        if (decoded.type !== 'SAAS_ADMIN' || decoded.role !== 'SAAS_ADMIN') {
          return reply.code(403).send({ message: 'Invalid admin token' });
        }

        request.userId = decoded.userId;
      } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: (request as any).userId,
          role: 'SAAS_ADMIN',
          organizationId: null,
        },
      });

      if (!user) {
        return reply.code(401).send({ message: 'User not found' });
      }

      const newToken = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          type: 'SAAS_ADMIN',
          organizationId: null,
        },
        config.JWT_SECRET,
        { expiresIn: '8h' }
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

  // Create initial SaaS admin (only if none exist)
  server.post('/saas-admin/initialize', {
    schema: {
      description: 'Initialize first SaaS admin - only works if no SaaS admins exist',
      tags: ['SaaS Admin'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          masterKey: { type: 'string' }, // Master initialization key
        },
        required: ['email', 'password', 'firstName', 'lastName', 'masterKey'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, firstName, lastName, masterKey } = request.body as any;

      // Verify master initialization key
      const expectedMasterKey = config.MASTER_INIT_KEY || process.env.MASTER_INIT_KEY;
      if (!expectedMasterKey || masterKey !== expectedMasterKey) {
        return reply.code(401).send({
          code: 'INVALID_MASTER_KEY',
          message: 'Invalid master initialization key',
        });
      }

      // Check if any SaaS admin already exists
      const existingSaasAdmin = await prisma.user.findFirst({
        where: { role: 'SAAS_ADMIN' },
      });

      if (existingSaasAdmin) {
        return reply.code(409).send({
          code: 'ADMIN_EXISTS',
          message: 'SaaS admin already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create SaaS admin
      const saasAdmin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'SAAS_ADMIN',
          organizationId: null, // SaaS admins are not bound to organizations
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

      return reply.code(201).send({
        message: 'SaaS admin created successfully',
        user: saasAdmin,
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