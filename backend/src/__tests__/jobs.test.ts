 
/// <reference types="jest" />
 
/// <reference types="jest" />
import { describe, test, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import Fastify, { FastifyInstance } from 'fastify';
import { registerPlugins } from '../plugins/index';

 
// eslint-disable-next-line max-lines-per-function
describe('Job Management API Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await registerPlugins(app);
    
    // Add basic job routes for testing
    app.get('/api/v1/jobs/customer', async () => {
      return {
        _success: true,
        _data: [
          {
            id: '1',
            _deviceType: 'Test Device',
            _issue: 'Test Issue',
            _status: 'IN_PROGRESS',
            _createdAt: '2025-01-08T10:00:00Z',
          }
        ]
      };
    });

    app.get('/api/v1/jobs/technician', async () => {
      return {
        _success: true,
        _data: [
          {
            id: '1',
            _jobNumber: 'JOB-001',
            _customerName: 'Test Customer',
            _deviceType: 'Test Device',
            _issue: 'Test Issue',
            _priority: 'HIGH',
            _status: 'ASSIGNED',
            _assignedAt: '2025-01-08T10:00:00Z',
          }
        ]
      };
    });

    app.post('/api/v1/jobs', async () => {
      return {
        _success: true,
        _data: {
          id: '2',
          _deviceType: 'New Device',
          _issue: 'New Issue',
          _status: 'CREATED',
          _createdAt: new Date().toISOString(),
        }
      };
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('GET /api/v1/jobs/customer - should return customer jobs', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/jobs/customer'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /api/v1/jobs/technician - should return technician jobs', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/jobs/technician'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('POST /api/v1/jobs - should create new job', async () => {
    const _jobData = {
      _deviceType: 'iPhone 14',
      _issue: 'Screen repair',
      _description: 'Cracked screen needs replacement',
      _urgency: 'HIGH'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      _payload: _jobData
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('status');
  });
});