#!/usr/bin/env node

/**
 * Production Readiness Test Suite
 * Validates all application components, APIs, and business logic
 */

const axios = require('axios');

class ProductionReadinessTest {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(name, testFunction) {
    try {
      this.log(`Running test: ${name}`, 'info');
      await testFunction();
      this.testResults.passed++;
      this.testResults.details.push({ name, status: 'PASSED', error: null });
      this.log(`Test passed: ${name}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({ name, status: 'FAILED', error: error.message });
      this.log(`Test failed: ${name} - ${error.message}`, 'error');
    }
  }

  async testHealthEndpoints() {
    await this.runTest('Backend Health Check', async () => {
      const response = await axios.get(`${this.baseUrl}/health`);
      if (response.status !== 200) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
      if (!response.data || response.data.status !== 'healthy') {
        throw new Error('Health check returned unhealthy status');
      }
    });

    await this.runTest('Frontend Health Check', async () => {
      const response = await axios.get(`${this.frontendUrl}/health`);
      if (response.status !== 200) {
        throw new Error(`Frontend health check failed with status ${response.status}`);
      }
    });
  }

  async testDatabaseConnectivity() {
    await this.runTest('Database Connection', async () => {
      const response = await axios.get(`${this.baseUrl}/api/health/database`);
      if (response.status !== 200) {
        throw new Error(`Database health check failed with status ${response.status}`);
      }
    });
  }

  async testAuthenticationEndpoints() {
    await this.runTest('Organization Login Endpoint', async () => {
      const response = await axios.post(`${this.baseUrl}/auth/organization/login`, {
        email: 'test@example.com',
        password: 'invalidpassword'
      }, { validateStatus: () => true });
      
      // Should return 401 for invalid credentials
      if (response.status !== 401) {
        throw new Error(`Expected 401 for invalid credentials, got ${response.status}`);
      }
    });

    await this.runTest('Customer Login Endpoint', async () => {
      const response = await axios.post(`${this.baseUrl}/auth/customer/login`, {
        emailOrPhone: 'test@example.com',
        password: 'invalidpassword'
      }, { validateStatus: () => true });
      
      // Should return 401 for invalid credentials
      if (response.status !== 401) {
        throw new Error(`Expected 401 for invalid credentials, got ${response.status}`);
      }
    });
  }

  async testBusinessLogicEndpoints() {
    await this.runTest('Service Categories API', async () => {
      const response = await axios.get(`${this.baseUrl}/api/marketplace/categories`);
      if (response.status !== 200) {
        throw new Error(`Categories API failed with status ${response.status}`);
      }
      if (!Array.isArray(response.data)) {
        throw new Error('Categories API should return an array');
      }
    });

    await this.runTest('Marketplace Integrations API', async () => {
      const response = await axios.get(`${this.baseUrl}/api/marketplace/integrations`);
      if (response.status !== 200) {
        throw new Error(`Integrations API failed with status ${response.status}`);
      }
    });
  }

  async testSecurityHeaders() {
    await this.runTest('Security Headers', async () => {
      const response = await axios.get(`${this.baseUrl}/health`);
      const headers = response.headers;
      
      // Check for basic security headers
      const requiredHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection'
      ];
      
      const missingHeaders = requiredHeaders.filter(header => !headers[header]);
      if (missingHeaders.length > 0) {
        throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
      }
    });
  }

  async testPerformance() {
    await this.runTest('Response Time Check', async () => {
      const start = Date.now();
      await axios.get(`${this.baseUrl}/health`);
      const responseTime = Date.now() - start;
      
      if (responseTime > 1000) {
        throw new Error(`Response time too slow: ${responseTime}ms (should be < 1000ms)`);
      }
    });
  }

  async testDataValidation() {
    await this.runTest('Mock Data Absence', async () => {
      // Test that APIs don't return obvious mock data
      const response = await axios.get(`${this.baseUrl}/api/marketplace/categories`);
      const data = JSON.stringify(response.data).toLowerCase();
      
      const mockPatterns = ['mock', 'test123', 'placeholder', 'fake', 'dummy'];
      const foundMockData = mockPatterns.filter(pattern => data.includes(pattern));
      
      if (foundMockData.length > 0) {
        throw new Error(`Found mock data patterns: ${foundMockData.join(', ')}`);
      }
    });
  }

  async testErrorHandling() {
    await this.runTest('404 Error Handling', async () => {
      const response = await axios.get(`${this.baseUrl}/api/nonexistent-endpoint`, {
        validateStatus: () => true
      });
      
      if (response.status !== 404) {
        throw new Error(`Expected 404 for nonexistent endpoint, got ${response.status}`);
      }
    });

    await this.runTest('Invalid Method Handling', async () => {
      const response = await axios.patch(`${this.baseUrl}/health`, {}, {
        validateStatus: () => true
      });
      
      if (response.status !== 405 && response.status !== 404) {
        throw new Error(`Expected 405 or 404 for invalid method, got ${response.status}`);
      }
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Production Readiness Tests', 'info');
    this.log('===========================================', 'info');

    try {
      await this.testHealthEndpoints();
      await this.testDatabaseConnectivity();
      await this.testAuthenticationEndpoints();
      await this.testBusinessLogicEndpoints();
      await this.testSecurityHeaders();
      await this.testPerformance();
      await this.testDataValidation();
      await this.testErrorHandling();
    } catch (error) {
      this.log(`Test suite execution error: ${error.message}`, 'error');
    }

    this.generateReport();
  }

  generateReport() {
    this.log('===========================================', 'info');
    this.log('🏁 Production Readiness Test Results', 'info');
    this.log('===========================================', 'info');
    
    this.log(`✅ Tests Passed: ${this.testResults.passed}`, 'success');
    this.log(`❌ Tests Failed: ${this.testResults.failed}`, 'error');
    this.log(`⏭️ Tests Skipped: ${this.testResults.skipped}`, 'warning');
    
    const total = this.testResults.passed + this.testResults.failed + this.testResults.skipped;
    const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;
    
    this.log(`📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'error');
    
    if (this.testResults.failed > 0) {
      this.log('🔍 Failed Tests:', 'error');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`   - ${test.name}: ${test.error}`, 'error');
        });
    }
    
    const isProductionReady = this.testResults.failed === 0 && this.testResults.passed >= 8;
    
    if (isProductionReady) {
      this.log('🎉 APPLICATION IS PRODUCTION READY! 🎉', 'success');
    } else {
      this.log('⚠️ APPLICATION NEEDS FIXES BEFORE PRODUCTION', 'error');
    }
    
    return isProductionReady;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ProductionReadinessTest();
  tester.runAllTests().then(() => {
    process.exit(tester.testResults.failed === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionReadinessTest;