/**
 * Outsourcing Marketplace System
 * External service provider network integration with rating system,
 * performance tracking, and automated job assignment capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Schemas for Outsourcing Marketplace
const ServiceProviderSchema = z.object({
  id: z.string().optional(),
  businessName: z.string().min(1, 'Business name is required'),
  contactPerson: z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(1),
  }),
  businessInfo: z.object({
    registrationNumber: z.string().optional(),
    taxId: z.string().optional(),
    insuranceInfo: z.object({
      provider: z.string(),
      policyNumber: z.string(),
      coverage: z.number().min(0),
      expiryDate: z.string(),
    }).optional(),
    certifications: z.array(z.object({
      name: z.string(),
      issuedBy: z.string(),
      validUntil: z.string(),
      certificateNumber: z.string(),
    })).default([]),
  }),
  serviceCapabilities: z.array(z.object({
    categoryId: z.string(),
    categoryName: z.string(),
    specializations: z.array(z.string()),
    experience: z.number().min(0), // years
    capacity: z.object({
      dailyJobs: z.number().min(1),
      weeklyJobs: z.number().min(1),
      maxComplexity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    }),
    pricing: z.object({
      hourlyRate: z.number().min(0),
      minimumCharge: z.number().min(0),
      travelFee: z.number().min(0).optional(),
      emergencyMultiplier: z.number().min(1).default(1.5),
    }),
  })),
  operatingAreas: z.array(z.object({
    city: z.string(),
    state: z.string(),
    zipCodes: z.array(z.string()),
    radius: z.number().min(0), // miles
    travelTime: z.number().min(0), // minutes
  })),
  availability: z.object({
    workingHours: z.object({
      monday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      tuesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      wednesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      thursday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      friday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      saturday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
      sunday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }),
    }),
    emergencyServices: z.boolean().default(false),
    holidays: z.array(z.string()).default([]),
    blackoutDates: z.array(z.object({
      start: z.string(),
      end: z.string(),
      reason: z.string(),
    })).default([]),
  }),
  performance: z.object({
    rating: z.number().min(1).max(5).default(5),
    totalJobs: z.number().min(0).default(0),
    completedJobs: z.number().min(0).default(0),
    cancelledJobs: z.number().min(0).default(0),
    averageCompletionTime: z.number().min(0).default(0), // hours
    customerSatisfaction: z.number().min(1).max(5).default(5),
    onTimeRate: z.number().min(0).max(100).default(100), // percentage
    qualityScore: z.number().min(1).max(5).default(5),
    responseTime: z.number().min(0).default(15), // minutes
    repeatingCustomerRate: z.number().min(0).max(100).default(0),
  }),
  financials: z.object({
    commissionRate: z.number().min(0).max(50).default(15), // percentage
    paymentTerms: z.enum(['NET_7', 'NET_14', 'NET_30']).default('NET_14'),
    minimumEarnings: z.number().min(0).default(0),
    totalEarnings: z.number().min(0).default(0),
    outstandingBalance: z.number().min(0).default(0),
    lastPaymentDate: z.string().optional(),
  }),
  verification: z.object({
    backgroundCheck: z.boolean().default(false),
    businessLicense: z.boolean().default(false),
    insurance: z.boolean().default(false),
    references: z.boolean().default(false),
    skillAssessment: z.boolean().default(false),
    verificationDate: z.string().optional(),
    verifiedBy: z.string().optional(),
  }),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'ON_HOLD']).default('PENDING'),
  contractInfo: z.object({
    signedDate: z.string().optional(),
    contractVersion: z.string().default('1.0'),
    renewalDate: z.string().optional(),
    termDetails: z.string().optional(),
  }),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const OutsourcedJobSchema = z.object({
  id: z.string().optional(),
  originalJobId: z.string(),
  providerId: z.string(),
  assignmentDetails: z.object({
    assignedAt: z.string(),
    assignedBy: z.string(),
    expectedStartDate: z.string(),
    expectedCompletionDate: z.string(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    specialInstructions: z.string().optional(),
  }),
  pricing: z.object({
    providerRate: z.number().min(0),
    commissionAmount: z.number().min(0),
    totalCost: z.number().min(0),
    paymentStatus: z.enum(['PENDING', 'PAID', 'DISPUTED']).default('PENDING'),
  }),
  tracking: z.object({
    status: z.enum([
      'ASSIGNED',
      'ACCEPTED',
      'DECLINED',
      'IN_TRANSIT',
      'ON_SITE',
      'IN_PROGRESS',
      'QUALITY_CHECK',
      'COMPLETED',
      'CANCELLED',
    ]).default('ASSIGNED'),
    providerNotes: z.string().optional(),
    customerFeedback: z.string().optional(),
    completionPhotos: z.array(z.string()).default([]),
    timeTracking: z.object({
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      totalHours: z.number().min(0).optional(),
      travelTime: z.number().min(0).optional(),
    }),
  }),
  qualityAssurance: z.object({
    checklist: z.array(z.object({
      item: z.string(),
      completed: z.boolean(),
      notes: z.string().optional(),
    })).default([]),
    qualityScore: z.number().min(1).max(5).optional(),
    issues: z.array(z.object({
      type: z.string(),
      description: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      resolved: z.boolean().default(false),
    })).default([]),
  }),
  tenantId: z.string().optional(),
});

const ProviderPerformanceSchema = z.object({
  providerId: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  metrics: z.object({
    totalJobs: z.number().min(0),
    completionRate: z.number().min(0).max(100),
    averageRating: z.number().min(1).max(5),
    onTimeDelivery: z.number().min(0).max(100),
    customerSatisfaction: z.number().min(1).max(5),
    qualityScore: z.number().min(1).max(5),
    responseTime: z.number().min(0),
    earnings: z.number().min(0),
  }),
  ranking: z.object({
    overall: z.number().min(1),
    category: z.number().min(1),
    region: z.number().min(1),
  }),
});

// Outsourcing Marketplace Service
class OutsourcingMarketplaceService {
  private providers: Map<string, any> = new Map();
  private outsourcedJobs: Map<string, any> = new Map();
  private performanceData: Map<string, any[]> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleProviders = [
      {
        id: 'provider-001',
        businessName: 'TechFix Pro Services',
        contactPerson: {
          name: 'David Rodriguez',
          title: 'Technical Manager',
          email: 'david@techfixpro.com',
          phone: '+1-555-0201',
        },
        businessInfo: {
          registrationNumber: 'TFP-2023-001',
          taxId: 'TX-789456123',
          insuranceInfo: {
            provider: 'Business Insurance Corp',
            policyNumber: 'BIC-234567',
            coverage: 1000000,
            expiryDate: '2025-12-31',
          },
          certifications: [
            {
              name: 'Mobile Device Repair Certification',
              issuedBy: 'Repair Industry Association',
              validUntil: '2025-08-15',
              certificateNumber: 'RIA-2024-789',
            },
          ],
        },
        serviceCapabilities: [
          {
            categoryId: 'mobile-repair',
            categoryName: 'Mobile Device Repair',
            specializations: ['iPhone', 'Samsung', 'Google Pixel', 'Screen Replacement'],
            experience: 5,
            capacity: {
              dailyJobs: 12,
              weeklyJobs: 60,
              maxComplexity: 'HIGH',
            },
            pricing: {
              hourlyRate: 75.00,
              minimumCharge: 50.00,
              travelFee: 15.00,
              emergencyMultiplier: 1.5,
            },
          },
          {
            categoryId: 'computer-repair',
            categoryName: 'Computer Repair',
            specializations: ['Laptop Repair', 'Data Recovery', 'Hardware Diagnostics'],
            experience: 8,
            capacity: {
              dailyJobs: 6,
              weeklyJobs: 30,
              maxComplexity: 'CRITICAL',
            },
            pricing: {
              hourlyRate: 95.00,
              minimumCharge: 85.00,
              travelFee: 25.00,
              emergencyMultiplier: 2.0,
            },
          },
        ],
        operatingAreas: [
          {
            city: 'Austin',
            state: 'TX',
            zipCodes: ['78701', '78702', '78703', '78704'],
            radius: 15,
            travelTime: 30,
          },
        ],
        availability: {
          workingHours: {
            monday: { start: '08:00', end: '18:00', available: true },
            tuesday: { start: '08:00', end: '18:00', available: true },
            wednesday: { start: '08:00', end: '18:00', available: true },
            thursday: { start: '08:00', end: '18:00', available: true },
            friday: { start: '08:00', end: '18:00', available: true },
            saturday: { start: '09:00', end: '15:00', available: true },
            sunday: { start: '00:00', end: '00:00', available: false },
          },
          emergencyServices: true,
          holidays: ['2025-12-25', '2025-01-01'],
          blackoutDates: [],
        },
        performance: {
          rating: 4.7,
          totalJobs: 342,
          completedJobs: 328,
          cancelledJobs: 6,
          averageCompletionTime: 2.3,
          customerSatisfaction: 4.6,
          onTimeRate: 94.2,
          qualityScore: 4.5,
          responseTime: 12,
          repeatingCustomerRate: 67.8,
        },
        financials: {
          commissionRate: 18,
          paymentTerms: 'NET_14',
          minimumEarnings: 1000,
          totalEarnings: 47850.75,
          outstandingBalance: 2340.50,
          lastPaymentDate: '2025-07-28',
        },
        verification: {
          backgroundCheck: true,
          businessLicense: true,
          insurance: true,
          references: true,
          skillAssessment: true,
          verificationDate: '2024-01-15',
          verifiedBy: 'admin-001',
        },
        status: 'ACTIVE',
        contractInfo: {
          signedDate: '2024-01-20',
          contractVersion: '2.1',
          renewalDate: '2025-01-20',
        },
      },
      {
        id: 'provider-002',
        businessName: 'QuickFix Solutions',
        contactPerson: {
          name: 'Maria Garcia',
          title: 'Operations Director',
          email: 'maria@quickfixsolutions.com',
          phone: '+1-555-0202',
        },
        businessInfo: {
          registrationNumber: 'QFS-2024-005',
          taxId: 'TX-987654321',
          insuranceInfo: {
            provider: 'Commercial Coverage Ltd',
            policyNumber: 'CCL-876543',
            coverage: 750000,
            expiryDate: '2025-11-30',
          },
          certifications: [
            {
              name: 'Appliance Repair Certification',
              issuedBy: 'Home Appliance Service Institute',
              validUntil: '2025-06-30',
              certificateNumber: 'HASI-2024-456',
            },
          ],
        },
        serviceCapabilities: [
          {
            categoryId: 'appliance-repair',
            categoryName: 'Home Appliance Repair',
            specializations: ['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher'],
            experience: 6,
            capacity: {
              dailyJobs: 8,
              weeklyJobs: 40,
              maxComplexity: 'HIGH',
            },
            pricing: {
              hourlyRate: 85.00,
              minimumCharge: 75.00,
              travelFee: 20.00,
              emergencyMultiplier: 1.8,
            },
          },
        ],
        operatingAreas: [
          {
            city: 'Houston',
            state: 'TX',
            zipCodes: ['77001', '77002', '77003', '77004', '77005'],
            radius: 20,
            travelTime: 45,
          },
        ],
        availability: {
          workingHours: {
            monday: { start: '07:00', end: '19:00', available: true },
            tuesday: { start: '07:00', end: '19:00', available: true },
            wednesday: { start: '07:00', end: '19:00', available: true },
            thursday: { start: '07:00', end: '19:00', available: true },
            friday: { start: '07:00', end: '19:00', available: true },
            saturday: { start: '08:00', end: '16:00', available: true },
            sunday: { start: '10:00', end: '14:00', available: true },
          },
          emergencyServices: false,
          holidays: ['2025-12-25', '2025-01-01', '2025-07-04'],
          blackoutDates: [
            {
              start: '2025-08-15',
              end: '2025-08-22',
              reason: 'Annual training week',
            },
          ],
        },
        performance: {
          rating: 4.3,
          totalJobs: 198,
          completedJobs: 189,
          cancelledJobs: 4,
          averageCompletionTime: 3.1,
          customerSatisfaction: 4.4,
          onTimeRate: 89.7,
          qualityScore: 4.2,
          responseTime: 18,
          repeatingCustomerRate: 52.3,
        },
        financials: {
          commissionRate: 20,
          paymentTerms: 'NET_7',
          minimumEarnings: 800,
          totalEarnings: 28920.40,
          outstandingBalance: 1575.25,
          lastPaymentDate: '2025-08-01',
        },
        verification: {
          backgroundCheck: true,
          businessLicense: true,
          insurance: true,
          references: true,
          skillAssessment: true,
          verificationDate: '2024-03-10',
          verifiedBy: 'admin-002',
        },
        status: 'ACTIVE',
        contractInfo: {
          signedDate: '2024-03-15',
          contractVersion: '2.0',
          renewalDate: '2025-03-15',
        },
      },
    ];

    sampleProviders.forEach((provider: unknown) => {
      this.providers.set(provider.id, provider);
    });

    // Sample outsourced jobs
    const sampleJobs = [
      {
        id: 'outsourced-001',
        originalJobId: 'job-12345',
        providerId: 'provider-001',
        assignmentDetails: {
          assignedAt: '2025-08-09T10:00:00Z',
          assignedBy: 'admin-001',
          expectedStartDate: '2025-08-10T09:00:00Z',
          expectedCompletionDate: '2025-08-10T15:00:00Z',
          priority: 'HIGH',
          specialInstructions: 'Customer requires same-day completion',
        },
        pricing: {
          providerRate: 150.00,
          commissionAmount: 27.00,
          totalCost: 177.00,
          paymentStatus: 'PENDING',
        },
        tracking: {
          status: 'COMPLETED',
          providerNotes: 'iPhone 14 screen replacement completed successfully',
          customerFeedback: 'Excellent service, very professional',
          completionPhotos: ['photo1.jpg', 'photo2.jpg'],
          timeTracking: {
            startTime: '2025-08-10T09:15:00Z',
            endTime: '2025-08-10T11:30:00Z',
            totalHours: 2.25,
            travelTime: 0.5,
          },
        },
        qualityAssurance: {
          checklist: [
            { item: 'Screen functionality test', completed: true },
            { item: 'Touch responsiveness check', completed: true },
            { item: 'Camera alignment verification', completed: true },
            { item: 'Customer satisfaction confirmation', completed: true },
          ],
          qualityScore: 4.8,
          issues: [],
        },
      },
    ];

    sampleJobs.forEach((job: unknown) => {
      this.outsourcedJobs.set(job.id, job);
    });
  }

  // Provider Management
  async getAllProviders(tenantId?: string, filters?: any): Promise<any[]> {
    let providers = Array.from(this.providers.values());
    
    if (tenantId) {
      providers = providers.filter((provider: unknown) => provider.tenantId === tenantId);
    }

    if (filters) {
      if (filters.status) {
        providers = providers.filter((p: unknown) => p.status === filters.status);
      }
      if (filters.serviceCategory) {
        providers = providers.filter((p: unknown) => 
          p.serviceCapabilities.some((s: unknown) => s.categoryId === filters.serviceCategory)
        );
      }
      if (filters.city) {
        providers = providers.filter((p: unknown) =>
          p.operatingAreas.some((area: unknown) => area.city.toLowerCase() === filters.city.toLowerCase())
        );
      }
      if (filters.rating) {
        providers = providers.filter((p: unknown) => p.performance.rating >= filters.rating);
      }
    }

    return providers;
  }

  async getProviderById(providerId: string): Promise<any | null> {
    return this.providers.get(providerId) || null;
  }

  async createProvider(providerData: unknown): Promise<any> {
    const validated = ServiceProviderSchema.parse(providerData);
    const id = validated.id || `provider-${Date.now()}`;
    
    const provider = { 
      ...validated, 
      id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(providerId: string, updateData: unknown): Promise<any> {
    const existingProvider = this.providers.get(providerId);
    if (!existingProvider) {
      throw new Error('Provider not found');
    }

    const updatedProvider = { 
      ...existingProvider, 
      ...updateData, 
      updatedAt: new Date().toISOString(),
    };
    
    const validated = ServiceProviderSchema.parse(updatedProvider);
    this.providers.set(providerId, validated);
    
    return validated;
  }

  // Job Assignment and Outsourcing
  async assignJobToProvider(jobId: string, providerId: string, assignmentData: unknown): Promise<any> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (provider.status !== 'ACTIVE') {
      throw new Error('Provider is not active');
    }

    const outsourcedJob = {
      id: `outsourced-${Date.now()}`,
      originalJobId: _jobId,
      providerId: providerId,
      assignmentDetails: {
        assignedAt: new Date().toISOString(),
        ...assignmentData,
      },
      tracking: {
        status: 'ASSIGNED',
      },
    };

    this.outsourcedJobs.set(outsourcedJob.id, outsourcedJob);
    
    // Update provider performance
    provider.performance.totalJobs += 1;
    this.providers.set(providerId, provider);

    return outsourcedJob;
  }

  async getOptimalProviders(jobRequirements: unknown): Promise<any[]> {
    const providers = Array.from(this.providers.values()).filter((p: unknown) => p.status === 'ACTIVE');
    
    const scored = providers.map((provider: unknown) => {
      let score = 0;
      
      // Rating weight (30%)
      score += provider.performance.rating * 6;
      
      // Availability weight (25%)
      const isAvailable = this.checkProviderAvailability(provider, jobRequirements.scheduledDate);
      score += isAvailable ? 25 : 0;
      
      // Distance/Area coverage weight (20%)
      const coversArea = provider.operatingAreas.some((area: unknown) => 
        area.city === jobRequirements.location?.city
      );
      score += coversArea ? 20 : 0;
      
      // Service capability weight (15%)
      const hasCapability = provider.serviceCapabilities.some((cap: unknown) =>
        cap.categoryId === jobRequirements.serviceCategory
      );
      score += hasCapability ? 15 : 0;
      
      // Quality score weight (10%)
      score += provider.performance.qualityScore * 2;
      
      return { ...provider, matchScore: score };
    }).filter((p: unknown) => p.matchScore > 50) // Minimum threshold
      .sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, 5); // Return top 5 matches
  }

  private checkProviderAvailability(provider: unknown, scheduledDate: string): boolean {
    // Simplified availability check - in production would check against actual schedule
    const date = new Date(scheduledDate);
    const dayOfWeek = date.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
    
    return provider.availability.workingHours[dayOfWeek]?.available || false;
  }

  // Performance Analytics
  async getProviderPerformance(providerId: string, period?: { start: string; end: string }): Promise<any> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    const jobs = Array.from(this.outsourcedJobs.values())
      .filter((job: unknown) => job.providerId === providerId);

    let filteredJobs = jobs;
    if (period) {
      filteredJobs = jobs.filter((job: unknown) => {
        const assignedDate = new Date(job.assignmentDetails.assignedAt);
        return assignedDate >= new Date(period.start) && assignedDate <= new Date(period.end);
      });
    }

    const performance = {
      providerId: providerId,
      period: period || { start: '2025-01-01', end: new Date().toISOString() },
      summary: {
        totalJobs: filteredJobs.length,
        completedJobs: filteredJobs.filter((j: unknown) => j.tracking.status === 'COMPLETED').length,
        averageRating: provider.performance.rating,
        totalEarnings: filteredJobs.reduce((sum: unknown, job: unknown) => sum + (job.pricing?.providerRate || 0), 0),
      },
      trends: {
        weekly: this.calculateWeeklyTrends(filteredJobs),
        monthly: this.calculateMonthlyTrends(filteredJobs),
      },
      qualityMetrics: {
        averageCompletionTime: provider.performance.averageCompletionTime,
        customerSatisfaction: provider.performance.customerSatisfaction,
        onTimeRate: provider.performance.onTimeRate,
        qualityScore: provider.performance.qualityScore,
      },
      recommendations: this.generatePerformanceRecommendations(provider),
    };

    return performance;
  }

  private calculateWeeklyTrends(jobs: unknown[]): any[] {
    // Simplified trend calculation - group jobs by week
    const weeks = jobs.reduce((acc: unknown, job: unknown) => {
      const week = new Date(job.assignmentDetails.assignedAt).toISOString().substring(0, 10);
      if (!acc[week]) acc[week] = [];
      acc[week].push(job);
      return acc;
    }, {} as unknown);

    return Object.entries(weeks).map(([week, weekJobs]) => ({
      week,
      jobs: (weekJobs as unknown[]).length,
      completed: (weekJobs as unknown[]).filter((j: unknown) => j.tracking.status === 'COMPLETED').length,
      earnings: (weekJobs as unknown[]).reduce((sum: unknown, job: unknown) => sum + (job.pricing?.providerRate || 0), 0),
    }));
  }

  private calculateMonthlyTrends(jobs: unknown[]): any[] {
    // Similar to weekly but grouped by month
    const months = jobs.reduce((acc: unknown, job: unknown) => {
      const month = new Date(job.assignmentDetails.assignedAt).toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(job);
      return acc;
    }, {} as unknown);

    return Object.entries(months).map(([month, monthJobs]) => ({
      month,
      jobs: (monthJobs as unknown[]).length,
      completed: (monthJobs as unknown[]).filter((j: unknown) => j.tracking.status === 'COMPLETED').length,
      earnings: (monthJobs as unknown[]).reduce((sum: unknown, job: unknown) => sum + (job.pricing?.providerRate || 0), 0),
    }));
  }

  private generatePerformanceRecommendations(provider: unknown): string[] {
    const recommendations = [];

    if (provider.performance.onTimeRate < 90) {
      recommendations.push('Improve on-time delivery rate by better time management');
    }
    if (provider.performance.customerSatisfaction < 4.5) {
      recommendations.push('Focus on customer communication and service quality');
    }
    if (provider.performance.responseTime > 30) {
      recommendations.push('Reduce response time for better customer experience');
    }
    if (provider.performance.rating < 4.0) {
      recommendations.push('Consider additional training to improve overall performance');
    }

    return recommendations;
  }

  // Marketplace Analytics
  async getMarketplaceAnalytics(): Promise<any> {
    const providers = Array.from(this.providers.values());
    const jobs = Array.from(this.outsourcedJobs.values());

    return {
      overview: {
        totalProviders: providers.length,
        activeProviders: providers.filter((p: unknown) => p.status === 'ACTIVE').length,
        totalJobsOutsourced: jobs.length,
        completedJobs: jobs.filter((j: unknown) => j.tracking.status === 'COMPLETED').length,
        averageProviderRating: providers.reduce((sum: unknown, p: unknown) => sum + p.performance.rating, 0) / providers.length,
        totalCommissionGenerated: jobs.reduce((sum: unknown, job: unknown) => sum + (job.pricing?.commissionAmount || 0), 0),
      },
      serviceCategories: this.getServiceCategoryStats(providers),
      geographicCoverage: this.getGeographicStats(providers),
      performanceMetrics: {
        topProviders: providers
          .sort((a, b) => b.performance.rating - a.performance.rating)
          .slice(0, 5),
        worstPerformers: providers
          .filter((p: unknown) => p.performance.rating < 4.0)
          .sort((a, b) => a.performance.rating - b.performance.rating)
          .slice(0, 3),
      },
    };
  }

  private getServiceCategoryStats(providers: unknown[]): any[] {
    const categories = new Map();

    providers.forEach((provider: unknown) => {
      provider.serviceCapabilities.forEach((cap: unknown) => {
        if (!categories.has(cap.categoryId)) {
          categories.set(cap.categoryId, {
            categoryId: cap.categoryId,
            categoryName: cap.categoryName,
            providerCount: 0,
            averageRating: 0,
            totalCapacity: 0,
          });
        }

        const category = categories.get(cap.categoryId);
        category.providerCount += 1;
        category.totalCapacity += cap.capacity.dailyJobs;
        category.averageRating = (category.averageRating + provider.performance.rating) / 2;
      });
    });

    return Array.from(categories.values());
  }

  private getGeographicStats(providers: unknown[]): any[] {
    const geographic = new Map();

    providers.forEach((provider: unknown) => {
      provider.operatingAreas.forEach((area: unknown) => {
        const key = `${area.city}, ${area.state}`;
        if (!geographic.has(key)) {
          geographic.set(key, {
            location: key,
            providerCount: 0,
            averageRating: 0,
            totalCoverage: 0,
          });
        }

        const geo = geographic.get(key);
        geo.providerCount += 1;
        geo.averageRating = (geo.averageRating + provider.performance.rating) / 2;
        geo.totalCoverage += area.radius;
      });
    });

    return Array.from(geographic.values());
  }
}

// Route Handlers
export async function outsourcingMarketplaceRoutes(server: FastifyInstance): Promise<void> {
  const marketplaceService = new OutsourcingMarketplaceService();

  // Get all service providers
  server.get('/', async (request: FastifyRequest<{
    Querystring: { 
      tenantId?: string;
      status?: string;
      serviceCategory?: string;
      city?: string;
      rating?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, ...filters } = request.query;
      const providers = await marketplaceService.getAllProviders(tenantId, filters);
      
      return reply.send({
        success: true,
        data: providers,
        count: providers.length,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve service providers',
        error: error.message,
      });
    }
  });

  // Create new service provider
  server.post('/', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const providerData = request.body;
      const provider = await marketplaceService.createProvider(providerData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: provider,
        message: 'Service provider created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create service provider',
        error: error.message,
      });
    }
  });

  // Get service provider by ID
  server.get('/:providerId', async (request: FastifyRequest<{
    Params: { providerId: string }
  }>, reply: FastifyReply) => {
    try {
      const { providerId  } = (request.params as unknown);
      const provider = await marketplaceService.getProviderById(providerId);
      
      if (!provider) {
        return (reply as FastifyReply).status(404).send({
          success: false,
          message: 'Service provider not found',
        });
      }
      
      return reply.send({
        success: true,
        data: provider,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve service provider',
        error: error.message,
      });
    }
  });

  // Update service provider
  server.put('/:providerId', async (request: FastifyRequest<{
    Params: { providerId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { providerId  } = (request.params as unknown);
      const updateData = request.body;
      
      const provider = await marketplaceService.updateProvider(providerId, updateData);
      
      return reply.send({
        success: true,
        data: provider,
        message: 'Service provider updated successfully',
      });
    } catch (error: unknown) {
      const status = error.message === 'Provider not found' ? 404 : 400;
      return (reply as FastifyReply).status(status).send({
        success: false,
        message: 'Failed to update service provider',
        error: error.message,
      });
    }
  });

  // Find optimal providers for a job
  server.post('/find-providers', async (request: FastifyRequest<{
    Body: {
      serviceCategory: string;
      location: { city: string; state: string };
      scheduledDate: string;
      complexity: string;
      budget: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const jobRequirements = request.body;
      const providers = await marketplaceService.getOptimalProviders(jobRequirements);
      
      return reply.send({
        success: true,
        data: providers,
        count: providers.length,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to find optimal providers',
        error: error.message,
      });
    }
  });

  // Assign job to provider
  server.post('/assign-job', async (request: FastifyRequest<{
    Body: {
      jobId: string;
      providerId: string;
      assignmentDetails: unknown;
    }
  }>, reply: FastifyReply) => {
    try {
      const { _jobId, providerId, assignmentDetails  } = (request.body as unknown);
      const assignment = await marketplaceService.assignJobToProvider(_jobId, providerId, assignmentDetails);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: assignment,
        message: 'Job assigned to provider successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to assign job to provider',
        error: error.message,
      });
    }
  });

  // Get provider performance analytics
  server.get('/:providerId/performance', async (request: FastifyRequest<{
    Params: { providerId: string }
    Querystring: { startDate?: string; endDate?: string }
  }>, reply: FastifyReply) => {
    try {
      const { providerId  } = (request.params as unknown);
      const { startDate, endDate  } = (request.query as unknown);
      
      const period = startDate && endDate ? { start: startDate, end: endDate } : undefined;
      const performance = await marketplaceService.getProviderPerformance(providerId, period);
      
      return reply.send({
        success: true,
        data: performance,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to retrieve provider performance',
        error: error.message,
      });
    }
  });

  // Get marketplace analytics
  server.get('/analytics/overview', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const analytics = await marketplaceService.getMarketplaceAnalytics();
      
      return reply.send({
        success: true,
        data: analytics,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve marketplace analytics',
        error: error.message,
      });
    }
  });

  // Get service categories list
  server.get('/categories/list', async (request: FastifyRequest, reply: FastifyReply) => {
    const categories = [
      { id: 'mobile-repair', name: 'Mobile Device Repair', icon: '📱' },
      { id: 'computer-repair', name: 'Computer Repair', icon: '💻' },
      { id: 'appliance-repair', name: 'Home Appliance Repair', icon: '🏠' },
      { id: 'automotive-repair', name: 'Automotive Repair', icon: '🚗' },
      { id: 'electronics-repair', name: 'Electronics Repair', icon: '📺' },
      { id: 'hvac-repair', name: 'HVAC Systems', icon: '❄️' },
      { id: 'plumbing-repair', name: 'Plumbing Services', icon: '🔧' },
      { id: 'electrical-repair', name: 'Electrical Services', icon: '⚡' },
    ];

    return reply.send({
      success: true,
      data: categories,
    });
  });
}

export default outsourcingMarketplaceRoutes;