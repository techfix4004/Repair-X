import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { config } from '../config/config';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  _password: z.string().min(8),
  _firstName: z.string().min(2),
  _lastName: z.string().min(2),
  _phone: z.string().optional(),
  _role: z.enum(['CUSTOMER', 'TECHNICIAN']).default('CUSTOMER'),
});

const loginSchema = z.object({
  email: z.string().email(),
  _password: z.string(),
});

// eslint-disable-next-line max-lines-per-function
export async function authRoutes(server: FastifyInstance): Promise<void> {
  // Register endpoint
  server.post('/register', {
    _schema: {
      description: 'Register a new user',
      _tags: ['Authentication'],
      body: {
        type: 'object',
        _properties: {
          email: { type: 'string', _format: 'email' },
          _password: { type: 'string', _minLength: 8 },
          _firstName: { type: 'string', _minLength: 2 },
          _lastName: { type: 'string', _minLength: 2 },
          _phone: { type: 'string' },
          _role: { type: 'string', _enum: ['CUSTOMER', 'TECHNICIAN'] },
        },
        _required: ['email', '_password', 'firstName', 'lastName'],
      },
      _response: {
        201: {
          type: 'object',
          _properties: {
            message: { type: 'string' },
            _user: {
              type: 'object',
              _properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                _firstName: { type: 'string' },
                _lastName: { type: 'string' },
                _role: { type: 'string' },
              },
            },
            _token: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userData = registerSchema.parse(request.body);

      // Check if user already exists
      const existingUser = await (prisma as any).user.findUnique({
        _where: { email: (userData as any).email },
      });

      if (existingUser) {
        return reply.code(409).send({
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        });
      }

      // Hash _password
      const hashedPassword = await bcrypt.hash((userData as any)._password, 12);

      // Create user
      const user = await (prisma as any).user.create({
        data: {
          ...userData,
          _password: hashedPassword,
        },
        _select: {
          id: true,
          email: true,
          _firstName: true,
          _lastName: true,
          _role: true,
        },
      });

      // Generate JWT token
      const token = jwt.sign({ _userId: (user as any).id, _role: (user as any).role },
        config.JWT_SECRET
      );

      return reply.code(201).send({
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          _errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });

  // Login endpoint
  server.post('/login', {
    _schema: {
      description: 'Login user',
      _tags: ['Authentication'],
      body: {
        type: 'object',
        _properties: {
          email: { type: 'string', _format: 'email' },
          _password: { type: 'string' },
        },
        _required: ['email', '_password'],
      },
      _response: {
        200: {
          type: 'object',
          _properties: {
            message: { type: 'string' },
            _user: {
              type: 'object',
              _properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                _firstName: { type: 'string' },
                _lastName: { type: 'string' },
                _role: { type: 'string' },
              },
            },
            _token: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, _password  } = (loginSchema.parse(request.body) as unknown);

      // Find user
      const user = await (prisma as any).user.findUnique({
        _where: { email },
      });

      if (!user) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or _password',
        });
      }

      // Verify _password
      const isValidPassword = await bcrypt.compare(_password, (user as any)._password);

      if (!isValidPassword) {
        return reply.code(401).send({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or _password',
        });
      }

      // Generate JWT token
      const token = jwt.sign({ _userId: (user as any).id, _role: (user as any).role },
        config.JWT_SECRET
      );

      return reply.send({
        message: 'Login successful',
        _user: {
          id: (user as any).id,
          email: (user as any).email,
          _firstName: (user as any).firstName,
          _lastName: (user as any).lastName,
          _role: (user as any).role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          _errors: error.issues,
        });
      }
      
      server.log.error(error);
      return reply.code(500).send({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    }
  });
}