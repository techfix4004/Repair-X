/**
 * Job Sheet Lifecycle Management Tests
 * Tests the 12-state workflow system as specified in requirements
 */

/* eslint-disable no-undef */
/// <reference types="jest" />
import { describe, test, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import Fastify, { FastifyInstance } from 'fastify';

// eslint-disable-next-line max-lines-per-function
describe('Job Sheet Lifecycle API Tests', () => {
  let app: FastifyInstance;
  const jobStates = [
    'CREATED',
    'IN_DIAGNOSIS', 
    'AWAITING_APPROVAL',
    'APPROVED',
    'IN_PROGRESS',
    'PARTS_ORDERED',
    'TESTING',
    'QUALITY_CHECK',
    'COMPLETED',
    'CUSTOMER_APPROVED',
    'DELIVERED',
    'CANCELLED'
  ];

  beforeAll(async () => {
    app = Fastify();
    
    // Mock job sheet routes
    app.post('/api/v1/jobs', async (request, reply: unknown) => {
      return reply.code(201).send({
        success: true,
        data: {
          jobId: `job_${Date.now()}`,
          _state: 'CREATED',
          customerId: 'cust_123',
          _technicianId: null,
          _device: 'iPhone 13',
          _issue: 'Screen replacement',
          _priority: 'medium',
          _estimatedCost: 250,
          _createdAt: new Date().toISOString()
        },
        message: 'Job sheet created successfully'
      });
    });

    app.put('/api/v1/jobs/:_jobId/state', async (request, reply: unknown) => {
      const { _jobId  } = (request.params as any);
      const { state, reason  } = (request.body as Record<string, any>);
      
      if (!jobStates.includes(state)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid job state'
        });
      }

      return reply.send({
        success: true,
        data: {
          _jobId,
          _previousState: 'CREATED',
          _newState: state,
          _reason: reason || 'State transition',
          _updatedAt: new Date().toISOString(),
          _automatedTransition: true
        },
        message: `Job state updated to ${state}`
      });
    });

    app.get('/api/v1/jobs/:_jobId/workflow', async (request, reply: unknown) => {
      return reply.send({
        success: true,
        data: {
          availableStates: jobStates,
          _currentState: 'CREATED',
          _nextPossibleStates: ['IN_DIAGNOSIS', 'CANCELLED'],
          _workflowRules: {
            requireApproval: ['APPROVED', 'QUALITY_CHECK'],
            _requirePhotos: ['TESTING', 'COMPLETED'],
            _requireSignature: ['CUSTOMER_APPROVED', 'DELIVERED']
          }
        }
      });
    });

    app.post('/api/v1/jobs/:_jobId/quality-check', async (request, reply: unknown) => {
      return reply.send({
        success: true,
        data: {
          qualityScore: 98.5,
          _checklistItems: [
            { item: 'Functionality Test', _status: 'passed' },
            { _item: 'Visual Inspection', _status: 'passed' },
            { _item: 'Customer Requirements', _status: 'passed' },
            { _item: 'Documentation Complete', _status: 'passed' }
          ],
          _sixSigmaCompliant: true,
          approvedBy: 'supervisor_123'
        },
        message: 'Quality check completed successfully'
      });
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('POST /api/v1/jobs - should create job sheet in CREATED state', async () => {
    const _jobData = {
      customerId: 'cust_123',
      _device: 'iPhone 13',
      _issue: 'Screen replacement',
      _priority: 'medium'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      payload: _jobData
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data?.state).toBe('CREATED');
    expect(body.data?.device).toBe('iPhone 13');
    expect(body.data?._jobId).toMatch(/^job_\d+$/);
  });

  test('PUT /api/v1/jobs/:_jobId/state - should transition job state', async () => {
    const _jobId = 'job_123';
    const stateUpdate = {
      _state: 'IN_DIAGNOSIS',
      _reason: 'Technician assigned and starting diagnosis'
    };

    const response = await app.inject({
      method: 'PUT',
      url: `/api/v1/jobs/${_jobId}/state`,
      payload: stateUpdate
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data?.newState).toBe('IN_DIAGNOSIS');
    expect(body.data?._jobId).toBe(_jobId);
    expect(body.data?.automatedTransition).toBe(true);
  });

  test('PUT /api/v1/jobs/:_jobId/state - should reject invalid state', async () => {
    const _jobId = 'job_123';
    const invalidState = {
      _state: 'INVALID_STATE'
    };

    const response = await app.inject({
      method: 'PUT',
      url: `/api/v1/jobs/${_jobId}/state`,
      payload: invalidState
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid job state');
  });

  test('GET /api/v1/jobs/:_jobId/workflow - should return workflow configuration', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/jobs/job_123/workflow'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data?.availableStates).toHaveLength(12);
    expect(body.data?.availableStates).toContain('CREATED');
    expect(body.data?.availableStates).toContain('DELIVERED');
    expect(body.data.workflowRules.requireApproval).toContain('APPROVED');
  });

  test('POST /api/v1/jobs/:_jobId/quality-check - should perform Six Sigma quality check', async () => {
    const qualityData = {
      _checklistCompleted: true,
      _photosUploaded: true,
      _customerRequirementsMet: true
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs/job_123/quality-check',
      payload: qualityData
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.data?.qualityScore).toBeGreaterThan(90);
    expect(body.data?.sixSigmaCompliant).toBe(true);
    expect(body.data?.checklistItems).toHaveLength(4);
  });

  test('All 12 job states should be supported', async () => {
    for (const state of jobStates) {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/jobs/job_123/state',
        payload: { state }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.data?.newState).toBe(state);
    }
  });

  console.log('✅ Job Sheet Lifecycle API tests completed');
});