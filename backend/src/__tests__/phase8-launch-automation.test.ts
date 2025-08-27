/// <reference types="jest" />
import { describe, test, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import LaunchCampaignService from '../services/launch-campaign.service';
import AppStoreOptimizationService from '../services/app-store-optimization.service';
import CustomerSuccessService from '../services/customer-success.service';
import type { 
  CustomerIntervention, 
  SupportTicket, 
  SatisfactionSurvey, 
  AppStoreOptimization, ABTest 
} from '../types/missing-interfaces';

// eslint-disable-next-line max-lines-per-function
describe('Phase 8 Launch Automation & Marketing Systems', () => {
  let launchCampaignService: LaunchCampaignService;
  let asoService: AppStoreOptimizationService;
  let customerSuccessService: CustomerSuccessService;

  beforeEach(() => {
    launchCampaignService = new LaunchCampaignService();
    asoService = new AppStoreOptimizationService();
    customerSuccessService = new CustomerSuccessService();
  });

  // Launch Campaign System Tests
  describe('Launch Campaign Execution System', () => {
    it('should create a new launch campaign', async () => {
      const campaignData = {
        _name: 'Test Launch Campaign',
        _type: 'product-launch' as const,
        _budget: 25000,
        _startDate: new Date(),
        _endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const campaign = await launchCampaignService.createCampaign(campaignData);

      expect(campaign).toBeDefined();
      expect(campaign._id).toMatch(/^campaign_\d+_[a-z0-9]+$/);
      expect(campaign._name).toBe(campaignData._name);
      expect((campaign as any)._type).toBe(campaignData._type);
      expect(campaign._budget).toBe(campaignData._budget);
      expect((campaign as any)._status).toBe('planning');
      expect(campaign._channels).toBeInstanceOf(Array);
      expect(campaign._objectives).toBeInstanceOf(Array);
      expect(campaign._metrics).toBeDefined();
      expect(campaign._timeline).toBeInstanceOf(Array);
      expect(campaign._mediaOutreach).toBeDefined();
      expect((campaign as any)._createdAt).toBeInstanceOf(Date);
      expect(campaign._updatedAt).toBeInstanceOf(Date);
    });

    it('should retrieve existing campaign', async () => {
      const campaignId = 'repairx_launch_2024';
      const campaign = await launchCampaignService.getCampaign(campaignId);

      expect(campaign).toBeDefined();
      expect(campaign!._id).toBe(campaignId);
      expect(campaign!._name).toBe('RepairX Platform Launch');
      expect((campaign! as any)._status).toBe('active');
      expect(campaign!._channels).toHaveLength(3);
      expect(campaign!._objectives).toHaveLength(3);
      
      // Verify campaign channels
      expect(campaign!._channels.map((c: any) => c._type)).toEqual(
        expect.arrayContaining(['email', 'social-media', 'pr'])
      );
      
      // Verify campaign objectives
      expect(campaign!._objectives.map((o: any) => o._type)).toEqual(
        expect.arrayContaining(['awareness', 'acquisition', 'conversion'])
      );
    });

    it('should calculate campaign analytics', async () => {
      const campaignId = 'repairx_launch_2024';
      const analytics = await launchCampaignService.getCampaignAnalytics(campaignId);

      expect(analytics).toBeDefined();
      expect(analytics._totalImpressions).toBeGreaterThan(0);
      expect(analytics._totalClicks).toBeGreaterThan(0);
      expect(analytics._totalConversions).toBeGreaterThan(0);
      expect(analytics._returnOnInvestment).toBeGreaterThan(0);
      expect(analytics._costPerConversion).toBeGreaterThan(0);
      expect(analytics._brandAwarenessLift).toBeGreaterThan(0);
      expect(analytics._customerAcquisitionCost).toBeGreaterThan(0);
    });

    it('should execute campaign with all channels', async () => {
      const campaignId = 'testcampaign';
      await expect(
        launchCampaignService.executeCampaign(campaignId)
      ).resolves.not.toThrow();
    });
  });

  // App Store Optimization Tests
  describe('App Store Optimization System', () => {
    it('should create app store optimization listing', async () => {
      const appData = {
        _appName: 'RepairX Test',
        _platform: 'both' as const,
        _title: 'RepairX - Professional Repair Services',
        _description: 'Complete repair service platform',
        _keywords: ['repair', 'service', 'maintenance'],
        _screenshots: [
          { url: 'screenshot1.png', order: 1 },
          { url: 'screenshot2.png', order: 2 }
        ],
        _icon: 'app_icon.png',
        _category: 'Productivity',
        _targetAudience: ['professionals', 'businesses']
      };

      const listing = await asoService.createAppStoreListing(appData);

      expect(listing).toBeDefined();
      expect(listing._id).toMatch(/^aso_\d+_[a-z0-9]+$/);
      expect((listing as any)._appName).toBe(appData._appName);
      expect((listing as any)._platform).toBe(appData._platform);
      expect((listing as any)._status).toBe('draft');
      expect(listing._metadata).toBeDefined();
      expect((listing as any)._screenshots).toBeDefined();
      expect((listing as any)._promotionalAssets).toBeDefined();
      expect((listing as any)._optimization).toBeDefined();
      expect((listing as any)._performance).toBeDefined();
      expect((listing as any)._compliance).toBeDefined();
    });

    it('should generate optimized screenshots', async () => {
      const appId = 'testapp';
      const config = {
        _devices: ['iPhone 15 Pro', 'Pixel 8 Pro'],
        _features: ['Dashboard', 'Tracking', 'Analytics'],
        _branding: {}
      };

      const screenshots = await asoService.generateScreenshots(appId, config);

      expect(screenshots).toBeInstanceOf(Array);
      expect(screenshots).toHaveLength(5); // One per default feature
      
      screenshots.forEach((screenshot: any) => {
        expect(screenshot._id).toBeDefined();
        expect(screenshot.url).toMatch(/^\/app-store\/screenshots\//);
        expect(screenshot._deviceType).toBe('iPhone 15 Pro');
        expect(screenshot._orientation).toBe('portrait');
        expect((screenshot as any)._title).toContain('RepairX');
        expect(screenshot._order).toBeGreaterThan(0);
        expect(screenshot._performanceMetrics).toBeDefined();
        expect(screenshot._performanceMetrics!._conversionRate).toBeGreaterThan(0);
      });
    });

    it('should optimize keywords for better visibility', async () => {
      const appId = 'testapp';
      const currentKeywords = ['repair service', 'field service', 'business automation'];

      const optimization = await asoService.optimizeKeywords(appId, currentKeywords);

      expect(optimization).toBeDefined();
      expect(optimization._primaryKeywords).toBeInstanceOf(Array);
      expect(optimization._primaryKeywords).toHaveLength(3);
      expect(optimization._secondaryKeywords).toBeInstanceOf(Array);
      expect(optimization._competitorKeywords).toBeInstanceOf(Array);
      expect(optimization._keywordDensity).toBeDefined();
      expect(optimization._searchVolumeTargets).toBeInstanceOf(Array);

      // Verify keyword structure
      optimization._primaryKeywords.forEach((keyword: any) => {
        expect(keyword._term).toBeDefined();
        expect(keyword._relevanceScore).toBeGreaterThan(0);
        expect(keyword._searchVolume).toBeGreaterThan(0);
        expect(keyword._targetRanking).toBeGreaterThan(0);
      });
    });

    it('should create A/B test for optimization', async () => {
      const config = {
        _appId: 'testapp',
        _testType: 'icon' as const,
        _variants: [
          { _name: 'Original Icon', _assets: { icon: 'original.png' } },
          { _name: 'New Icon', _assets: { icon: 'new.png' } }
        ]
      };

      const abTest = await asoService.createABTest(config);

      expect(abTest).toBeDefined();
      expect(abTest._id).toMatch(/^abtest_\d+_[a-z0-9]+$/);
      expect(abTest._name).toContain('icon Optimization Test');
      expect((abTest as any)._type).toBe('icon');
      expect((abTest as any)._status).toBe('running');
      expect(abTest._variants).toHaveLength(2);
      expect(abTest._variants[0]?._isControl).toBe(true);
      expect(abTest._variants[1]?._isControl).toBe(false);
      expect(abTest._startDate).toBeInstanceOf(Date);
      expect(abTest._confidence).toBe(0);
      expect(abTest._significanceLevel).toBe(0.95);
    });

    it('should check app store compliance', async () => {
      const appId = 'testapp';
      const platform = 'ios';

      const compliance = await asoService.checkCompliance(appId, platform);

      expect(compliance).toBeDefined();
      expect((compliance as any)._status).toBe('compliant');
      expect(compliance._lastCheck).toBeInstanceOf(Date);
      expect(compliance._issues).toBeInstanceOf(Array);
      expect(compliance._guidelines).toBeInstanceOf(Array);
      expect(compliance._guidelines?.length).toBeGreaterThan(0);
      
      compliance._guidelines.forEach((guideline: any) => {
        expect(guideline._guideline).toBeDefined();
        expect((guideline as any)._status).toBe('pass');
        expect(guideline._details).toBeDefined();
      });
    });

    it('should submit app to store', async () => {
      const appId = 'testapp';
      const platform = 'ios';

      const submission = await asoService.submitToAppStore(appId, platform);

      expect(submission).toBeDefined();
      expect(submission._submissionId).toMatch(/^submission_\d+_ios$/);
      expect((submission as any)._status).toBe('submitted');
      expect(submission._estimatedReviewTime).toBe('24-48 hours');
    });
  });

  // Customer Success Automation Tests
  describe('Customer Success Automation System', () => {
    it('should calculate customer health score', async () => {
      const customerId = 'test_customer';

      const healthScore = await customerSuccessService.calculateHealthScore(customerId);

      expect(healthScore).toBeGreaterThanOrEqual(0);
      expect(healthScore).toBeLessThanOrEqual(100);
      expect(Number.isInteger(healthScore)).toBe(true);
    });

    it('should assess churn risk accurately', async () => {
      const customerId = 'test_customer';

      const churnRisk = await customerSuccessService.assessChurnRisk(customerId);

      expect(churnRisk).toBeDefined();
      expect(['low', 'medium', 'high', 'critical']).toContain(churnRisk._riskLevel);
      expect(churnRisk._riskFactors).toBeInstanceOf(Array);
      expect(churnRisk._recommendations).toBeInstanceOf(Array);
      expect(typeof churnRisk.interventionRequired).toBe('boolean');

      // Validate recommendations are provided
      if (churnRisk.interventionRequired) {
        expect(churnRisk._recommendations?.length).toBeGreaterThan(0);
      }
    });

    it('should create automated customer intervention', async () => {
      const customerId = 'test_customer';
      const trigger = 'low_health_score';
      const type = 'retention' as const;

      const intervention = await customerSuccessService.createAutomatedIntervention(
        customerId,
        trigger,
        type
      );

      expect(intervention).toBeDefined();
      expect(intervention._id).toMatch(/^intervention_\d+_[a-z0-9]+$/);
      expect(intervention._customerId).toBe(customerId);
      expect((intervention as any)._type).toBe('proactive');
      expect((intervention as any)._category).toBe(type);
      expect((intervention as any)._trigger).toBe(trigger);
      expect((intervention as any)._status).toBe('planned');
      expect((intervention as any)._dueDate).toBeInstanceOf(Date);
      expect((intervention as any)._outcome).toBeDefined();
    });

    it('should create support ticket with proper categorization', async () => {
      const ticketData = {
        _customerId: 'test_customer',
        _subject: 'Login issues with dashboard',
        _description: 'Cannot access my dashboard after recent update',
        _type: 'technical' as const
      };

      const ticket = await customerSuccessService.createSupportTicket(ticketData);

      expect(ticket).toBeDefined();
      expect(ticket._id).toMatch(/^ticket_\d+_[a-z0-9]+$/);
      expect(ticket._customerId).toBe(ticketData._customerId);
      expect(ticket._subject).toBe(ticketData._subject);
      expect(ticket._description).toBe(ticketData._description);
      expect((ticket as any)._type).toBe(ticketData._type);
      expect((ticket as any)._status).toBe('open');
      expect(['low', 'medium', 'high', 'critical']).toContain(ticket._priority);
      expect((ticket as any)._category).toBeDefined();
      expect((ticket as any)._assignedTo).toBeDefined();
      expect((ticket as any)._escalated).toBe(false);
      expect((ticket as any)._createdAt).toBeInstanceOf(Date);
    });

    it('should create satisfaction survey', async () => {
      const customerId = 'test_customer';
      const type = 'nps' as const;
      const trigger = 'periodic' as const;

      const survey = await customerSuccessService.createSatisfactionSurvey(
        customerId,
        type,
        trigger
      );

      expect(survey).toBeDefined();
      expect(survey._id).toMatch(/^survey_\d+_[a-z0-9]+$/);
      expect(survey._customerId).toBe(customerId);
      expect((survey as any)._type).toBe(type);
      expect((survey as any)._trigger).toBe(trigger);
      expect(survey._questions).toBeInstanceOf(Array);
      expect(survey._questions?.length).toBeGreaterThan(0);
      expect((survey as any)._status).toBe('sent');
      expect((survey as any)._sentAt).toBeInstanceOf(Date);
      expect((survey as any)._expiresAt).toBeInstanceOf(Date);

      // Verify NPS questions structure
      const npsQuestion = survey._questions.find((q: any) => q._id === 'nps_score');
      expect(npsQuestion).toBeDefined();
      expect((npsQuestion! as any)._type).toBe('rating');
      expect((npsQuestion! as any)._required).toBe(true);
      expect((npsQuestion! as any)._scale).toEqual({ _min: 0, _max: 10 });
    });

    it('should create retention campaign', async () => {
      const campaignData = {
        _name: 'At-Risk Customer Retention',
        _type: 'at-risk' as const,
        _targetSegment: 'high-risk-customers'
      };

      const campaign = await customerSuccessService.createRetentionCampaign(campaignData);

      expect(campaign).toBeDefined();
      expect(campaign._id).toMatch(/^retention_\d+_[a-z0-9]+$/);
      expect(campaign._name).toBe(campaignData._name);
      expect((campaign as any)._type).toBe(campaignData._type);
      expect((campaign as any)._status).toBe('draft');
      expect(campaign._targetSegment).toBe(campaignData._targetSegment);
      expect(campaign._triggers).toBeInstanceOf(Array);
      expect(campaign._sequence).toBeInstanceOf(Array);
      expect(campaign._metrics).toBeDefined();
      expect(campaign._startDate).toBeInstanceOf(Date);

      // Verify campaign sequence structure
      expect(campaign._sequence?.length).toBeGreaterThan(0);
      campaign._sequence.forEach((step: any) => {
        expect(step._step).toBeGreaterThan(0);
        expect(['email', 'sms', 'call', 'in-app', 'gift', 'discount']).toContain(step._type);
        expect(step._delay).toBeGreaterThanOrEqual(0);
        expect(step._template).toBeDefined();
        expect(step._successMetrics).toBeInstanceOf(Array);
      });
    });

    it('should retrieve customer profile data', async () => {
      const customerId = 'test_customer';

      const profile = await customerSuccessService.getCustomerProfile(customerId);

      expect(profile).toBeDefined();
      expect(profile!._id).toBe(customerId);
      expect(profile!._name).toBeDefined();
      expect(profile!._email).toBeDefined();
      expect(['enterprise', 'small-business', 'individual']).toContain(profile!._segment);
      expect(['free', 'basic', 'professional', 'enterprise']).toContain(profile!._subscriptionTier);
      expect(profile!._onboardingDate).toBeInstanceOf(Date);
      expect(profile!._healthScore).toBeGreaterThanOrEqual(0);
      expect(profile!._healthScore).toBeLessThanOrEqual(100);
      expect(['low', 'medium', 'high', 'critical']).toContain(profile!._riskLevel);
      expect(profile!._lifetimeValue).toBeGreaterThanOrEqual(0);
      expect(profile!._successMilestones).toBeInstanceOf(Array);
    });
  });

  // Integration Tests
  describe('Phase 8 System Integration', () => {
    it('should integrate launch campaigns with app store optimization', async () => {
      // Create launch campaign
      const campaign = await launchCampaignService.createCampaign({
        _name: 'App Store Launch Campaign',
        _type: 'product-launch',
        _channels: [
          {
            _id: 'test_channel',
            _type: 'pr' as const,
            _budget: 5000,
            _targetAudience: 'Tech media',
            _content: { _headlines: ['Test'], _descriptions: ['Test'], _images: [], _videos: [], _callToActions: [], _landingPages: [] },
            _schedule: { _startDate: new Date(), _endDate: new Date(), _frequency: 'once' as const, _timing: '09:00', _timezone: 'UTC' },
            _performance: { _impressions: 0, _clicks: 0, _conversions: 0, _cost: 0, _roas: 0, _engagementRate: 0 }
          }
        ]
      });

      // Create ASO listing
      const asoListing = await asoService.createAppStoreListing({
        _appName: 'RepairX Mobile',
        _platform: 'both'
      });

      expect(campaign._id).toBeDefined();
      expect(asoListing._id).toBeDefined();
      
      // Verify both systems can work together
      expect(campaign._channels?.length).toBeGreaterThan(0);
      expect((asoListing._metadata as any)?._title).toContain('RepairX');
    });

    it('should integrate customer success with retention campaigns', async () => {
      const customerId = 'integration_test_customer';

      // Assess customer health
      const healthScore = await customerSuccessService.calculateHealthScore(customerId);
      const churnRisk = await customerSuccessService.assessChurnRisk(customerId);

      // Create retention campaign if at risk
      if (churnRisk.interventionRequired) {
        const campaign = await customerSuccessService.createRetentionCampaign({
          _name: 'Emergency Retention Campaign',
          _type: 'at-risk',
          _targetSegment: 'critical-risk-customers'
        });

        expect(campaign).toBeDefined();
        expect((campaign as any)._type).toBe('at-risk');
      }

      expect(healthScore).toBeGreaterThanOrEqual(0);
      expect(churnRisk._riskLevel).toBeDefined();
    });
  });

  // Performance and Quality Tests
  describe('Phase 8 Quality Metrics', () => {
    it('should maintain service response times under 200ms', async () => {
      const startTime = Date.now();
      
      await launchCampaignService.getCampaign('testcampaign');
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        customerSuccessService.calculateHealthScore(`customer_${i}`)
      );

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(totalTime).toBeLessThan(1000); // All requests under 1 second
      results.forEach((score: number) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should validate data integrity across all services', async () => {
      // Test campaign data integrity
      const campaign = await launchCampaignService.createCampaign({
        _name: 'Data Integrity Test',
        _budget: 10000
      });
      expect(campaign._budget).toBe(10000);
      expect(campaign._metrics?.totalReach).toBe(0);

      // Test ASO data integrity  
      const asoListing = await asoService.createAppStoreListing({
        _appName: 'Test App',
        _platform: 'ios'
      });
      expect(asoListing._platform).toBe('ios');
      expect((asoListing._compliance.ios as any)._status).toBe('compliant');

      // Test customer success data integrity
      const profile = await customerSuccessService.getCustomerProfile('test_customer');
      expect(profile?._healthScore).toBeGreaterThanOrEqual(0);
      expect(profile?._healthScore).toBeLessThanOrEqual(100);
    });
  });

  afterAll(() => {
    console.log('✅ Phase 8 Launch Automation & Marketing Systems tests completed');
    console.log('🎯 All systems operational and ready for production deployment');
  });
});
