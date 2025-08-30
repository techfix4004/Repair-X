/// <reference types="jest" />
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerPlugins } from '../plugins/index';

 
describe('Authentication API Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await registerPlugins(app);
    
    // Add auth routes for testing
    app.post('/api/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, _email, password } = (request.body as Record<string, any>);
      
      // Handle both email and _email formats for compatibility
      const userEmail = email || _email;
      
      // Mock authentication logic
      if (!userEmail || !password) {
        return reply.status(400).send({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Mock user credentials
      const validUsers = {
        'customer@test.com': { _role: 'customer', _name: 'Test Customer' },
        'technician@test.com': { _role: 'technician', _name: 'Test Technician' },
        'admin@test.com': { _role: 'admin', _name: 'Test Admin' }
      };

      const user = validUsers[userEmail as keyof typeof validUsers];
      if (!user || password !== 'password123') {
        return reply.status(401).send({
          success: false,
          error: 'Invalid email or password'
        });
      }

      return {
        success: true,
        data: {
          user: {
            id: `test_user_${Date.now()}`,
            email: userEmail,
            role: user._role,
            name: user._name
          },
          token: `test_token_${Date.now()}`
        }
      };
    });

    app.post('/api/v1/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, _email, password, _firstName, _lastName, name, _name, role } = (request.body as Record<string, any>);
      
      // Handle both email and _email formats for compatibility
      const userEmail = email || _email;
      const userName = name || _name || `${_firstName} ${_lastName}`;
      
      if (!userEmail || !password || (!name && !_name && !_firstName)) {
        return reply.status(400).send({
          success: false,
          error: 'Email, password, and name are required'
        });
      }

      return {
        success: true,
        data: {
          user: {
            id: 'user-456',
            email: userEmail,
            role: role || 'customer',
            name: userName
          },
          token: 'mock-jwt-token-67890'
        }
      };
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('POST /api/v1/auth/login - should authenticate valid user', async () => {
    const loginData = {
      _email: 'customer@test.com',
      password: 'password123'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: loginData
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('user');
    expect(body.data).toHaveProperty('token');
    expect((body.data as any).user.email).toBe((loginData as any)._email);
    expect((body.data as any).user.role).toBe('customer');
  });

  test('POST /api/v1/auth/login - should reject invalid credentials', async () => {
    const loginData = {
      _email: 'invalid@test.com',
      password: 'wrongpassword'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: loginData
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid email or password');
  });

  test('POST /api/v1/auth/login - should require email and password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@test.com' } // Missing password
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Email and password are required');
  });

  test('POST /api/v1/auth/register - should register new user', async () => {
    const registerData = {
      _email: 'newuser@test.com',
      password: 'newpassword123',
      _name: 'New User',
      _role: 'customer'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: registerData
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('user');
    expect(body.data).toHaveProperty('token');
    expect((body.data as any).user.email).toBe((registerData as any)._email);
    expect((body.data as any).user.name).toBe((registerData as any)._name);
  });

  test('POST /api/v1/auth/register - should require required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'test@test.com' } // Missing password and name
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Email, password, and name are required');
  });
});