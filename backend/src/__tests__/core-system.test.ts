 
/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';

import { fastify } from '../index';

// eslint-disable-next-line max-lines-per-function
describe('RepairX Core System Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('Health Endpoints', () => {
    test('should return healthy status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.services?.api).toBe('operational');
    });

    test('should return quality metrics', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/metrics'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.defectRate).toBe(0);
      expect(body.compliance?.sixSigma).toBe(true);
    });
  });

  describe('Authentication', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/auth/login',
        _payload: {
          email: 'admin@repairx.com',
          password: 'admin123'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect((body.data as any).user.role).toBe('admin');
      expect(body.data?.token).toBeDefined();
    });

    test('should reject invalid credentials', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/auth/login',
        _payload: {
          email: 'invalid@repairx.com',
          password: 'wrongpass'
        }
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Invalid credentials');
    });
  });

  describe('Business Settings', () => {
    test('should get business categories', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/business/categories'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data?.length).toBeGreaterThan(0);
    });

    test('should get tax settings', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/business/settings/tax'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('should get quality metrics', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/business/quality-metrics'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.defectRate).toBe(0);
      expect(body.data.compliance.sixSigma).toBe(true);
    });
  });
});
