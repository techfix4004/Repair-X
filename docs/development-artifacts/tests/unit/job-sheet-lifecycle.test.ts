/**
 * Job Sheet Lifecycle Test Suite
 * 
 * Comprehensive tests for the 12-state job lifecycle management system
 * to ensure Six Sigma quality standards and business rule compliance.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Fastify, { FastifyInstance } from 'fastify';
import jobSheetLifecycleRoutes from '../../src/routes/job-sheet-lifecycle';

describe('Job Sheet Lifecycle Management', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = Fastify();
    await server.register(jobSheetLifecycleRoutes, { prefix: '/api/v1' });
    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('POST /api/v1/jobs', () => {
    it('should create a new job sheet successfully', async () => {
      const jobData = {
        customerId: 'CUST-001',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerEmail: 'john@example.com',
        deviceInfo: {
          brand: 'Apple',
          model: 'iPhone 13',
          category: 'SMARTPHONE',
          condition: 'FAIR',
        },
        issueDescription: 'Screen cracked, battery drains fast',
        priority: 'MEDIUM',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: jobData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data?.id).toBeDefined();
      expect(body.data?.jobNumber).toMatch(/^RepairX-\d{4}-\d{6}$/);
      expect(body.data?.state).toBe('CREATED');
      expect(body.data?.customerId).toBe('CUST-001');
    });

    it('should validate required fields', async () => {
      const invalidJobData = {
        customerName: 'John Doe',
        // Missing required fields
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: invalidJobData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Failed to create job sheet');
    });

    it('should generate unique job numbers', async () => {
      const jobData = {
        customerId: 'CUST-002',
        customerName: 'Jane Smith',
        customerPhone: '+1987654321',
        customerEmail: 'jane@example.com',
        deviceInfo: {
          brand: 'Samsung',
          model: 'Galaxy S21',
          category: 'SMARTPHONE',
          condition: 'GOOD',
        },
        issueDescription: 'Water damage',
        priority: 'HIGH',
      };

      const responses = await Promise.all([
        server.inject({ method: 'POST', url: '/api/v1/jobs', payload: jobData }),
        server.inject({ method: 'POST', url: '/api/v1/jobs', payload: jobData }),
        server.inject({ method: 'POST', url: '/api/v1/jobs', payload: jobData }),
      ]);

      const jobNumbers = responses.map((response: unknown) => {
        const body = JSON.parse(response.payload);
        return body.data.jobNumber;
      });

      const uniqueNumbers = new Set(jobNumbers);
      expect(uniqueNumbers.size).toBe(3); // All should be unique
    });
  });

  describe('GET /api/v1/jobs/:jobId', () => {
    let jobId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: {
          customerId: 'CUST-003',
          customerName: 'Test Customer',
          customerPhone: '+1111111111',
          customerEmail: 'test@example.com',
          deviceInfo: {
            brand: 'Test',
            model: 'Device',
            category: 'TEST',
            condition: 'GOOD',
          },
          issueDescription: 'Test issue',
        },
      });
      const body = JSON.parse(response.payload);
      jobId = body.data.id;
    });

    it('should retrieve job sheet with state configuration', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/jobs/${jobId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data?.id).toBe(jobId);
      expect(body.data?.stateConfig).toBeDefined();
      expect(body.data.stateConfig.name).toBe('Created');
      expect(body.data?.transitions).toBeDefined();
    });

    it('should return 404 for non-existent job', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/NON-EXISTENT-JOB',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Job not found');
    });
  });

  describe('POST /api/v1/jobs/:jobId/transition', () => {
    let jobId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: {
          customerId: 'CUST-004',
          customerName: 'Transition Test',
          customerPhone: '+1222222222',
          customerEmail: 'transition@example.com',
          deviceInfo: {
            brand: 'Test',
            model: 'Transition',
            category: 'TEST',
            condition: 'POOR',
          },
          issueDescription: 'Transition test issue',
        },
      });
      const body = JSON.parse(response.payload);
      jobId = body.data.id;
      
      // Wait a bit for auto-transition to IN_DIAGNOSIS
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should successfully transition to AWAITING_APPROVAL', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/transition`,
        payload: {
          fromState: 'IN_DIAGNOSIS',
          toState: 'AWAITING_APPROVAL',
          reason: 'Diagnosis complete',
          notes: 'Screen replacement required',
          performedBy: 'TECH-001',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data.job.state).toBe('AWAITING_APPROVAL');
      expect(body.data.transition.reason).toBe('Diagnosis complete');
    });

    it('should reject invalid transitions', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/transition`,
        payload: {
          fromState: 'IN_DIAGNOSIS',
          toState: 'DELIVERED', // Invalid direct transition
          performedBy: 'TECH-001',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.message).toBe('State transition failed');
      expect(body.error).toContain('Invalid transition');
    });

    it('should handle transition validation', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/transition`,
        payload: {
          fromState: 'IN_DIAGNOSIS',
          toState: 'AWAITING_APPROVAL',
          // Missing performedBy
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/jobs/:jobId', () => {
    let jobId: string;

    beforeEach(async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: {
          customerId: 'CUST-005',
          customerName: 'Update Test',
          customerPhone: '+1333333333',
          customerEmail: 'update@example.com',
          deviceInfo: {
            brand: 'Test',
            model: 'Update',
            category: 'TEST',
            condition: 'FAIR',
          },
          issueDescription: 'Update test issue',
        },
      });
      const body = JSON.parse(response.payload);
      jobId = body.data.id;
    });

    it('should update job sheet with diagnostic notes', async () => {
      const updateData = {
        diagnosticNotes: 'Battery replacement required',
        estimatedCost: 150.00,
        photos: ['photo1.jpg', 'photo2.jpg'],
        partsRequired: [
          {
            name: 'Battery',
            quantity: 1,
            cost: 80.00,
            supplier: 'OEM Parts Co',
          }
        ],
      };

      const response = await server.inject({
        method: 'PUT',
        url: `/api/v1/jobs/${jobId}`,
        payload: updateData,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data?.diagnosticNotes).toBe('Battery replacement required');
      expect(body.data?.estimatedCost).toBe(150.00);
      expect(body.data?.photos).toHaveLength(2);
    });

    it('should validate update data structure', async () => {
      const invalidUpdate = {
        partsRequired: [
          {
            // Missing required fields
            name: 'Battery',
          }
        ],
      };

      const response = await server.inject({
        method: 'PUT',
        url: `/api/v1/jobs/${jobId}`,
        payload: invalidUpdate,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/v1/jobs/state/:state', () => {
    beforeEach(async () => {
      // Create multiple jobs in different states
      const jobPromises = [
        server.inject({
          method: 'POST',
          url: '/api/v1/jobs',
          payload: {
            customerId: 'CUST-STATE-1',
            customerName: 'State Test 1',
            customerPhone: '+1444444444',
            customerEmail: 'state1@example.com',
            deviceInfo: { brand: 'Test', model: 'State1', category: 'TEST', condition: 'GOOD' },
            issueDescription: 'State test 1',
          },
        }),
        server.inject({
          method: 'POST',
          url: '/api/v1/jobs',
          payload: {
            customerId: 'CUST-STATE-2',
            customerName: 'State Test 2',
            customerPhone: '+1555555555',
            customerEmail: 'state2@example.com',
            deviceInfo: { brand: 'Test', model: 'State2', category: 'TEST', condition: 'FAIR' },
            issueDescription: 'State test 2',
          },
        }),
      ];

      await Promise.all(jobPromises);
    });

    it('should retrieve jobs by state', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/state/CREATED',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.total).toBeGreaterThan(0);
      
      // All jobs should be in CREATED state
      body.data.forEach((job: unknown) => {
        expect(job.state).toBe('CREATED');
        expect(job.stateConfig).toBeDefined();
      });
    });

    it('should handle non-existent states gracefully', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/state/INVALID_STATE',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/v1/jobs/analytics/dashboard', () => {
    it('should provide comprehensive job analytics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/analytics/dashboard',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data?.totalJobs).toBeDefined();
      expect(body.data?.stateDistribution).toBeDefined();
      expect(body.data?.completionRate).toBeDefined();
      expect(body.data?.cancellationRate).toBeDefined();
      expect(body.data?.avgCycleTime).toBeDefined();
      expect(body.data?.qualityMetrics).toBeDefined();
      
      // Validate quality metrics structure
      expect(body.data.qualityMetrics.onTimeDelivery).toBeDefined();
      expect(body.data.qualityMetrics.customerSatisfaction).toBeDefined();
      expect(body.data.qualityMetrics.firstTimeFixRate).toBeDefined();
      expect(body.data.qualityMetrics.defectRate).toBeDefined();
    });

    it('should provide accurate state distribution', async () => {
      // Create a job first
      await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: {
          customerId: 'CUST-ANALYTICS',
          customerName: 'Analytics Test',
          customerPhone: '+1666666666',
          customerEmail: 'analytics@example.com',
          deviceInfo: { brand: 'Test', model: 'Analytics', category: 'TEST', condition: 'GOOD' },
          issueDescription: 'Analytics test',
        },
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/analytics/dashboard',
      });

      const body = JSON.parse(response.payload);
      const distribution = body.data.stateDistribution;
      
      // Should have at least one job in CREATED state
      expect(distribution.CREATED).toBeGreaterThan(0);
      
      // All state values should be numbers
      Object.values(distribution).forEach((count: unknown) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('GET /api/v1/jobs/workflow/config', () => {
    it('should provide complete workflow configuration', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/workflow/config',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
      expect(body.data?.stateConfig).toBeDefined();
      expect(body.data?.workflow).toBeDefined();
      
      // Validate all 12 states are configured
      const states = Object.keys(body.data.stateConfig);
      expect(states).toHaveLength(12);
      expect(states).toContain('CREATED');
      expect(states).toContain('DELIVERED');
      expect(states).toContain('CANCELLED');
    });

    it('should provide workflow visualization data', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/workflow/config',
      });

      const body = JSON.parse(response.payload);
      const workflow = body.data.workflow;
      
      expect(workflow.states).toBeDefined();
      expect(workflow.totalStates).toBe(12);
      expect(workflow.finalStates).toContain('DELIVERED');
      expect(workflow.finalStates).toContain('CANCELLED');
      
      // Each state should have required properties
      workflow.states.forEach((state: unknown) => {
        expect(state.id).toBeDefined();
        expect(state.name).toBeDefined();
        expect(state.description).toBeDefined();
        expect(state.order).toBeDefined();
        expect(Array.isArray(state.transitions)).toBe(true);
      });
    });
  });

  describe('Business Logic Validation', () => {
    it('should enforce Six Sigma quality standards', async () => {
      // Create job and move through states
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: {
          customerId: 'CUST-QUALITY',
          customerName: 'Quality Test',
          customerPhone: '+1777777777',
          customerEmail: 'quality@example.com',
          deviceInfo: { brand: 'Test', model: 'Quality', category: 'TEST', condition: 'POOR' },
          issueDescription: 'Quality test issue',
        },
      });

      const job = JSON.parse(createResponse.payload);
      const jobId = job.data.id;

      // Check analytics includes quality metrics
      const analyticsResponse = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/analytics/dashboard',
      });

      const analytics = JSON.parse(analyticsResponse.payload);
      expect(analytics.data.qualityMetrics.defectRate).toBeLessThan(10); // Should meet quality standards
      expect(analytics.data.qualityMetrics.customerSatisfaction).toBeGreaterThan(4.0);
      expect(analytics.data.qualityMetrics.firstTimeFixRate).toBeGreaterThan(80);
    });

    it('should maintain audit trail for all transitions', async () => {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: {
          customerId: 'CUST-AUDIT',
          customerName: 'Audit Test',
          customerPhone: '+1888888888',
          customerEmail: 'audit@example.com',
          deviceInfo: { brand: 'Test', model: 'Audit', category: 'TEST', condition: 'GOOD' },
          issueDescription: 'Audit test issue',
        },
      });

      const job = JSON.parse(createResponse.payload);
      const jobId = job.data.id;

      // Get job details and verify transitions are tracked
      const getResponse = await server.inject({
        method: 'GET',
        url: `/api/v1/jobs/${jobId}`,
      });

      const jobDetails = JSON.parse(getResponse.payload);
      expect(Array.isArray(jobDetails.data.transitions)).toBe(true);
      
      // Should have audit trail even for auto-transitions
      expect(jobDetails.data?.stateHistory).toBeDefined();
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple simultaneous job creations', async () => {
      const promises = Array.from({ length: 10 }, (_, index) =>
        server.inject({
          method: 'POST',
          url: '/api/v1/jobs',
          payload: {
            customerId: `CUST-PERF-${index}`,
            customerName: `Performance Test ${index}`,
            customerPhone: `+1${index.toString().padStart(9, '0')}`,
            customerEmail: `perf${index}@example.com`,
            deviceInfo: { brand: 'Test', model: `Perf${index}`, category: 'TEST', condition: 'GOOD' },
            issueDescription: `Performance test ${index}`,
          },
        })
      );

      const responses = await Promise.all(promises);
      responses.forEach((response: unknown) => {
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data?.id).toBeDefined();
      });

      // Verify all jobs have unique IDs
      const jobIds = responses.map((response: unknown) => {
        const body = JSON.parse(response.payload);
        return body.data.id;
      });
      const uniqueIds = new Set(jobIds);
      expect(uniqueIds.size).toBe(10);
    });

    it('should maintain acceptable response times', async () => {
      const startTime = Date.now();

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/jobs/analytics/dashboard',
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed request data', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs',
        payload: 'invalid json string',
        headers: {
          'content-type': 'application/json',
        },
      });

      expect([400, 500]).toContain(response.statusCode);
    });

    it('should provide meaningful error messages', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/jobs/NON-EXISTENT/transition',
        payload: {
          fromState: 'CREATED',
          toState: 'IN_DIAGNOSIS',
          performedBy: 'TEST',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Job not found');
    });
  });
});