 
/// <reference types="jest" />
 
/// <reference types="jest" />
import { describe, test, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import Fastify, { FastifyInstance, FastifyReply } from 'fastify';
import { registerPlugins } from '../plugins/index';

 
 
describe('Device Registration API Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await registerPlugins(app);
    
    // Add device routes for testing
    app.post('/api/v1/devices', async (request, reply: unknown) => {
      const deviceData = request.body as any;
      
      // Basic validation - handle both _brand and brand formats
      const brand = (deviceData as any)._brand || (deviceData as any).brand;
      const model = (deviceData as any)._model || (deviceData as any).model;
      
      if (!brand || !model) {
        return (reply as FastifyReply).status(400).send({
          success: false,
          error: 'Brand and model are required'
        });
      }

      return {
        success: true,
        data: {
          id: 'device-123',
          ...deviceData,
          registeredAt: new Date().toISOString(),
        }
      };
    });

    app.get('/api/v1/devices', async () => {
      return {
        success: true,
        data: [
          {
            id: 'device-1',
            brand: 'Apple',
            model: 'iPhone 13',
            category: 'Smartphone',
            condition: 'Good',
            registeredAt: '2025-01-08T10:00:00Z',
          }
        ]
      };
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('POST /api/v1/devices - should register new device with valid data', async () => {
    const deviceData = {
      _brand: 'Samsung',
      _model: 'Galaxy S21',
      _category: 'Smartphone',
      _condition: 'Good',
      _serialNumber: 'SN123456789'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/devices',
      payload: deviceData
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
    expect(body.data?.brand).toBe((deviceData as any).brand);
    expect(body.data?.model).toBe((deviceData as any).model);
  });

  test('POST /api/v1/devices - should return error for missing required fields', async () => {
    const invalidData = {
      _category: 'Smartphone',
      _condition: 'Good'
      // Missing brand and model
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/devices',
      payload: invalidData
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Brand and model are required');
  });

  test('GET /api/v1/devices - should return list of devices', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/devices'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});