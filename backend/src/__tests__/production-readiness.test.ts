// Production Readiness Test Suite
// Tests core repair service functionality and production quality

/// <reference types="jest" />
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { fastify } from '../index';

describe('Production Readiness Tests', () => {
  beforeAll(async () => {
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('Core Service Health', () => {
    test('should have healthy API endpoints', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
    });

    test('should handle production workflow transitions', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/workflow/transition',
        payload: {
          jobId: 'test-job-123',
          fromState: 'CREATED',
          toState: 'IN_DIAGNOSIS'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.newState).toBe('IN_DIAGNOSIS');
    });

    test('should provide field operations functionality', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/field/optimize-routes',
        payload: {
          technicianId: 'tech-123',
          jobIds: ['job-1', 'job-2']
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.optimizedRoute).toBeDefined();
    });

    test('should track GPS for technicians', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/field/gps/tech-123'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.currentLocation).toBeDefined();
    });
  });

  describe('Production Health Metrics', () => {
    test('should provide comprehensive health status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/production/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('healthy');
      expect(body.data.services).toBeDefined();
      expect(body.data.metrics).toBeDefined();
      expect(body.data.features).toBeDefined();
    });
  });

  describe('API Response Quality', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await fastify.inject({
        method: 'GET',
        url: '/api/health'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200); // Should respond in under 200ms
    });

    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        fastify.inject({
          method: 'GET',
          url: '/api/health'
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      expect(responses.length).toBe(5);
      expect(totalTime).toBeLessThan(1000);
      
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe('Data Integrity', () => {
    test('should maintain consistent API response formats', async () => {
      const healthResponse = await fastify.inject({
        method: 'GET',
        url: '/api/health'
      });

      const healthBody = JSON.parse(healthResponse.body);
      expect(typeof healthBody.status).toBe('string');
      expect(healthBody.timestamp).toBeDefined();

      const productionHealthResponse = await fastify.inject({
        method: 'GET',
        url: '/api/v1/production/health'
      });

      const prodHealthBody = JSON.parse(productionHealthResponse.body);
      expect(typeof prodHealthBody.success).toBe('boolean');
      expect(prodHealthBody.data).toBeDefined();
    });
  });
});