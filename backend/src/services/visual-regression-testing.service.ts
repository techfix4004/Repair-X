import { PrismaClient } from '@prisma/client';
import { chromium, firefox, webkit, Browser, Page, BrowserContext } from 'playwright';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Production Visual Regression Testing Service
// Advanced automated testing infrastructure with cross-browser support

export interface VisualRegressionSuiteResult {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  browsers: string[];
  devices: string[];
  viewports: any;
  threshold: number;
  ignoreElements: string[];
  isActive: boolean;
  testRuns: VisualTestRunResult[];
  baselines: VisualBaselineResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VisualTestRunResult {
  id: string;
  suiteId: string;
  runNumber: number;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  gitCommit?: string;
  branch?: string;
  environment: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  startedAt: Date;
  completedAt?: Date;
  testResults: VisualTestResultDetail[];
}

export interface VisualTestResultDetail {
  id: string;
  testName: string;
  url: string;
  browser: string;
  device: string;
  viewport: string;
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'ERROR' | 'BASELINE_MISSING';
  baselineImageUrl?: string;
  currentImageUrl: string;
  diffImageUrl?: string;
  diffPercentage?: number;
  pixelDiff?: number;
  errorMessage?: string;
}

export interface VisualBaselineResult {
  id: string;
  suiteId: string;
  testName: string;
  url: string;
  browser: string;
  device: string;
  viewport: string;
  imageUrl: string;
  imageHash: string;
  isActive: boolean;
  createdFromRun?: string;
  createdAt: Date;
}

export interface TestConfiguration {
  browsers: ('chrome' | 'firefox' | 'webkit')[];
  devices: DeviceConfig[];
  viewports: ViewportConfig[];
  threshold: number;
  ignoreElements: string[];
  waitTime: number;
  retryCount: number;
}

export interface DeviceConfig {
  name: string;
  userAgent: string;
  viewport: ViewportConfig;
  isMobile: boolean;
  hasTouch: boolean;
}

export interface ViewportConfig {
  width: number;
  height: number;
}

export interface TestAction {
  type: 'click' | 'hover' | 'scroll' | 'type' | 'wait' | 'navigate';
  selector?: string;
  value?: string;
  delay?: number;
}

class VisualRegressionTestingService {
  private prisma: PrismaClient;
  private browsers: Map<string, Browser> = new Map();
  private screenshotStorage: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.screenshotStorage = process.env.SCREENSHOT_STORAGE_PATH || './visual-testing-screenshots';
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    await fs.mkdir(this.screenshotStorage, { recursive: true });
    await fs.mkdir(path.join(this.screenshotStorage, 'baselines'), { recursive: true });
    await fs.mkdir(path.join(this.screenshotStorage, 'current'), { recursive: true });
    await fs.mkdir(path.join(this.screenshotStorage, 'diffs'), { recursive: true });
  }

  // Test Suite Management
  async createTestSuite(suiteData: {
    name: string;
    description?: string;
    baseUrl: string;
    browsers: string[];
    devices: string[];
    viewports: any;
    threshold?: number;
    ignoreElements?: string[];
  }): Promise<VisualRegressionSuiteResult> {
    const suite = await this.prisma.visualRegressionSuite.create({
      data: {
        name: suiteData.name,
        description: suiteData.description,
        baseUrl: suiteData.baseUrl,
        browsers: suiteData.browsers,
        devices: suiteData.devices,
        viewports: suiteData.viewports,
        threshold: suiteData.threshold || 0.01,
        ignoreElements: suiteData.ignoreElements || [],
        isActive: true,
      },
      include: {
        testRuns: {
          include: {
            testResults: true,
          },
          orderBy: { runNumber: 'desc' },
          take: 10,
        },
        baselines: true,
      },
    });

    return this.formatSuiteResult(suite);
  }

  async getTestSuite(id: string): Promise<VisualRegressionSuiteResult | null> {
    const suite = await this.prisma.visualRegressionSuite.findUnique({
      where: { id },
      include: {
        testRuns: {
          include: {
            testResults: true,
          },
          orderBy: { runNumber: 'desc' },
          take: 10,
        },
        baselines: true,
      },
    });

    if (!suite) return null;
    return this.formatSuiteResult(suite);
  }

  // Test Execution
  async runVisualTests(
    suiteId: string,
    config: {
      gitCommit?: string;
      branch?: string;
      environment?: string;
      testUrls: string[];
    }
  ): Promise<VisualTestRunResult> {
    const suite = await this.prisma.visualRegressionSuite.findUnique({
      where: { id: suiteId },
    });

    if (!suite) {
      throw new Error('Test suite not found');
    }

    // Create test run record
    const lastRun = await this.prisma.visualTestRun.findFirst({
      where: { suiteId },
      orderBy: { runNumber: 'desc' },
    });

    const runNumber = (lastRun?.runNumber || 0) + 1;

    const testRun = await this.prisma.visualTestRun.create({
      data: {
        suiteId,
        runNumber,
        status: 'RUNNING',
        gitCommit: config.gitCommit,
        branch: config.branch,
        environment: config.environment || 'staging',
        totalTests: config.testUrls.length * suite.browsers.length * suite.devices.length,
        passedTests: 0,
        failedTests: 0,
        startedAt: new Date(),
      },
      include: {
        testResults: true,
      },
    });

    // Execute tests asynchronously
    this.executeTestRun(testRun.id, suite, config.testUrls);

    return this.formatTestRunResult(testRun);
  }

  private async executeTestRun(
    testRunId: string,
    suite: any,
    testUrls: string[]
  ): Promise<void> {
    try {
      await this.initializeBrowsers(suite.browsers);

      let passedTests = 0;
      let failedTests = 0;

      for (const url of testUrls) {
        for (const browserName of suite.browsers) {
          for (const device of suite.devices) {
            try {
              const result = await this.executeVisualTest(
                testRunId,
                suite,
                url,
                browserName,
                device
              );

              if (result.status === 'PASSED') {
                passedTests++;
              } else {
                failedTests++;
              }
            } catch (error) {
              console.error(`Error testing ${url} on ${browserName}/${device}:`, error);
              failedTests++;
            }
          }
        }
      }

      // Update test run with final results
      await this.prisma.visualTestRun.update({
        where: { id: testRunId },
        data: {
          status: 'COMPLETED',
          passedTests,
          failedTests,
          completedAt: new Date(),
        },
      });

    } catch (error) {
      console.error('Error executing test run:', error);
      
      await this.prisma.visualTestRun.update({
        where: { id: testRunId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });
    } finally {
      await this.closeBrowsers();
    }
  }

  private async executeVisualTest(
    testRunId: string,
    suite: any,
    url: string,
    browserName: string,
    device: string
  ): Promise<VisualTestResultDetail> {
    const browser = this.browsers.get(browserName);
    if (!browser) {
      throw new Error(`Browser ${browserName} not initialized`);
    }

    const deviceConfig = this.getDeviceConfig(device);
    const context = await browser.newContext({
      viewport: deviceConfig.viewport,
      userAgent: deviceConfig.userAgent,
      isMobile: deviceConfig.isMobile,
      hasTouch: deviceConfig.hasTouch,
    });

    const page = await context.newPage();

    try {
      // Navigate to test URL
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for page to stabilize
      await page.waitForTimeout(2000);

      // Hide dynamic elements
      await this.hideIgnoredElements(page, suite.ignoreElements);

      // Take screenshot
      const screenshotBuffer = await page.screenshot({
        fullPage: true,
        type: 'png',
      });

      const testName = this.generateTestName(url, browserName, device);
      const viewportString = `${deviceConfig.viewport.width}x${deviceConfig.viewport.height}`;

      // Save current screenshot
      const currentImagePath = await this.saveScreenshot(
        screenshotBuffer,
        'current',
        testName
      );

      // Get baseline screenshot
      const baseline = await this.getBaseline(
        suite.id,
        testName,
        url,
        browserName,
        device,
        viewportString
      );

      let status: 'PASSED' | 'FAILED' | 'BASELINE_MISSING' = 'BASELINE_MISSING';
      let diffPercentage: number | undefined;
      let pixelDiff: number | undefined;
      let diffImageUrl: string | undefined;

      if (baseline) {
        // Compare with baseline
        const comparison = await this.compareScreenshots(
          baseline.imageUrl,
          currentImagePath,
          suite.threshold
        );

        status = comparison.isMatch ? 'PASSED' : 'FAILED';
        diffPercentage = comparison.diffPercentage;
        pixelDiff = comparison.pixelDiff;

        if (!comparison.isMatch) {
          diffImageUrl = await this.saveDiffImage(
            baseline.imageUrl,
            currentImagePath,
            testName
          );
        }
      } else {
        // Create new baseline
        await this.createBaseline(
          suite.id,
          testName,
          url,
          browserName,
          device,
          viewportString,
          currentImagePath,
          testRunId
        );
      }

      // Save test result
      const testResult = await this.prisma.visualTestResult.create({
        data: {
          testRunId,
          testName,
          url,
          browser: browserName,
          device,
          viewport: viewportString,
          status,
          baselineImageUrl: baseline?.imageUrl,
          currentImageUrl: currentImagePath,
          diffImageUrl,
          diffPercentage,
          pixelDiff,
        },
      });

      return this.formatTestResultDetail(testResult);

    } finally {
      await context.close();
    }
  }

  // Screenshot Comparison
  private async compareScreenshots(
    baselineImageUrl: string,
    currentImagePath: string,
    threshold: number
  ): Promise<{
    isMatch: boolean;
    diffPercentage: number;
    pixelDiff: number;
  }> {
    try {
      // Load baseline and current images
      const baselineBuffer = await fs.readFile(baselineImageUrl);
      const currentBuffer = await fs.readFile(currentImagePath);

      // Ensure images are the same size
      const { width, height } = await sharp(baselineBuffer).metadata();
      const resizedCurrent = await sharp(currentBuffer)
        .resize(width, height)
        .png()
        .toBuffer();

      // Calculate pixel-by-pixel difference
      const baselinePixels = await sharp(baselineBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const currentPixels = await sharp(resizedCurrent)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const totalPixels = baselinePixels.data.length / 3; // RGB
      let differentPixels = 0;

      for (let i = 0; i < baselinePixels.data.length; i += 3) {
        const rDiff = Math.abs(baselinePixels.data[i] - currentPixels.data[i]);
        const gDiff = Math.abs(baselinePixels.data[i + 1] - currentPixels.data[i + 1]);
        const bDiff = Math.abs(baselinePixels.data[i + 2] - currentPixels.data[i + 2]);

        // Consider pixel different if any channel differs by more than 10
        if (rDiff > 10 || gDiff > 10 || bDiff > 10) {
          differentPixels++;
        }
      }

      const diffPercentage = (differentPixels / totalPixels) * 100;
      const isMatch = diffPercentage <= threshold;

      return {
        isMatch,
        diffPercentage,
        pixelDiff: differentPixels,
      };

    } catch (error) {
      console.error('Error comparing screenshots:', error);
      return {
        isMatch: false,
        diffPercentage: 100,
        pixelDiff: 0,
      };
    }
  }

  private async saveDiffImage(
    baselineImageUrl: string,
    currentImagePath: string,
    testName: string
  ): Promise<string> {
    try {
      // Create diff image highlighting differences
      const baselineBuffer = await fs.readFile(baselineImageUrl);
      const currentBuffer = await fs.readFile(currentImagePath);

      // Use ImageMagick to create diff image
      const diffPath = path.join(this.screenshotStorage, 'diffs', `${testName}-diff-${Date.now()}.png`);
      
      await execAsync(
        `magick compare "${baselineImageUrl}" "${currentImagePath}" "${diffPath}"`
      );

      return diffPath;
    } catch (error) {
      console.error('Error creating diff image:', error);
      return '';
    }
  }

  // Baseline Management
  private async getBaseline(
    suiteId: string,
    testName: string,
    url: string,
    browser: string,
    device: string,
    viewport: string
  ): Promise<VisualBaselineResult | null> {
    const baseline = await this.prisma.visualBaseline.findFirst({
      where: {
        suiteId,
        testName,
        browser,
        device,
        viewport,
        isActive: true,
      },
    });

    if (!baseline) return null;
    return this.formatBaselineResult(baseline);
  }

  private async createBaseline(
    suiteId: string,
    testName: string,
    url: string,
    browser: string,
    device: string,
    viewport: string,
    imagePath: string,
    createdFromRun: string
  ): Promise<VisualBaselineResult> {
    // Calculate image hash for quick comparison
    const imageBuffer = await fs.readFile(imagePath);
    const imageHash = await this.calculateImageHash(imageBuffer);

    // Copy image to baseline directory
    const baselinePath = path.join(
      this.screenshotStorage,
      'baselines',
      `${testName}-baseline.png`
    );
    await fs.copyFile(imagePath, baselinePath);

    const baseline = await this.prisma.visualBaseline.create({
      data: {
        suiteId,
        testName,
        url,
        browser,
        device,
        viewport,
        imageUrl: baselinePath,
        imageHash,
        isActive: true,
        createdFromRun,
      },
    });

    return this.formatBaselineResult(baseline);
  }

  async updateBaseline(
    suiteId: string,
    testName: string,
    browser: string,
    device: string,
    viewport: string,
    newImagePath: string
  ): Promise<VisualBaselineResult> {
    // Deactivate old baseline
    await this.prisma.visualBaseline.updateMany({
      where: {
        suiteId,
        testName,
        browser,
        device,
        viewport,
        isActive: true,
      },
      data: { isActive: false },
    });

    // Create new baseline
    const imageBuffer = await fs.readFile(newImagePath);
    const imageHash = await this.calculateImageHash(imageBuffer);

    const baselinePath = path.join(
      this.screenshotStorage,
      'baselines',
      `${testName}-baseline-${Date.now()}.png`
    );
    await fs.copyFile(newImagePath, baselinePath);

    const baseline = await this.prisma.visualBaseline.create({
      data: {
        suiteId,
        testName,
        url: '', // Will be updated with actual URL
        browser,
        device,
        viewport,
        imageUrl: baselinePath,
        imageHash,
        isActive: true,
      },
    });

    return this.formatBaselineResult(baseline);
  }

  // Browser Management
  private async initializeBrowsers(browserNames: string[]): Promise<void> {
    for (const browserName of browserNames) {
      if (!this.browsers.has(browserName)) {
        let browser: Browser;

        switch (browserName.toLowerCase()) {
          case 'chrome':
          case 'chromium':
            browser = await chromium.launch({
              headless: true,
              args: ['--no-sandbox', '--disable-dev-shm-usage'],
            });
            break;
          case 'firefox':
            browser = await firefox.launch({ headless: true });
            break;
          case 'webkit':
          case 'safari':
            browser = await webkit.launch({ headless: true });
            break;
          default:
            throw new Error(`Unsupported browser: ${browserName}`);
        }

        this.browsers.set(browserName, browser);
      }
    }
  }

  private async closeBrowsers(): Promise<void> {
    for (const [browserName, browser] of this.browsers) {
      try {
        await browser.close();
      } catch (error) {
        console.error(`Error closing ${browserName}:`, error);
      }
    }
    this.browsers.clear();
  }

  // Helper Methods
  private async hideIgnoredElements(page: Page, ignoreElements: string[]): Promise<void> {
    for (const selector of ignoreElements) {
      try {
        await page.addStyleTag({
          content: `${selector} { visibility: hidden !important; }`,
        });
      } catch (error) {
        console.warn(`Failed to hide element ${selector}:`, error);
      }
    }
  }

  private async saveScreenshot(
    screenshotBuffer: Buffer,
    directory: string,
    testName: string
  ): Promise<string> {
    const fileName = `${testName}-${Date.now()}.png`;
    const filePath = path.join(this.screenshotStorage, directory, fileName);
    await fs.writeFile(filePath, screenshotBuffer);
    return filePath;
  }

  private async calculateImageHash(imageBuffer: Buffer): Promise<string> {
    // Calculate a perceptual hash for the image
    const metadata = await sharp(imageBuffer).metadata();
    const grayImage = await sharp(imageBuffer)
      .grayscale()
      .resize(64, 64)
      .raw()
      .toBuffer();

    // Simple hash calculation (in production, use a proper perceptual hashing library)
    const hash = grayImage.toString('base64').slice(0, 16);
    return hash;
  }

  private generateTestName(url: string, browser: string, device: string): string {
    const urlPath = new URL(url).pathname.replace(/\//g, '_') || 'home';
    return `${urlPath}_${browser}_${device}`.toLowerCase();
  }

  private getDeviceConfig(deviceName: string): DeviceConfig {
    const devices: Record<string, DeviceConfig> = {
      'desktop': {
        name: 'Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 },
        isMobile: false,
        hasTouch: false,
      },
      'tablet': {
        name: 'Tablet',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        viewport: { width: 1024, height: 768 },
        isMobile: true,
        hasTouch: true,
      },
      'mobile': {
        name: 'Mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    };

    return devices[deviceName.toLowerCase()] || devices['desktop']!;
  }

  // CI/CD Integration
  async runTestsFromCI(
    suiteId: string,
    ciConfig: {
      gitCommit: string;
      branch: string;
      pullRequestId?: string;
      environment: string;
      baseUrl?: string;
    }
  ): Promise<VisualTestRunResult> {
    const suite = await this.prisma.visualRegressionSuite.findUnique({
      where: { id: suiteId },
    });

    if (!suite) {
      throw new Error('Test suite not found');
    }

    // Update base URL if provided (for different environments)
    const testUrls = [
      ciConfig.baseUrl || suite.baseUrl,
      `${ciConfig.baseUrl || suite.baseUrl}/dashboard`,
      `${ciConfig.baseUrl || suite.baseUrl}/jobs`,
      `${ciConfig.baseUrl || suite.baseUrl}/settings`,
    ];

    return this.runVisualTests(suiteId, {
      gitCommit: ciConfig.gitCommit,
      branch: ciConfig.branch,
      environment: ciConfig.environment,
      testUrls,
    });
  }

  // Reporting
  async generateTestReport(testRunId: string): Promise<string> {
    const testRun = await this.prisma.visualTestRun.findUnique({
      where: { id: testRunId },
      include: {
        suite: true,
        testResults: true,
      },
    });

    if (!testRun) {
      throw new Error('Test run not found');
    }

    // Generate HTML report
    const reportHtml = this.generateHtmlReport(testRun);
    const reportPath = path.join(this.screenshotStorage, `report-${testRunId}.html`);
    await fs.writeFile(reportPath, reportHtml);

    return reportPath;
  }

  private generateHtmlReport(testRun: any): string {
    const passRate = testRun.totalTests > 0 ? 
      ((testRun.passedTests / testRun.totalTests) * 100).toFixed(1) : '0';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Visual Regression Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
          .summary { display: flex; gap: 20px; margin: 20px 0; }
          .metric { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .pass { color: #28a745; }
          .fail { color: #dc3545; }
          .test-result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
          .images { display: flex; gap: 10px; }
          .images img { max-width: 300px; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Visual Regression Test Report</h1>
          <p><strong>Suite:</strong> ${testRun.suite.name}</p>
          <p><strong>Run:</strong> #${testRun.runNumber}</p>
          <p><strong>Environment:</strong> ${testRun.environment}</p>
          <p><strong>Branch:</strong> ${testRun.branch || 'N/A'}</p>
          <p><strong>Commit:</strong> ${testRun.gitCommit || 'N/A'}</p>
        </div>

        <div class="summary">
          <div class="metric">
            <h3>Pass Rate</h3>
            <div class="${testRun.failedTests === 0 ? 'pass' : 'fail'}">${passRate}%</div>
          </div>
          <div class="metric">
            <h3>Total Tests</h3>
            <div>${testRun.totalTests}</div>
          </div>
          <div class="metric">
            <h3>Passed</h3>
            <div class="pass">${testRun.passedTests}</div>
          </div>
          <div class="metric">
            <h3>Failed</h3>
            <div class="fail">${testRun.failedTests}</div>
          </div>
        </div>

        <h2>Test Results</h2>
        ${testRun.testResults.map((result: any) => `
          <div class="test-result">
            <h3 class="${result.status === 'PASSED' ? 'pass' : 'fail'}">
              ${result.testName} - ${result.status}
            </h3>
            <p><strong>URL:</strong> ${result.url}</p>
            <p><strong>Browser:</strong> ${result.browser}</p>
            <p><strong>Device:</strong> ${result.device}</p>
            ${result.diffPercentage ? `<p><strong>Diff:</strong> ${result.diffPercentage.toFixed(2)}%</p>` : ''}
            
            <div class="images">
              ${result.baselineImageUrl ? `
                <div>
                  <h4>Baseline</h4>
                  <img src="${result.baselineImageUrl}" alt="Baseline">
                </div>
              ` : ''}
              <div>
                <h4>Current</h4>
                <img src="${result.currentImageUrl}" alt="Current">
              </div>
              ${result.diffImageUrl ? `
                <div>
                  <h4>Diff</h4>
                  <img src="${result.diffImageUrl}" alt="Diff">
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
  }

  // Formatting Methods
  private formatSuiteResult(suite: any): VisualRegressionSuiteResult {
    return {
      id: suite.id,
      name: suite.name,
      description: suite.description,
      baseUrl: suite.baseUrl,
      browsers: suite.browsers,
      devices: suite.devices,
      viewports: suite.viewports,
      threshold: suite.threshold.toNumber(),
      ignoreElements: suite.ignoreElements,
      isActive: suite.isActive,
      testRuns: suite.testRuns?.map(this.formatTestRunResult.bind(this)) || [],
      baselines: suite.baselines?.map(this.formatBaselineResult.bind(this)) || [],
      createdAt: suite.createdAt,
      updatedAt: suite.updatedAt,
    };
  }

  private formatTestRunResult(testRun: any): VisualTestRunResult {
    return {
      id: testRun.id,
      suiteId: testRun.suiteId,
      runNumber: testRun.runNumber,
      status: testRun.status,
      gitCommit: testRun.gitCommit,
      branch: testRun.branch,
      environment: testRun.environment,
      totalTests: testRun.totalTests,
      passedTests: testRun.passedTests,
      failedTests: testRun.failedTests,
      startedAt: testRun.startedAt,
      completedAt: testRun.completedAt,
      testResults: testRun.testResults?.map(this.formatTestResultDetail.bind(this)) || [],
    };
  }

  private formatTestResultDetail(result: any): VisualTestResultDetail {
    return {
      id: result.id,
      testName: result.testName,
      url: result.url,
      browser: result.browser,
      device: result.device,
      viewport: result.viewport,
      status: result.status,
      baselineImageUrl: result.baselineImageUrl,
      currentImageUrl: result.currentImageUrl,
      diffImageUrl: result.diffImageUrl,
      diffPercentage: result.diffPercentage?.toNumber(),
      pixelDiff: result.pixelDiff,
      errorMessage: result.errorMessage,
    };
  }

  private formatBaselineResult(baseline: any): VisualBaselineResult {
    return {
      id: baseline.id,
      suiteId: baseline.suiteId,
      testName: baseline.testName,
      url: baseline.url,
      browser: baseline.browser,
      device: baseline.device,
      viewport: baseline.viewport,
      imageUrl: baseline.imageUrl,
      imageHash: baseline.imageHash,
      isActive: baseline.isActive,
      createdFromRun: baseline.createdFromRun,
      createdAt: baseline.createdAt,
    };
  }
}

export default VisualRegressionTestingService;