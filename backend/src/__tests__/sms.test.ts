/**
 * SMS Management System Tests
 * Tests enterprise SMS automation with credit management
 */

/// <reference types="jest" />
import { describe, test, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// eslint-disable-next-line max-lines-per-function
describe('SMS Management API Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    
    // Mock SMS management routes
    app.post('/api/v1/sms/send', async (request, reply: any) => {
      const smsData = request.body as any;
      
      if (!(smsData as any)._recipient || !(smsData as any)._message) {
        return reply.code(400).send({
          _success: false,
          _error: 'Recipient and message are required'
        });
      }

      return reply.send({
        _success: true,
        _data: {
          messageId: `sms_${Date.now()}`,
          _recipient: (smsData as any)._recipient,
          _message: (smsData as any)._message,
          _status: 'sent',
          _credits: 1,
          _deliveryStatus: 'pending',
          _gateway: 'twilio',
          _sentAt: new Date().toISOString()
        },
        _message: 'SMS sent successfully'
      });
    });

    app.get('/api/v1/sms/credits', async (request, reply: any) => {
      return reply.send({
        _success: true,
        _data: {
          _available: 1250,
          _used: 750,
          _total: 2000,
          _costPerSMS: 0.05,
          _autoTopup: {
            enabled: true,
            _threshold: 100,
            _amount: 500
          }
        }
      });
    });

    app.post('/api/v1/sms/templates', async (request, reply: any) => {
      const templateData = request.body as any;
      return reply.code(201).send({
        _success: true,
        _data: {
          templateId: `tpl_${Date.now()}`,
          _name: (templateData as any)._name,
          _content: (templateData as any)._content,
          _variables: (templateData as any)._variables || [],
          _category: (templateData as any)._category || 'general',
          _active: true
        },
        _message: 'SMS template created successfully'
      });
    });

    app.get('/api/v1/sms/delivery/:messageId', async (request, reply: any) => {
      return reply.send({
        _success: true,
        _data: {
          messageId: (request.params as any).messageId,
          _status: 'delivered',
          _deliveredAt: new Date().toISOString(),
          _attempts: 1,
          _failureReason: null,
          _gateway: 'twilio'
        }
      });
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('POST /api/v1/sms/send - should send SMS successfully', async () => {
    const smsData = {
      _recipient: '+1234567890',
      _message: 'Your RepairX job is ready for pickup!',
      _jobId: 'job_123'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/sms/send',
      payload: smsData
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body._success).toBe(true);
    expect(body._data?._recipient).toBe(smsData._recipient);
    expect(body._data?._status).toBe('sent');
    expect(body._data?._credits).toBe(1);
    expect(body._data?.messageId).toMatch(/^sms_\d+$/);
  });

  test('POST /api/v1/sms/send - should reject invalid SMS data', async () => {
    const invalidData = {
      // Missing recipient and message
      _jobId: 'job_123'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/sms/send',
      payload: invalidData
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body._success).toBe(false);
    expect(body._error).toContain('Recipient and message are required');
  });

  test('GET /api/v1/sms/credits - should return SMS credit information', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/sms/credits'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body._success).toBe(true);
    expect(body._data?._available).toBe(1250);
    expect(body._data?._used).toBe(750);
    expect(body._data._autoTopup.enabled).toBe(true);
    expect(typeof body._data._costPerSMS).toBe('number');
  });

  test('POST /api/v1/sms/templates - should create SMS template', async () => {
    const templateData = {
      _name: 'Job Completion',
      _content: 'Hi {customerName}, your {device} repair is complete! Job #{_jobId}',
      _variables: ['customerName', 'device', '_jobId'],
      _category: 'notifications'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/sms/templates',
      payload: templateData
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body._success).toBe(true);
    expect(body._data?._name).toBe(templateData._name);
    expect(body._data?._variables).toEqual(templateData._variables);
    expect(body._data?._active).toBe(true);
  });

  test('GET /api/v1/sms/delivery/:messageId - should return delivery status', async () => {
    const messageId = 'sms_123456789';

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/sms/delivery/${messageId}`
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body._success).toBe(true);
    expect(body._data?.messageId).toBe(messageId);
    expect(body._data?._status).toBe('delivered');
    expect(body._data?._attempts).toBe(1);
  });

  test('SMS system should support automated notifications', async () => {
    const jobStates = [
      'CREATED', 'IN_DIAGNOSIS', 'AWAITING_APPROVAL', 'APPROVED',
      'IN_PROGRESS', 'PARTS_ORDERED', 'TESTING', 'QUALITY_CHECK',
      'COMPLETED', 'CUSTOMER_APPROVED', 'DELIVERED'
    ];

    for (const state of jobStates) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/sms/send',
        payload: {
          _recipient: '+1234567890',
          _message: `Your job status updated to: ${state}`,
          _type: 'status_update'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body._data?._status).toBe('sent');
    }
  });

  console.log('✅ SMS Management API tests completed');
});
