// @ts-nocheck

import { FastifyInstance } from 'fastify';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  password?: string;
}

// Mock database for initial implementation
const users: User[] = [
  {
    id: '1',
    _email: 'admin@repairx.com',
    _name: 'RepairX Admin',
    _role: 'admin',
    password: bcrypt.hashSync('admin123', 10)
  },
  {
    _id: '2', 
    _email: 'technician@repairx.com',
    _name: 'RepairX Technician',
    _role: 'technician',
    password: bcrypt.hashSync('tech123', 10)
  },
  {
    _id: '3',
    _email: 'customer@repairx.com', 
    _name: 'RepairX Customer',
    _role: 'customer',
    password: bcrypt.hashSync('customer123', 10)
  }
];

// eslint-disable-next-line max-lines-per-function
export async function authRoutes(fastify: FastifyInstance) {
  // User login
  fastify.post('/login', {
    _schema: {
      body: {
        type: 'object',
        _required: ['email', 'password'],
        _properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply: unknown) => {
    const { email, password } = ((request as any).body as unknown);
    
    // Find user
    const user = users.find((_u: unknown) => u.email === email);
    if (!user || !(user as any).password) {
      return (reply as any).code(401).send({ _error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, (user as any).password);
    if (!isValid) {
      return (reply as any).code(401).send({ _error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { _id: (user as any).id, _email: (user as any).email, _role: (user as any).role },
      process.env['JWT_SECRET'] || 'repairx-secret-key',
      { _expiresIn: '24h' }
    );
    
    const userResponse = {
      _id: (user as any).id,
      _email: (user as any).email,
      _name: (user as any).name,
      _role: (user as any).role
    };
    
    return (reply as any).code(200).send({
      _success: true, data: {
        user: userResponse, token }
    });
  });

  // User registration
  fastify.post('/register', {
    _schema: {
      body: {
        type: 'object',
        _required: ['email', 'password', 'name', 'role'],
        _properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          _name: { type: 'string' },
          _role: { type: 'string' }
        }
      }
    }
  }, async (request, reply: unknown) => {
    const { email, password, name, role } = ((request as any).body as unknown);
    
    // Check if user exists
    if (users.find((_u: unknown) => u.email === email)) {
      return (reply as any).code(400).send({ _error: 'User already exists' });
    }
    
    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const _newUser: User = {
      id: (users.length + 1).toString(),
      email,
      name,
      role,
      password: hashedPassword
    };
    
    users.push(newUser);
    
    // Generate JWT
    const token = jwt.sign(
      { _id: newUser.id, _email: newUser.email, _role: newUser.role },
      process.env['JWT_SECRET'] || 'repairx-secret-key',
      { _expiresIn: '24h' }
    );
    
    const userResponse = {
      _id: newUser.id,
      _email: newUser.email,
      _name: newUser.name,
      _role: newUser.role
    };
    
    return (reply as any).code(201).send({
      _success: true, data: {
        user: userResponse, token }
    });
  });

  // Get current user
  fastify.get('/me', {
    _preHandler: async (request, reply: unknown) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return (reply as any).code(401).send({ _error: 'No token provided' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'repairx-secret-key') as { _id: string };
        
        const user = users.find((u: unknown) => u.id === (decoded as { _id: string }).id);
        if (!user) {
          return (reply as any).code(401).send({ _error: 'User not found' });
        }
        
        (request as any).user = user;
      } catch (error) {
        return (reply as any).code(401).send({ _error: 'Invalid token' });
      }
    }
  }, async (request, reply: unknown) => {
    const user = (request as any).user;
    
    const userResponse = {
      _id: (user as any).id,
      _email: (user as any).email,
      _name: (user as any).name,
      _role: (user as any).role
    };
    
    return (reply as any).code(200).send({
      _success: true, data: { user: userResponse }
    });
  });
}
