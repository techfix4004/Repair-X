/**
 * Automated Visual Regression Testing System
 * Cross-platform UI testing automation with screenshot comparison,
 * automated test execution, and comprehensive reporting.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Schemas for Visual Regression Testing
const TestSuiteSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Test suite name is required'),
  description: z.string().min(1, 'Description is required'),
  platform: z.enum(['WEB', 'IOS', 'ANDROID', 'ALL']),
  environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
  configuration: z.object({
    baseUrl: z.string().url(),
    viewport: z.object({
      width: z.number().min(320),
      height: z.number().min(200),
    }),
    devices: z.array(z.object({
      name: z.string(),
      userAgent: z.string().optional(),
      viewport: z.object({
        width: z.number(),
        height: z.number(),
      }),
    })).default([]),
    browsers: z.array(z.enum(['CHROME', 'FIREFOX', 'SAFARI', 'EDGE'])).default(['CHROME']),
    thresholds: z.object({
      pixel: z.number().min(0).max(1).default(0.01), // 1% pixel difference threshold
      layout: z.number().min(0).max(1).default(0.05), // 5% layout shift threshold
      misMatchTolerance: z.number().min(0).max(100).default(2), // 2% mismatch tolerance
    }),
  }),
  testCases: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    selector: z.string().optional(), // CSS selector to test specific elements
    actions: z.array(z.object({
      type: z.enum(['CLICK', 'HOVER', 'SCROLL', 'TYPE', 'WAIT', 'NAVIGATE']),
      target: z.string().optional(),
      value: z.string().optional(),
      delay: z.number().optional(),
    })).default([]),
    ignoreElements: z.array(z.string()).default([]), // CSS selectors to ignore
    waitForElement: z.string().optional(),
    timeout: z.number().min(1000).max(60000).default(30000),
  })),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'ON_DEPLOY']).default('DAILY'),
    time: z.string().optional(),
    timezone: z.string().default('UTC'),
  }),
  notifications: z.object({
    enabled: z.boolean().default(true),
    channels: z.array(z.enum(['EMAIL', 'SLACK', 'WEBHOOK'])).default(['EMAIL']),
    recipients: z.array(z.string()),
    onFailureOnly: z.boolean().default(true),
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('DRAFT'),
  tenantId: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const TestExecutionSchema = z.object({
  id: z.string().optional(),
  suiteId: z.string(),
  executionType: z.enum(['MANUAL', 'SCHEDULED', 'ON_DEPLOY', 'API_TRIGGER']),
  status: z.enum(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).default('QUEUED'),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  duration: z.number().optional(), // milliseconds
  results: z.object({
    totalTests: z.number().min(0).default(0),
    passedTests: z.number().min(0).default(0),
    failedTests: z.number().min(0).default(0),
    skippedTests: z.number().min(0).default(0),
    newBaselines: z.number().min(0).default(0),
  }),
  testResults: z.array(z.object({
    testCaseId: z.string(),
    testCaseName: z.string(),
    status: z.enum(['PASS', 'FAIL', 'SKIP', 'NEW_BASELINE']),
    screenshots: z.object({
      baseline: z.string().optional(),
      actual: z.string().optional(),
      diff: z.string().optional(),
    }),
    metrics: z.object({
      pixelDifference: z.number().min(0).default(0),
      layoutShift: z.number().min(0).default(0),
      loadTime: z.number().min(0).default(0),
      renderTime: z.number().min(0).default(0),
    }),
    errors: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
  })).default([]),
  environment: z.string(),
  branch: z.string().optional(),
  commit: z.string().optional(),
  triggeredBy: z.string(),
  tenantId: z.string().optional(),
});

const BaselineImageSchema = z.object({
  id: z.string().optional(),
  testCaseId: z.string(),
  suiteId: z.string(),
  platform: z.string(),
  device: z.string(),
  browser: z.string(),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }),
  imageUrl: z.string(),
  imageHash: z.string(),
  metadata: z.object({
    timestamp: z.string(),
    environment: z.string(),
    branch: z.string().optional(),
    commit: z.string().optional(),
    createdBy: z.string(),
  }),
  isActive: z.boolean().default(true),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  tenantId: z.string().optional(),
});

// Visual Regression Testing Service
class VisualRegressionTestingService {
  private testSuites: Map<string, any> = new Map();
  private executions: Map<string, any> = new Map();
  private baselines: Map<string, any[]> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample test suites
    const sampleSuites = [
      {
        id: 'suite-001',
        name: 'RepairX Web Application - Main Flows',
        description: 'Visual regression tests for core user workflows',
        platform: 'WEB',
        environment: 'STAGING',
        configuration: {
          baseUrl: 'https://staging.repairx.com',
          viewport: { width: 1920, height: 1080 },
          devices: [
            { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
            { name: 'Tablet', viewport: { width: 768, height: 1024 } },
            { name: 'Mobile', viewport: { width: 375, height: 667 } },
          ],
          browsers: ['CHROME', 'FIREFOX'],
          thresholds: {
            pixel: 0.01,
            layout: 0.05,
            misMatchTolerance: 2,
          },
        },
        testCases: [
          {
            id: 'test-001',
            name: 'Landing Page',
            url: '/',
            actions: [
              { type: 'WAIT', delay: 2000 },
            ],
            waitForElement: '.hero-section',
            timeout: 30000,
          },
          {
            id: 'test-002',
            name: 'Login Page',
            url: '/login',
            actions: [
              { type: 'WAIT', delay: 1000 },
            ],
            ignoreElements: ['.captcha', '.csrf-token'],
            timeout: 15000,
          },
          {
            id: 'test-003',
            name: 'Dashboard - Customer',
            url: '/dashboard/customer',
            actions: [
              { type: 'WAIT', delay: 3000 },
            ],
            waitForElement: '.dashboard-content',
            timeout: 30000,
          },
          {
            id: 'test-004',
            name: 'Job Creation Flow',
            url: '/jobs/create',
            actions: [
              { type: 'CLICK', target: '#device-type', delay: 500 },
              { type: 'CLICK', target: '[data-value="smartphone"]', delay: 500 },
              { type: 'TYPE', target: '#issue-description', value: 'Screen is cracked', delay: 1000 },
              { type: 'WAIT', delay: 2000 },
            ],
            timeout: 45000,
          },
        ],
        schedule: {
          enabled: true,
          frequency: 'DAILY',
          time: '02:00',
          timezone: 'UTC',
        },
        notifications: {
          enabled: true,
          channels: ['EMAIL', 'SLACK'],
          recipients: ['qa@repairx.com', 'dev@repairx.com'],
          onFailureOnly: true,
        },
        status: 'ACTIVE',
        createdBy: 'qa-team-001',
        createdAt: '2025-08-01T00:00:00Z',
      },
      {
        id: 'suite-002',
        name: 'Mobile App - iOS Critical Flows',
        description: 'Visual regression tests for iOS mobile application',
        platform: 'IOS',
        environment: 'STAGING',
        configuration: {
          baseUrl: 'repairx://staging',
          viewport: { width: 375, height: 812 }, // iPhone X
          devices: [
            { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
            { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
            { name: 'iPhone 12 Pro Max', viewport: { width: 428, height: 926 } },
          ],
          browsers: ['SAFARI'],
          thresholds: {
            pixel: 0.02,
            layout: 0.03,
            misMatchTolerance: 3,
          },
        },
        testCases: [
          {
            id: 'ios-001',
            name: 'App Launch Screen',
            url: '/',
            actions: [
              { type: 'WAIT', delay: 5000 },
            ],
            timeout: 30000,
          },
          {
            id: 'ios-002',
            name: 'Customer Dashboard',
            url: '/customer-dashboard',
            actions: [
              { type: 'WAIT', delay: 3000 },
              { type: 'SCROLL', target: 'body', value: '500', delay: 1000 },
            ],
            timeout: 30000,
          },
        ],
        schedule: {
          enabled: true,
          frequency: 'ON_DEPLOY',
          timezone: 'UTC',
        },
        notifications: {
          enabled: true,
          channels: ['EMAIL'],
          recipients: ['mobile-qa@repairx.com'],
          onFailureOnly: false,
        },
        status: 'ACTIVE',
        createdBy: 'mobile-qa-001',
        createdAt: '2025-08-01T00:00:00Z',
      },
    ];

    sampleSuites.forEach((suite: unknown) => {
      this.testSuites.set(suite.id, suite);
    });

    // Sample execution results
    const sampleExecutions = [
      {
        id: 'exec-001',
        suiteId: 'suite-001',
        executionType: 'SCHEDULED',
        status: 'COMPLETED',
        startedAt: '2025-08-10T02:00:00Z',
        completedAt: '2025-08-10T02:15:32Z',
        duration: 932000,
        results: {
          totalTests: 4,
          passedTests: 3,
          failedTests: 1,
          skippedTests: 0,
          newBaselines: 0,
        },
        testResults: [
          {
            testCaseId: 'test-001',
            testCaseName: 'Landing Page',
            status: 'PASS',
            screenshots: {
              baseline: '/screenshots/baselines/test-001-chrome-1920x1080.png',
              actual: '/screenshots/actual/exec-001-test-001-chrome-1920x1080.png',
              diff: null,
            },
            metrics: {
              pixelDifference: 0.002,
              layoutShift: 0.01,
              loadTime: 1200,
              renderTime: 800,
            },
            errors: [],
            warnings: [],
          },
          {
            testCaseId: 'test-002',
            testCaseName: 'Login Page',
            status: 'PASS',
            screenshots: {
              baseline: '/screenshots/baselines/test-002-chrome-1920x1080.png',
              actual: '/screenshots/actual/exec-001-test-002-chrome-1920x1080.png',
              diff: null,
            },
            metrics: {
              pixelDifference: 0.005,
              layoutShift: 0.02,
              loadTime: 900,
              renderTime: 600,
            },
            errors: [],
            warnings: ['Minor font rendering difference detected'],
          },
          {
            testCaseId: 'test-003',
            testCaseName: 'Dashboard - Customer',
            status: 'FAIL',
            screenshots: {
              baseline: '/screenshots/baselines/test-003-chrome-1920x1080.png',
              actual: '/screenshots/actual/exec-001-test-003-chrome-1920x1080.png',
              diff: '/screenshots/diffs/exec-001-test-003-chrome-1920x1080.png',
            },
            metrics: {
              pixelDifference: 0.045,
              layoutShift: 0.08,
              loadTime: 2100,
              renderTime: 1500,
            },
            errors: ['Pixel difference exceeds threshold (4.5% > 1%)', 'Layout shift detected in sidebar navigation'],
            warnings: ['Slow rendering performance detected'],
          },
          {
            testCaseId: 'test-004',
            testCaseName: 'Job Creation Flow',
            status: 'PASS',
            screenshots: {
              baseline: '/screenshots/baselines/test-004-chrome-1920x1080.png',
              actual: '/screenshots/actual/exec-001-test-004-chrome-1920x1080.png',
              diff: null,
            },
            metrics: {
              pixelDifference: 0.008,
              layoutShift: 0.03,
              loadTime: 1800,
              renderTime: 1200,
            },
            errors: [],
            warnings: [],
          },
        ],
        environment: 'staging',
        branch: 'develop',
        commit: 'abc123def456',
        triggeredBy: 'scheduler',
      },
    ];

    sampleExecutions.forEach((execution: unknown) => {
      this.executions.set(execution.id, execution);
    });
  }

  // Test Suite Management
  async getAllTestSuites(tenantId?: string, filters?: any): Promise<any[]> {
    let suites = Array.from(this.testSuites.values());
    
    if (tenantId) {
      suites = suites.filter((suite: unknown) => suite.tenantId === tenantId);
    }

    if (filters) {
      if (filters.platform) {
        suites = suites.filter((suite: unknown) => suite.platform === filters.platform || suite.platform === 'ALL');
      }
      if (filters.status) {
        suites = suites.filter((suite: unknown) => suite.status === filters.status);
      }
      if (filters.environment) {
        suites = suites.filter((suite: unknown) => suite.environment === filters.environment);
      }
    }

    return suites;
  }

  async getTestSuiteById(suiteId: string): Promise<any | null> {
    return this.testSuites.get(suiteId) || null;
  }

  async createTestSuite(suiteData: unknown): Promise<any> {
    const validated = TestSuiteSchema.parse(suiteData);
    const id = validated.id || `suite-${Date.now()}`;
    
    const suite = { 
      ...validated, 
      id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.testSuites.set(id, suite);
    return suite;
  }

  async updateTestSuite(suiteId: string, updateData: unknown): Promise<any> {
    const existingSuite = this.testSuites.get(suiteId);
    if (!existingSuite) {
      throw new Error('Test suite not found');
    }

    const updatedSuite = { 
      ...existingSuite, 
      ...updateData, 
      updatedAt: new Date().toISOString(),
    };
    
    const validated = TestSuiteSchema.parse(updatedSuite);
    this.testSuites.set(suiteId, validated);
    
    return validated;
  }

  // Test Execution
  async executeTestSuite(suiteId: string, executionData: unknown): Promise<any> {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error('Test suite not found');
    }

    if (suite.status !== 'ACTIVE') {
      throw new Error('Test suite is not active');
    }

    const execution = {
      id: `exec-${Date.now()}`,
      suiteId: suiteId,
      executionType: (executionData as any).executionType || 'MANUAL',
      status: 'QUEUED',
      triggeredBy: (executionData as any).triggeredBy || 'user',
      environment: (executionData as any).environment || suite.environment,
      branch: (executionData as any).branch,
      commit: (executionData as any).commit,
    };

    this.executions.set(execution.id, execution);

    // Simulate test execution (in real implementation, this would be async)
    setTimeout(() => {
      this.simulateTestExecution(execution.id, suite);
    }, 1000);

    return execution;
  }

  private async simulateTestExecution(executionId: string, suite: unknown): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    execution.status = 'RUNNING';
    execution.startedAt = new Date().toISOString();

    // Simulate test execution for each test case
    const testResults = await Promise.all(
      suite.testCases.map(async (testCase: unknown) => {
        // Simulate test execution time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 1000));

        const success = Math.random() > 0.2; // 80% success rate
        
        return {
          testCaseId: testCase.id,
          testCaseName: testCase.name,
          status: success ? 'PASS' : 'FAIL',
          screenshots: {
            baseline: `/screenshots/baselines/${testCase.id}.png`,
            actual: `/screenshots/actual/${executionId}-${testCase.id}.png`,
            diff: success ? null : `/screenshots/diffs/${executionId}-${testCase.id}.png`,
          },
          metrics: {
            pixelDifference: Math.random() * 0.05,
            layoutShift: Math.random() * 0.1,
            loadTime: Math.round(Math.random() * 2000 + 500),
            renderTime: Math.round(Math.random() * 1000 + 300),
          },
          errors: success ? [] : ['Visual differences detected'],
          warnings: [],
        };
      })
    );

    const passed = testResults.filter((r: unknown) => r.status === 'PASS').length;
    const failed = testResults.filter((r: unknown) => r.status === 'FAIL').length;

    execution.status = 'COMPLETED';
    execution.completedAt = new Date().toISOString();
    execution.duration = new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime();
    execution.results = {
      totalTests: testResults.length,
      passedTests: passed,
      failedTests: failed,
      skippedTests: 0,
      newBaselines: 0,
    };
    execution.testResults = testResults;

    this.executions.set(executionId, execution);

    // Send notifications if configured
    if (suite.notifications.enabled && (failed > 0 || !suite.notifications.onFailureOnly)) {
      await this.sendNotifications(suite, execution);
    }
  }

  private async sendNotifications(suite: unknown, execution: unknown): Promise<void> {
    // Simulate notification sending
    console.log(`Sending notifications for execution ${execution.id} of suite ${suite.name}`);
    
    const notificationData = {
      suiteName: suite.name,
      executionId: execution.id,
      status: execution.status,
      results: execution.results,
      environment: execution.environment,
      dashboardUrl: `https://testing.repairx.com/visual-regression/executions/${execution.id}`,
    };

    suite.notifications.channels.forEach(async (channel: string) => {
      switch (channel) {
        case 'EMAIL':
          // Simulate email notification
          console.log('Email notification sent to:', suite.notifications.recipients);
          break;
        case 'SLACK':
          // Simulate Slack notification
          console.log('Slack notification sent');
          break;
        case 'WEBHOOK':
          // Simulate webhook call
          console.log('Webhook notification sent');
          break;
      }
    });
  }

  // Execution Management
  async getTestExecutions(suiteId?: string, limit: number = 20): Promise<any[]> {
    let executions = Array.from(this.executions.values());
    
    if (suiteId) {
      executions = executions.filter((exec: unknown) => exec.suiteId === suiteId);
    }

    return executions
      .sort((a, b) => new Date(b.startedAt || b.createdAt).getTime() - new Date(a.startedAt || a.createdAt).getTime())
      .slice(0, limit);
  }

  async getExecutionById(executionId: string): Promise<any | null> {
    return this.executions.get(executionId) || null;
  }

  // Baseline Management
  async createBaseline(testCaseId: string, suiteId: string, baselineData: unknown): Promise<any> {
    const validated = BaselineImageSchema.parse({
      ...baselineData,
      testCaseId,
      suiteId,
      metadata: {
        ...(baselineData as any).metadata,
        timestamp: new Date().toISOString(),
      },
    });

    const id = validated.id || `baseline-${Date.now()}`;
    const baseline = { ...validated, id };

    const testCaseBaselines = this.baselines.get(testCaseId) || [];
    
    // Deactivate previous baselines
    testCaseBaselines.forEach((b: unknown) => b.isActive = false);
    
    // Add new baseline
    testCaseBaselines.push(baseline);
    this.baselines.set(testCaseId, testCaseBaselines);

    return baseline;
  }

  async getBaselines(testCaseId?: string): Promise<any[]> {
    if (testCaseId) {
      return this.baselines.get(testCaseId) || [];
    }

    const allBaselines: unknown[] = [];
    for (const baselines of this.baselines.values()) {
      allBaselines.push(...baselines);
    }
    
    return allBaselines;
  }

  // Analytics and Reporting
  async getTestingAnalytics(tenantId?: string, period?: { start: string; end: string }): Promise<any> {
    const suites = await this.getAllTestSuites(tenantId);
    const executions = Array.from(this.executions.values());

    let filteredExecutions = executions;
    if (period) {
      filteredExecutions = executions.filter((exec: unknown) => {
        const execDate = new Date(exec.startedAt || exec.createdAt);
        return execDate >= new Date(period.start) && execDate <= new Date(period.end);
      });
    }

    const analytics = {
      overview: {
        totalSuites: suites.length,
        activeSuites: suites.filter((s: unknown) => s.status === 'ACTIVE').length,
        totalExecutions: filteredExecutions.length,
        successfulExecutions: filteredExecutions.filter((e: unknown) => e.status === 'COMPLETED' && e.results?.failedTests === 0).length,
      },
      trends: {
        executionsOverTime: this.calculateExecutionTrends(filteredExecutions),
        successRate: this.calculateSuccessRateTrends(filteredExecutions),
        averageExecutionTime: this.calculateAverageExecutionTime(filteredExecutions),
      },
      platforms: {
        web: suites.filter((s: unknown) => s.platform === 'WEB' || s.platform === 'ALL').length,
        ios: suites.filter((s: unknown) => s.platform === 'IOS' || s.platform === 'ALL').length,
        android: suites.filter((s: unknown) => s.platform === 'ANDROID' || s.platform === 'ALL').length,
      },
      qualityMetrics: {
        averagePixelDifference: this.calculateAveragePixelDifference(filteredExecutions),
        averageLayoutShift: this.calculateAverageLayoutShift(filteredExecutions),
        averageLoadTime: this.calculateAverageLoadTime(filteredExecutions),
      },
    };

    return analytics;
  }

  private calculateExecutionTrends(executions: unknown[]): any[] {
    const dailyExecutions = new Map();
    
    executions.forEach((exec: unknown) => {
      const date = new Date(exec.startedAt || exec.createdAt).toISOString().split('T')[0];
      dailyExecutions.set(date, (dailyExecutions.get(date) || 0) + 1);
    });

    return Array.from(dailyExecutions.entries())
      .map(([date, count]) => ({ date, executions: count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateSuccessRateTrends(executions: unknown[]): any[] {
    const dailySuccess = new Map();
    
    executions.forEach((exec: unknown) => {
      const date = new Date(exec.startedAt || exec.createdAt).toISOString().split('T')[0];
      const isSuccess = exec.status === 'COMPLETED' && exec.results?.failedTests === 0;
      
      if (!dailySuccess.has(date)) {
        dailySuccess.set(date, { total: 0, successful: 0 });
      }
      
      const dayData = dailySuccess.get(date);
      (dayData as any).total += 1;
      if (isSuccess) (dayData as any).successful += 1;
    });

    return Array.from(dailySuccess.entries())
      .map(([date, data]) => ({ 
        date, 
        successRate: data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0 
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateAverageExecutionTime(executions: unknown[]): number {
    const completedExecutions = executions.filter((e: unknown) => e.duration);
    if (completedExecutions.length === 0) return 0;
    
    const totalDuration = completedExecutions.reduce((sum: unknown, exec: unknown) => sum + exec.duration, 0);
    return Math.round(totalDuration / completedExecutions.length);
  }

  private calculateAveragePixelDifference(executions: unknown[]): number {
    const allResults = executions.flatMap(e => e.testResults || []);
    if (allResults.length === 0) return 0;
    
    const totalPixelDiff = allResults.reduce((sum: unknown, result: unknown) => sum + (result.metrics?.pixelDifference || 0), 0);
    return Math.round((totalPixelDiff / allResults.length) * 10000) / 100; // Convert to percentage
  }

  private calculateAverageLayoutShift(executions: unknown[]): number {
    const allResults = executions.flatMap(e => e.testResults || []);
    if (allResults.length === 0) return 0;
    
    const totalLayoutShift = allResults.reduce((sum: unknown, result: unknown) => sum + (result.metrics?.layoutShift || 0), 0);
    return Math.round((totalLayoutShift / allResults.length) * 10000) / 100; // Convert to percentage
  }

  private calculateAverageLoadTime(executions: unknown[]): number {
    const allResults = executions.flatMap(e => e.testResults || []);
    if (allResults.length === 0) return 0;
    
    const totalLoadTime = allResults.reduce((sum: unknown, result: unknown) => sum + (result.metrics?.loadTime || 0), 0);
    return Math.round(totalLoadTime / allResults.length);
  }
}

// Route Handlers
export async function visualRegressionTestingRoutes(server: FastifyInstance): Promise<void> {
  const testingService = new VisualRegressionTestingService();

  // Get all test suites
  server.get('/', async (request: FastifyRequest<{
    Querystring: { 
      tenantId?: string;
      platform?: string;
      status?: string;
      environment?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, ...filters } = request.query;
      const suites = await testingService.getAllTestSuites(tenantId, filters);
      
      return reply.send({
        success: true,
        data: suites,
        count: suites.length,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve test suites',
        error: error.message,
      });
    }
  });

  // Create new test suite
  server.post('/', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const suiteData = request.body;
      const suite = await testingService.createTestSuite(suiteData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: suite,
        message: 'Test suite created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create test suite',
        error: error.message,
      });
    }
  });

  // Get test suite by ID
  server.get('/:suiteId', async (request: FastifyRequest<{
    Params: { suiteId: string }
  }>, reply: FastifyReply) => {
    try {
      const { suiteId  } = (request.params as unknown);
      const suite = await testingService.getTestSuiteById(suiteId);
      
      if (!suite) {
        return (reply as FastifyReply).status(404).send({
          success: false,
          message: 'Test suite not found',
        });
      }
      
      return reply.send({
        success: true,
        data: suite,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve test suite',
        error: error.message,
      });
    }
  });

  // Update test suite
  server.put('/:suiteId', async (request: FastifyRequest<{
    Params: { suiteId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { suiteId  } = (request.params as unknown);
      const updateData = request.body;
      
      const suite = await testingService.updateTestSuite(suiteId, updateData);
      
      return reply.send({
        success: true,
        data: suite,
        message: 'Test suite updated successfully',
      });
    } catch (error: unknown) {
      const status = error.message === 'Test suite not found' ? 404 : 400;
      return (reply as FastifyReply).status(status).send({
        success: false,
        message: 'Failed to update test suite',
        error: error.message,
      });
    }
  });

  // Execute test suite
  server.post('/:suiteId/execute', async (request: FastifyRequest<{
    Params: { suiteId: string }
    Body: {
      executionType?: string;
      environment?: string;
      branch?: string;
      commit?: string;
      triggeredBy?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { suiteId  } = (request.params as unknown);
      const executionData = request.body;
      
      const execution = await testingService.executeTestSuite(suiteId, executionData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: execution,
        message: 'Test suite execution started',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to execute test suite',
        error: error.message,
      });
    }
  });

  // Get test executions
  server.get('/executions/:suiteId?', async (request: FastifyRequest<{
    Params: { suiteId?: string }
    Querystring: { limit?: number }
  }>, reply: FastifyReply) => {
    try {
      const { suiteId  } = (request.params as unknown);
      const { limit = 20 } = request.query;
      
      const executions = await testingService.getTestExecutions(suiteId, limit);
      
      return reply.send({
        success: true,
        data: executions,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve test executions',
        error: error.message,
      });
    }
  });

  // Get execution details
  server.get('/executions/:executionId/details', async (request: FastifyRequest<{
    Params: { executionId: string }
  }>, reply: FastifyReply) => {
    try {
      const { executionId  } = (request.params as unknown);
      const execution = await testingService.getExecutionById(executionId);
      
      if (!execution) {
        return (reply as FastifyReply).status(404).send({
          success: false,
          message: 'Test execution not found',
        });
      }
      
      return reply.send({
        success: true,
        data: execution,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve test execution details',
        error: error.message,
      });
    }
  });

  // Create baseline
  server.post('/:suiteId/test-cases/:testCaseId/baseline', async (request: FastifyRequest<{
    Params: { suiteId: string; testCaseId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { suiteId, testCaseId  } = (request.params as unknown);
      const baselineData = request.body;
      
      const baseline = await testingService.createBaseline(testCaseId, suiteId, baselineData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: baseline,
        message: 'Baseline created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create baseline',
        error: error.message,
      });
    }
  });

  // Get baselines
  server.get('/baselines/:testCaseId?', async (request: FastifyRequest<{
    Params: { testCaseId?: string }
  }>, reply: FastifyReply) => {
    try {
      const { testCaseId  } = (request.params as unknown);
      const baselines = await testingService.getBaselines(testCaseId);
      
      return reply.send({
        success: true,
        data: baselines,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve baselines',
        error: error.message,
      });
    }
  });

  // Get testing analytics
  server.get('/analytics/overview', async (request: FastifyRequest<{
    Querystring: { 
      tenantId?: string;
      startDate?: string;
      endDate?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, startDate, endDate  } = (request.query as unknown);
      
      const period = startDate && endDate ? { start: startDate, end: endDate } : undefined;
      const analytics = await testingService.getTestingAnalytics(tenantId, period);
      
      return reply.send({
        success: true,
        data: analytics,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve testing analytics',
        error: error.message,
      });
    }
  });

  // Get available platforms
  server.get('/platforms/list', async (request: FastifyRequest, reply: FastifyReply) => {
    const platforms = [
      { id: 'WEB', name: 'Web Application', icon: '🌐' },
      { id: 'IOS', name: 'iOS Mobile App', icon: '📱' },
      { id: 'ANDROID', name: 'Android Mobile App', icon: '🤖' },
      { id: 'ALL', name: 'All Platforms', icon: '🎯' },
    ];

    return reply.send({
      success: true,
      data: platforms,
    });
  });
}

export default visualRegressionTestingRoutes;