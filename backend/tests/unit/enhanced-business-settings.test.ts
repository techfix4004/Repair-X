/**
 * Enhanced Business Settings Test Suite
 * 
 * Comprehensive test coverage for all business setting categories
 * and functionality to achieve Six Sigma quality standards.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Fastify, { FastifyInstance } from 'fastify';
import enhancedBusinessSettingsRoutes from '../../src/routes/enhanced-business-settings-v2';

describe('Enhanced Business Settings', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = Fastify();
    await server.register(enhancedBusinessSettingsRoutes, { prefix: '/api/v1/business-settings' });
    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  describe('GET /api/v1/business-settings/', () => {
    it('should return all business settings categories', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/business-settings/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.metadata?.categories).toContain('tax_settings');
      expect(body.metadata?.categories).toContain('workflow_config');
      expect(body.metadata?.categories).toContain('email_settings');
    });

    it('should return specific category settings', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/business-settings/?category=tax_settings',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.gstin).toBeDefined();
      expect(body.data?.taxRates).toBeDefined();
      expect(body.data?.jurisdiction).toBe('IN');
    });
  });

  describe('PUT /api/v1/business-settings/:category', () => {
    it('should update tax settings successfully', async () => {
      const taxSettings = {
        gstin: '29ABCDE1234F1Z5',
        taxRates: {
          gst: 18,
          vat: 20,
          hst: 13,
          salesTax: 8.5,
        },
        jurisdiction: 'IN',
        autoCalculate: true,
      };

      const response = await server.inject({
        method: 'PUT',
        url: '/api/v1/business-settings/tax_settings',
        payload: taxSettings,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('tax_settings settings updated successfully');
    });

    it('should validate tax settings schema', async () => {
      const invalidSettings = {
        taxRates: {
          gst: 60, // Invalid: above 50% limit
        },
      };

      const response = await server.inject({
        method: 'PUT',
        url: '/api/v1/business-settings/tax_settings',
        payload: invalidSettings,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should update workflow configuration', async () => {
      const workflowConfig = {
        states: [
          {
            id: 'CREATED',
            name: 'Created',
            description: 'Initial job creation',
            color: '#3b82f6',
            order: 1,
            automated: true,
            requiredFields: ['customerId'],
            notifications: ['customer_confirmation'],
            transitions: [
              { to: 'IN_DIAGNOSIS', automated: true }
            ]
          }
        ],
        defaultAssignmentRules: {
          bySkill: true,
          byLocation: false,
          byWorkload: true,
        },
      };

      const response = await server.inject({
        method: 'PUT',
        url: '/api/v1/business-settings/workflow_config',
        payload: workflowConfig,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('POST /api/v1/business-settings/tax/validate-gstin', () => {
    it('should validate correct GSTIN format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/tax/validate-gstin',
        payload: { gstin: '29ABCDE1234F1Z5' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.valid).toBe(true);
    });

    it('should reject invalid GSTIN format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/tax/validate-gstin',
        payload: { gstin: 'INVALID_GSTIN' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.valid).toBe(false);
    });
  });

  describe('POST /api/v1/business-settings/tax/calculate', () => {
    it('should calculate GST for Indian jurisdiction', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/tax/calculate',
        payload: { amount: 1000, jurisdiction: 'IN' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.netAmount).toBe(1000);
      expect(body.data?.taxRate).toBe(18);
      expect(body.data?.taxAmount).toBe(180);
      expect(body.data?.grossAmount).toBe(1180);
      expect(body.data?.jurisdiction).toBe('IN');
    });

    it('should calculate VAT for UK jurisdiction', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/tax/calculate',
        payload: { amount: 1000, jurisdiction: 'UK' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data?.taxRate).toBe(20);
      expect(body.data?.taxAmount).toBe(200);
      expect(body.data?.grossAmount).toBe(1200);
    });

    it('should handle different currency amounts accurately', async () => {
      const testAmounts = [0.01, 100.50, 1000.99, 50000.75];
      
      for (const amount of testAmounts) {
        const response = await server.inject({
          method: 'POST',
          url: '/api/v1/business-settings/tax/calculate',
          payload: { amount, jurisdiction: 'IN' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data?.netAmount).toBe(amount);
        expect(body.data?.grossAmount).toBe(Number((amount * 1.18).toFixed(2)));
      }
    });
  });

  describe('POST /api/v1/business-settings/print/preview/:templateType', () => {
    it('should preview job sheet template', async () => {
      const sampleData = {
        businessName: 'Test Repair Shop',
        businessAddress: '123 Test Street',
        jobNumber: 'JOB-001',
        customerName: 'John Doe',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/print/preview/jobSheet',
        payload: sampleData,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(response.body).toContain('Test Repair Shop');
      expect(response.body).toContain('JOB-001');
      expect(response.body).toContain('John Doe');
    });

    it('should preview invoice template', async () => {
      const sampleData = {
        businessName: 'RepairX Service Center',
        businessAddress: '456 Service Ave',
        invoiceNumber: 'INV-001',
        itemsTable: '<tr><td>Device Repair</td><td>$100.00</td></tr>',
        paymentTerms: 'Net 30 days',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/print/preview/invoice',
        payload: sampleData,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain('RepairX Service Center');
      expect(response.body).toContain('INV-001');
      expect(response.body).toContain('Device Repair');
    });

    it('should handle missing template type', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/print/preview/nonexistent',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Template preview failed');
    });
  });

  describe('GET /api/v1/business-settings/categories', () => {
    it('should return all available categories', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/business-settings/categories',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.total).toBeGreaterThan(0);
      
      // Check that each category has required properties
      body.data.forEach((category: unknown) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.description).toBeDefined();
        expect(category.icon).toBeDefined();
        expect(Array.isArray(category.features)).toBe(true);
      });
      
      // Verify specific categories are present
      const categoryIds = body.data.map((cat: unknown) => cat.id);
      expect(categoryIds).toContain('tax_settings');
      expect(categoryIds).toContain('print_settings');
      expect(categoryIds).toContain('workflow_config');
      expect(categoryIds).toContain('email_settings');
      expect(categoryIds).toContain('sms_settings');
    });
  });

  describe('Business Logic Validation', () => {
    it('should maintain data consistency across updates', async () => {
      // First update tax settings
      const taxSettings = {
        jurisdiction: 'CA',
        taxRates: { hst: 13 }
      };

      await server.inject({
        method: 'PUT',
        url: '/api/v1/business-settings/tax_settings',
        payload: taxSettings,
      });

      // Then verify the calculation uses the updated settings
      const calcResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/tax/calculate',
        payload: { amount: 1000, jurisdiction: 'CA' },
      });

      expect(calcResponse.statusCode).toBe(200);
      const body = JSON.parse(calcResponse.payload);
      expect(body.data?.taxRate).toBe(13);
    });

    it('should handle concurrent updates safely', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          server.inject({
            method: 'PUT',
            url: '/api/v1/business-settings/tax_settings',
            payload: { gstin: `TEST_GSTIN_${i}` },
          })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach((response: unknown) => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed request bodies', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/api/v1/business-settings/tax_settings',
        payload: 'invalid json',
        headers: {
          'content-type': 'application/json'
        }
      });

      expect([400, 500]).toContain(response.statusCode);
    });

    it('should handle missing required fields', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/business-settings/tax/validate-gstin',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Performance Tests', () => {
    it('should handle settings retrieval within acceptable time', async () => {
      const startTime = Date.now();
      
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/business-settings/',
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(200); // Should respond within 200ms
    });

    it('should handle multiple simultaneous requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        server.inject({
          method: 'GET',
          url: '/api/v1/business-settings/categories',
        })
      );

      const responses = await Promise.all(promises);
      responses.forEach((response: unknown) => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe('Six Sigma Quality Metrics', () => {
    it('should maintain zero defects in critical operations', async () => {
      // Test critical operations that must never fail
      const criticalOperations = [
        { method: 'GET', url: '/api/v1/business-settings/' },
        { method: 'GET', url: '/api/v1/business-settings/categories' },
        { 
          method: 'POST', 
          url: '/api/v1/business-settings/tax/calculate',
          payload: { amount: 1000, jurisdiction: 'IN' }
        }
      ];

      for (const operation of criticalOperations) {
        const response = await server.inject({
          method: operation.method as any,
          url: operation.url,
          ...(operation.payload ? { payload: operation.payload } : {})
        });
        expect(response.statusCode).toBe(200);
        
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      }
    });

    it('should provide consistent response structure', async () => {
      const endpoints = [
        '/api/v1/business-settings/',
        '/api/v1/business-settings/categories'
      ];

      for (const endpoint of endpoints) {
        const response = await server.inject({
          method: 'GET',
          url: endpoint,
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('success');
        expect(body).toHaveProperty('data');
        expect(typeof body.success).toBe('boolean');
      }
    });
  });
});