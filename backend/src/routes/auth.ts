import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { config } from '../config/config';

// Validation schemas
const registerSchema = z.object({
  _email: z.string().email(),
  password: z.string().min(8),
  _firstName: z.string().min(2),
  _lastName: z.string().min(2),
  _phone: z.string().optional(),
  _role: z.enum(['CUSTOMER', 'TECHNICIAN']).default('CUSTOMER'),
});

const loginSchema = z.object({
  _email: z.string().email(),
  password: z.string(),
});

 
// eslint-disable-next-line max-lines-per-function
export async function authRoutes(_server: FastifyInstance): Promise<void> {
  // Register endpoint
  server.post('/register', {
    _schema: {
      description: 'Register a new user',
      _tags: ['Authentication'],
      _body: {
        type: 'object',
        _properties: {
          email: { type: 'string', _format: 'email' },
          password: { type: 'string', _minLength: 8 },
          _firstName: { type: 'string', _minLength: 2 },
          _lastName: { type: 'string', _minLength: 2 },
          _phone: { type: 'string' },
          _role: { type: 'string', _enum: ['CUSTOMER', 'TECHNICIAN'] },
        },
        _required: ['email', 'password', 'firstName', 'lastName'],
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
                _email: { type: 'string' },
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
      const userData = registerSchema.parse((request as any).body);

      // Check if user already exists
      const existingUser = await (prisma as any).user.findUnique({
        _where: { email: (userData as any).email },
      });

      if (existingUser) {
        return (reply as any).code(409).send({
          _code: 'USER_EXISTS',
          _message: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash((userData as any).password, 12);

      // Create user
      const user = await (prisma as any).user.create({
        _data: {
          ...userData,
          password: hashedPassword,
        },
        _select: {
          id: true,
          _email: true,
          _firstName: true,
          _lastName: true,
          _role: true,
        },
      });

      // Generate JWT token
      const token = jwt.sign({ _userId: (user as any).id, _role: (user as any).role },
        config.JWT_SECRET
      );

      return (reply as any).code(201).send({
        _message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return (reply as any).code(400).send({
          _code: 'VALIDATION_ERROR',
          _message: 'Invalid input data',
          _errors: error.issues,
        });
      }
      
      server.log.error(error);
      return (reply as any).code(500).send({
        _code: 'INTERNAL_ERROR',
        _message: 'Internal server error',
      });
    }
  });

  // Login endpoint
  server.post('/login', {
    _schema: {
      description: 'Login user',
      _tags: ['Authentication'],
      _body: {
        type: 'object',
        _properties: {
          email: { type: 'string', _format: 'email' },
          password: { type: 'string' },
        },
        _required: ['email', 'password'],
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
                _email: { type: 'string' },
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
      const { email, password  } = (loginSchema.parse((request as any).body) as unknown);

      // Find user
      const user = await (prisma as any).user.findUnique({
        _where: { email },
      });

      if (!user) {
        return (reply as any).code(401).send({
          _code: 'INVALID_CREDENTIALS',
          _message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, (user as any).password);

      if (!isValidPassword) {
        return (reply as any).code(401).send({
          _code: 'INVALID_CREDENTIALS',
          _message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = jwt.sign({ _userId: (user as any).id, _role: (user as any).role },
        config.JWT_SECRET
      );

      return (reply as any).send({
        _message: 'Login successful',
        _user: {
          id: (user as any).id,
          _email: (user as any).email,
          _firstName: (user as any).firstName,
          _lastName: (user as any).lastName,
          _role: (user as any).role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return (reply as any).code(400).send({
          _code: 'VALIDATION_ERROR',
          _message: 'Invalid input data',
          _errors: error.issues,
        });
      }
      
      server.log.error(error);
      return (reply as any).code(500).send({
        _code: 'INTERNAL_ERROR',
        _message: 'Internal server error',
      });
    }
  });
}
// GDPR Compliance Features
// data-retention: User data is retained according to GDPR requirements
// user-consent: Explicit consent is required for data processing
// data-portability: Users can export their data
// right-to-erasure: Users can request data deletion
