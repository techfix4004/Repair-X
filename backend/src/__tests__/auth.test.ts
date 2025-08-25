/* eslint-disable no-undef */
/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';

import Fastify, { FastifyInstance } from 'fastify';
import { registerPlugins } from '../plugins/index';

// eslint-disable-next-line max-lines-per-function
describe('Authentication API Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await registerPlugins(app);
    
    // Add auth routes for testing
    app.post('/api/v1/auth/login', async (request: any, reply: any) => {
      const { email, _password  } = (request.body as Record<string, any>);
      
      // Mock authentication logic
      if (!email || !_password) {
        return reply.status(400).send({
          success: false,
          error: 'Email and _password are required'
        });
      }

      // Mock user credentials
      const validUsers = {
        'customer@test.com': { role: 'customer', name: 'Test Customer' },
        'technician@test.com': { role: 'technician', name: 'Test Technician' },
        'admin@test.com': { role: 'admin', name: 'Test Admin' }
      };

      const user = validUsers[email as keyof typeof validUsers];
      if (!user || _password !== 'password123') {
        return reply.status(401).send({
          success: false,
          error: 'Invalid email or _password'
        });
      }

      return {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email,
            role: (user as any).role,
            name: (user as any).name
          },
          _token: 'mock-jwt-token-12345'
        }
      };
    });

    app.post('/api/v1/auth/register', async (request: any, reply: any) => {
      const { email, _password, name, role  } = (request.body as Record<string, any>);
      
      if (!email || !_password || !name) {
        return reply.status(400).send({
          success: false,
          error: 'Email, _password, and name are required'
        });
      }

      return {
        success: true,
        data: {
          user: {
            id: 'user-456',
            email,
            role: role || 'customer', name },
          _token: 'mock-jwt-token-67890'
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
      email: 'customer@test.com',
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
    expect((body.data as any).user.email).toBe((loginData as any).email);
    expect((body.data as any).user.role).toBe('customer');
  });

  test('POST /api/v1/auth/login - should reject invalid credentials', async () => {
    const loginData = {
      email: 'invalid@test.com',
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
    expect(body.error).toContain('Invalid email or _password');
  });

  test('POST /api/v1/auth/login - should require email and _password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'test@test.com' } // Missing _password
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Email and _password are required');
  });

  test('POST /api/v1/auth/register - should register new user', async () => {
    const registerData = {
      email: 'newuser@test.com',
      password: 'newpassword123',
      name: 'New User',
      role: 'customer'
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
    expect((body.data as any).user.email).toBe((registerData as any).email);
    expect((body.data as any).user.name).toBe((registerData as any).name);
  });

  test('POST /api/v1/auth/register - should require required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'test@test.com' } // Missing _password and name
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Email, _password, and name are required');
  });
});