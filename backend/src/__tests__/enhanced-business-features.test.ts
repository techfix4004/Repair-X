/* eslint-disable no-undef */
/// <reference types="jest" />
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { fastify } from '../index';

// eslint-disable-next-line max-lines-per-function
describe('RepairX Enhanced Business Features Tests', () => {
  beforeAll(async () => {
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('Enhanced Features Status', () => {
    test('should return enhanced features status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/enhanced/status'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.status).toBe('operational');
      expect(Array.isArray(body.data.features)).toBe(true);
      expect(body.data.features.length).toBeGreaterThan(0);
      expect(body.data?.version).toBe('2.0.0');
    });
  });

  describe('Advanced Job Management', () => {
    test('should create advanced job with AI optimization', async () => {
      const _jobData = {
        _category: 'Electronics',
        _description: 'Smartphone screen repair',
        _customerType: 'premium',
        _urgent: true,
        _deviceValue: 800,
        _complexity: 'MEDIUM'
      };

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/jobs/advanced',
        _payload: _jobData
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.id).toBeDefined();
      expect(body.data?.status).toBe('CREATED');
      expect(body.data?.priority).toBeDefined();
      expect(body.data?.estimatedDuration).toBeDefined();
      expect(body.data?.recommendedTechnician).toBeDefined();
      expect(body.data?.workflow).toBeDefined();
      expect(body.data?.qualityMetrics).toBeDefined();
    });

    test('should get job analytics', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/jobs/analytics'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.summary).toBeDefined();
      expect(body.data?.stateDistribution).toBeDefined();
      expect(body.data?.performanceMetrics).toBeDefined();
      expect(body.data?.aiOptimization).toBeDefined();
      expect(typeof body.data.summary.totalJobs).toBe('number');
    });

    test('should execute job state transition', async () => {
      const transitionData = {
        _targetState: 'IN_DIAGNOSIS',
        _reason: 'Technician assigned and diagnosis started',
        _metadata: { technicianId: 'tech_001' }
      };

      const response = await fastify.inject({
        method: 'PUT',
        url: '/api/v1/jobs/job_123/transition',
        _payload: transitionData
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.jobId).toBe('job_123');
      expect(body.data?.toState).toBe('IN_DIAGNOSIS');
      expect(body.data?.automationTriggered).toBeDefined();
    });
  });

  describe('Quality Assurance System', () => {
    test('should return Six Sigma quality dashboard', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/quality/dashboard'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.summary).toBeDefined();
      expect(body.data?.defectAnalysis).toBeDefined();
      expect(body.data?.improvementActions).toBeDefined();
      expect(typeof body.data.summary.defectRate).toBe('number');
      expect(typeof body.data.summary.processCapability.cp).toBe('number');
      expect(typeof body.data.summary.processCapability.cpk).toBe('number');
    });

    test('should return real-time quality metrics', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/quality/metrics/realtime'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.timestamp).toBeDefined();
      expect(body.data?.currentShift).toBeDefined();
      expect(body.data?.processControl).toBeDefined();
      expect(Array.isArray(body.data.alerts)).toBe(true);
    });

    test('should return quality improvement recommendations', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/quality/recommendations'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.immediate).toBeDefined();
      expect(body.data?.strategic).toBeDefined();
      expect(body.data?.innovation).toBeDefined();
      expect(Array.isArray(body.data.immediate)).toBe(true);
      expect(Array.isArray(body.data.strategic)).toBe(true);
      expect(Array.isArray(body.data.innovation)).toBe(true);
    });
  });

  describe('Business Intelligence Integration', () => {
    test('should integrate with enhanced BI service', async () => {
      // This would typically test integration with the business intelligence service
      // For now, we verify the service exists
      const { EnhancedBusinessIntelligence  } = (require('../services/business-intelligence-enhanced') as any);
      const bi = new EnhancedBusinessIntelligence();
      
      const dashboard = await bi.generateExecutiveDashboard();
      expect(dashboard.kpiMetrics).toBeDefined();
      expect(dashboard.predictiveAnalytics).toBeDefined();
      expect(dashboard.competitiveIntelligence).toBeDefined();
    });
  });

  describe('System Integration', () => {
    test('should maintain backward compatibility', async () => {
      // Test that core system still works
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
    });

    test('should provide comprehensive API coverage', async () => {
      // Test that all enhanced features work together
      const statusResponse = await fastify.inject({
        method: 'GET',
        url: '/api/v1/enhanced/status'
      });

      const jobAnalytics = await fastify.inject({
        method: 'GET',
        url: '/api/v1/jobs/analytics'
      });

      const qualityDashboard = await fastify.inject({
        method: 'GET',
        url: '/api/v1/quality/dashboard'
      });

      expect(statusResponse.statusCode).toBe(200);
      expect(jobAnalytics.statusCode).toBe(200);
      expect(qualityDashboard.statusCode).toBe(200);
    });
  });
});