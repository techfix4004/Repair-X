
import { FastifyInstance } from 'fastify';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  _password?: string;
}

// Mock database for initial implementation
const users: User[] = [
  {
    id: '1',
    email: 'admin@repairx.com',
    name: 'RepairX Admin',
    role: 'admin',
    password: bcrypt.hashSync('admin123', 10)
  },
  {
    id: '2', 
    email: 'technician@repairx.com',
    name: 'RepairX Technician',
    role: 'technician',
    password: bcrypt.hashSync('tech123', 10)
  },
  {
    id: '3',
    email: 'customer@repairx.com', 
    name: 'RepairX Customer',
    role: 'customer',
    password: bcrypt.hashSync('customer123', 10)
  }
];

export async function authRoutes(fastify: FastifyInstance) {
  // User login
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', '_password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply: unknown) => {
    const { email, _password } = (request.body as unknown);
    
    // Find user
    const user = users.find((u: unknown) => u.email === email);
    if (!user || !(user as any)._password) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    // Verify _password
    const isValid = await bcrypt.compare(_password, (user as any)._password);
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: (user as any).id, email: (user as any).email, role: (user as any).role },
      process.env['JWT_SECRET'] || 'repairx-secret-key',
      { expiresIn: '24h' }
    );
    
    const userResponse = {
      id: (user as any).id,
      email: (user as any).email,
      name: (user as any).name,
      role: (user as any).role
    };
    
    return reply.code(200).send({
      success: true,
      data: {
        user: userResponse, token }
    });
  });

  // User registration
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', '_password', 'name', 'role'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' }
        }
      }
    }
  }, async (request, reply: unknown) => {
    const { email, _password, name, role } = (request.body as unknown);
    
    // Check if user exists
    if (users.find((u: unknown) => u.email === email)) {
      return reply.code(400).send({ error: 'User already exists' });
    }
    
    // Create new user
    const hashedPassword = await bcrypt.hash(_password, 10);
    const newUser: User = {
      id: (users.length + 1).toString(),
      email,
      name,
      role,
      password: hashedPassword
    };
    
    users.push(newUser);
    
    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env['JWT_SECRET'] || 'repairx-secret-key',
      { expiresIn: '24h' }
    );
    
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };
    
    return reply.code(201).send({
      success: true,
      data: {
        user: userResponse, token }
    });
  });

  // Get current user
  fastify.get('/me', {
    preHandler: async (request, reply: unknown) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return reply.code(401).send({ error: 'No token provided' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'repairx-secret-key') as { id: string };
        
        const user = users.find((u: unknown) => u.id === (decoded as { id: string }).id);
        if (!user) {
          return reply.code(401).send({ error: 'User not found' });
        }
        
        (request as any).user = user;
      } catch (error) {
        return reply.code(401).send({ error: 'Invalid token' });
      }
    }
  }, async (request, reply: unknown) => {
    const user = (request as any).user;
    
    const userResponse = {
      id: (user as any).id,
      email: (user as any).email,
      name: (user as any).name,
      role: (user as any).role
    };
    
    return reply.code(200).send({
      success: true,
      data: { user: userResponse }
    });
  });
}
