// @ts-nocheck
/**
 * Outsourcing Marketplace System
 * External service provider network integration with rating system,
 * performance tracking, and automated job assignment capabilities.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Schemas for Outsourcing Marketplace
const ServiceProviderSchema = z.object({
  _id: z.string().optional(),
  _businessName: z.string().min(1, 'Business name is required'),
  _contactPerson: z.object({
    name: z.string().min(1),
    _title: z.string().optional(),
    _email: z.string().email(),
    _phone: z.string().min(1),
  }),
  _businessInfo: z.object({
    registrationNumber: z.string().optional(),
    _taxId: z.string().optional(),
    _insuranceInfo: z.object({
      provider: z.string(),
      _policyNumber: z.string(),
      _coverage: z.number().min(0),
      _expiryDate: z.string(),
    }).optional(),
    _certifications: z.array(z.object({
      name: z.string(),
      _issuedBy: z.string(),
      _validUntil: z.string(),
      _certificateNumber: z.string(),
    })).default([]),
  }),
  _serviceCapabilities: z.array(z.object({
    categoryId: z.string(),
    _categoryName: z.string(),
    _specializations: z.array(z.string()),
    _experience: z.number().min(0), // years
    _capacity: z.object({
      dailyJobs: z.number().min(1),
      _weeklyJobs: z.number().min(1),
      _maxComplexity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    }),
    _pricing: z.object({
      hourlyRate: z.number().min(0),
      _minimumCharge: z.number().min(0),
      _travelFee: z.number().min(0).optional(),
      _emergencyMultiplier: z.number().min(1).default(1.5),
    }),
  })),
  _operatingAreas: z.array(z.object({
    city: z.string(),
    _state: z.string(),
    _zipCodes: z.array(z.string()),
    _radius: z.number().min(0), // miles
    _travelTime: z.number().min(0), // minutes
  })),
  _availability: z.object({
    workingHours: z.object({
      monday: z.object({ start: z.string(), _end: z.string(), _available: z.boolean() }),
      _tuesday: z.object({ start: z.string(), _end: z.string(), _available: z.boolean() }),
      _wednesday: z.object({ start: z.string(), _end: z.string(), _available: z.boolean() }),
      _thursday: z.object({ start: z.string(), _end: z.string(), _available: z.boolean() }),
      _friday: z.object({ start: z.string(), _end: z.string(), _available: z.boolean() }),
      _saturday: z.object({ start: z.string(), _end: z.string(), _available: z.boolean() }),
      _sunday: z.object({ start: z.string(), _end: z.string(), _available: z.boolean() }),
    }),
    _emergencyServices: z.boolean().default(false),
    _holidays: z.array(z.string()).default([]),
    _blackoutDates: z.array(z.object({
      start: z.string(),
      _end: z.string(),
      _reason: z.string(),
    })).default([]),
  }),
  _performance: z.object({
    rating: z.number().min(1).max(5).default(5),
    _totalJobs: z.number().min(0).default(0),
    _completedJobs: z.number().min(0).default(0),
    _cancelledJobs: z.number().min(0).default(0),
    _averageCompletionTime: z.number().min(0).default(0), // hours
    _customerSatisfaction: z.number().min(1).max(5).default(5),
    _onTimeRate: z.number().min(0).max(100).default(100), // percentage
    _qualityScore: z.number().min(1).max(5).default(5),
    _responseTime: z.number().min(0).default(15), // minutes
    _repeatingCustomerRate: z.number().min(0).max(100).default(0),
  }),
  _financials: z.object({
    commissionRate: z.number().min(0).max(50).default(15), // percentage
    _paymentTerms: z.enum(['NET_7', 'NET_14', 'NET_30']).default('NET_14'),
    _minimumEarnings: z.number().min(0).default(0),
    _totalEarnings: z.number().min(0).default(0),
    _outstandingBalance: z.number().min(0).default(0),
    _lastPaymentDate: z.string().optional(),
  }),
  _verification: z.object({
    backgroundCheck: z.boolean().default(false),
    _businessLicense: z.boolean().default(false),
    _insurance: z.boolean().default(false),
    _references: z.boolean().default(false),
    _skillAssessment: z.boolean().default(false),
    _verificationDate: z.string().optional(),
    _verifiedBy: z.string().optional(),
  }),
  _status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'ON_HOLD']).default('PENDING'),
  _contractInfo: z.object({
    signedDate: z.string().optional(),
    _contractVersion: z.string().default('1.0'),
    _renewalDate: z.string().optional(),
    _termDetails: z.string().optional(),
  }),
  _tenantId: z.string().optional(),
  _createdAt: z.string().optional(),
  _updatedAt: z.string().optional(),
});

const OutsourcedJobSchema = z.object({
  _id: z.string().optional(),
  _originalJobId: z.string(),
  _providerId: z.string(),
  _assignmentDetails: z.object({
    assignedAt: z.string(),
    _assignedBy: z.string(),
    _expectedStartDate: z.string(),
    _expectedCompletionDate: z.string(),
    _priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    _specialInstructions: z.string().optional(),
  }),
  _pricing: z.object({
    providerRate: z.number().min(0),
    _commissionAmount: z.number().min(0),
    _totalCost: z.number().min(0),
    _paymentStatus: z.enum(['PENDING', 'PAID', 'DISPUTED']).default('PENDING'),
  }),
  _tracking: z.object({
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
    _providerNotes: z.string().optional(),
    _customerFeedback: z.string().optional(),
    _completionPhotos: z.array(z.string()).default([]),
    _timeTracking: z.object({
      startTime: z.string().optional(),
      _endTime: z.string().optional(),
      _totalHours: z.number().min(0).optional(),
      _travelTime: z.number().min(0).optional(),
    }),
  }),
  _qualityAssurance: z.object({
    checklist: z.array(z.object({
      item: z.string(),
      _completed: z.boolean(),
      _notes: z.string().optional(),
    })).default([]),
    _qualityScore: z.number().min(1).max(5).optional(),
    _issues: z.array(z.object({
      type: z.string(),
      _description: z.string(),
      _severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      _resolved: z.boolean().default(false),
    })).default([]),
  }),
  _tenantId: z.string().optional(),
});

const ProviderPerformanceSchema = z.object({
  _providerId: z.string(),
  _period: z.object({
    start: z.string(),
    _end: z.string(),
  }),
  _metrics: z.object({
    totalJobs: z.number().min(0),
    _completionRate: z.number().min(0).max(100),
    _averageRating: z.number().min(1).max(5),
    _onTimeDelivery: z.number().min(0).max(100),
    _customerSatisfaction: z.number().min(1).max(5),
    _qualityScore: z.number().min(1).max(5),
    _responseTime: z.number().min(0),
    _earnings: z.number().min(0),
  }),
  _ranking: z.object({
    overall: z.number().min(1),
    _category: z.number().min(1),
    _region: z.number().min(1),
  }),
});

// Outsourcing Marketplace Service
class OutsourcingMarketplaceService {
  private _providers: Map<string, any> = new Map();
  private _outsourcedJobs: Map<string, any> = new Map();
  private _performanceData: Map<string, any[]> = new Map();

  constructor() {
    // Sample data removed for production
  }

  // Sample data initialization removed for production
  // Data should be loaded from database in production environment

  // Provider Management
  async getAllProviders(tenantId?: string, filters?: unknown): Promise<any[]> {
    let providers = Array.from(this.providers.values());
    
    if (tenantId) {
      providers = providers.filter((_provider: unknown) => provider.tenantId === tenantId);
    }

    if (filters) {
      if (filters.status) {
        providers = providers.filter((_p: unknown) => p.status === filters.status);
      }
      if (filters.serviceCategory) {
        providers = providers.filter((_p: unknown) => 
          p.serviceCapabilities.some((_s: unknown) => s.categoryId === filters.serviceCategory)
        );
      }
      if (filters.city) {
        providers = providers.filter((_p: unknown) =>
          p.operatingAreas.some((_area: unknown) => area.city.toLowerCase() === filters.city.toLowerCase())
        );
      }
      if (filters.rating) {
        providers = providers.filter((_p: unknown) => p.performance.rating >= filters.rating);
      }
    }

    return providers;
  }

  async getProviderById(_providerId: string): Promise<any | null> {
    return this.providers.get(providerId) || null;
  }

  async createProvider(_providerData: unknown): Promise<any> {
    const validated = ServiceProviderSchema.parse(providerData);
    const id = validated.id || `provider-${Date.now()}`;
    
    const provider = { 
      ...validated, 
      id, 
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };
    
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(_providerId: string, _updateData: unknown): Promise<any> {
    const existingProvider = this.providers.get(providerId);
    if (!existingProvider) {
      throw new Error('Provider not found');
    }

    const updatedProvider = { 
      ...existingProvider, 
      ...updateData, 
      _updatedAt: new Date().toISOString(),
    };
    
    const validated = ServiceProviderSchema.parse(updatedProvider);
    this.providers.set(providerId, validated);
    
    return validated;
  }

  // Job Assignment and Outsourcing
  async assignJobToProvider(_jobId: string, _providerId: string, _assignmentData: unknown): Promise<any> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    if (provider.status !== 'ACTIVE') {
      throw new Error('Provider is not active');
    }

    const outsourcedJob = {
      _id: `outsourced-${Date.now()}`,
      _originalJobId: _jobId,
      _providerId: providerId,
      _assignmentDetails: {
        assignedAt: new Date().toISOString(),
        ...assignmentData,
      },
      _tracking: {
        status: 'ASSIGNED',
      },
    };

    this.outsourcedJobs.set(outsourcedJob.id, outsourcedJob);
    
    // Update provider performance
    provider.performance.totalJobs += 1;
    this.providers.set(providerId, provider);

    return outsourcedJob;
  }

  async getOptimalProviders(_jobRequirements: unknown): Promise<any[]> {
    const providers = Array.from(this.providers.values()).filter((_p: unknown) => p.status === 'ACTIVE');
    
    const scored = providers.map((_provider: unknown) => {
      let score = 0;
      
      // Rating weight (30%)
      score += provider.performance.rating * 6;
      
      // Availability weight (25%)
      const isAvailable = this.checkProviderAvailability(provider, jobRequirements.scheduledDate);
      score += isAvailable ? _25 : 0;
      
      // Distance/Area coverage weight (20%)
      const coversArea = provider.operatingAreas.some((_area: unknown) => 
        area.city === jobRequirements.location?.city
      );
      score += coversArea ? _20 : 0;
      
      // Service capability weight (15%)
      const hasCapability = provider.serviceCapabilities.some((_cap: unknown) =>
        cap.categoryId === jobRequirements.serviceCategory
      );
      score += hasCapability ? _15 : 0;
      
      // Quality score weight (10%)
      score += provider.performance.qualityScore * 2;
      
      return { ...provider, _matchScore: score };
    }).filter((_p: unknown) => p.matchScore > 50) // Minimum threshold
      .sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, 5); // Return top 5 matches
  }

  private checkProviderAvailability(_provider: unknown, _scheduledDate: string): boolean {
    // Simplified availability check - in production would check against actual schedule
    const date = new Date(scheduledDate);
    const dayOfWeek = date.toLocaleDateString('en', { _weekday: 'long' }).toLowerCase();
    
    return provider.availability.workingHours[dayOfWeek]?.available || false;
  }

  // Performance Analytics
  async getProviderPerformance(_providerId: string, period?: { _start: string; end: string }): Promise<any> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    const jobs = Array.from(this.outsourcedJobs.values())
      .filter((_job: unknown) => job.providerId === providerId);

    let filteredJobs = jobs;
    if (period) {
      filteredJobs = jobs.filter((_job: unknown) => {
        const assignedDate = new Date(job.assignmentDetails.assignedAt);
        return assignedDate >= new Date(period.start) && assignedDate <= new Date(period.end);
      });
    }

    const performance = {
      _providerId: providerId,
      _period: period || { start: '2025-01-01', _end: new Date().toISOString() },
      _summary: {
        totalJobs: filteredJobs.length,
        _completedJobs: filteredJobs.filter((j: unknown) => j.tracking.status === 'COMPLETED').length,
        _averageRating: provider.performance.rating,
        _totalEarnings: filteredJobs.reduce((sum: unknown, _job: unknown) => sum + (job.pricing?.providerRate || 0), 0),
      },
      _trends: {
        weekly: this.calculateWeeklyTrends(filteredJobs),
        _monthly: this.calculateMonthlyTrends(filteredJobs),
      },
      _qualityMetrics: {
        averageCompletionTime: provider.performance.averageCompletionTime,
        _customerSatisfaction: provider.performance.customerSatisfaction,
        _onTimeRate: provider.performance.onTimeRate,
        _qualityScore: provider.performance.qualityScore,
      },
      _recommendations: this.generatePerformanceRecommendations(provider),
    };

    return performance;
  }

  private calculateWeeklyTrends(_jobs: unknown[]): unknown[] {
    // Simplified trend calculation - group jobs by week
    const weeks = jobs.reduce((_acc: unknown, _job: unknown) => {
      const week = new Date(job.assignmentDetails.assignedAt).toISOString().substring(0, 10);
      if (!acc[week]) acc[week] = [];
      acc[week].push(job);
      return acc;
    }, {} as unknown);

    return Object.entries(weeks).map(([week, weekJobs]) => ({
      week,
      _jobs: (weekJobs as unknown[]).length,
      _completed: (weekJobs as unknown[]).filter((_j: unknown) => j.tracking.status === 'COMPLETED').length,
      _earnings: (weekJobs as unknown[]).reduce((_sum: unknown, _job: unknown) => sum + (job.pricing?.providerRate || 0), 0),
    }));
  }

  private calculateMonthlyTrends(_jobs: unknown[]): unknown[] {
    // Similar to weekly but grouped by month
    const months = jobs.reduce((_acc: unknown, _job: unknown) => {
      const month = new Date(job.assignmentDetails.assignedAt).toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(job);
      return acc;
    }, {} as unknown);

    return Object.entries(months).map(([month, monthJobs]) => ({
      month,
      _jobs: (monthJobs as unknown[]).length,
      _completed: (monthJobs as unknown[]).filter((_j: unknown) => j.tracking.status === 'COMPLETED').length,
      _earnings: (monthJobs as unknown[]).reduce((_sum: unknown, _job: unknown) => sum + (job.pricing?.providerRate || 0), 0),
    }));
  }

  private generatePerformanceRecommendations(_provider: unknown): string[] {
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
      _overview: {
        totalProviders: providers.length,
        _activeProviders: providers.filter((p: unknown) => p.status === 'ACTIVE').length,
        _totalJobsOutsourced: jobs.length,
        _completedJobs: jobs.filter((j: unknown) => j.tracking.status === 'COMPLETED').length,
        _averageProviderRating: providers.reduce((sum: unknown, _p: unknown) => sum + p.performance.rating, 0) / providers.length,
        _totalCommissionGenerated: jobs.reduce((sum: unknown, _job: unknown) => sum + (job.pricing?.commissionAmount || 0), 0),
      },
      _serviceCategories: this.getServiceCategoryStats(providers),
      _geographicCoverage: this.getGeographicStats(providers),
      _performanceMetrics: {
        topProviders: providers
          .sort((a, b) => b.performance.rating - a.performance.rating)
          .slice(0, 5),
        _worstPerformers: providers
          .filter((p: unknown) => p.performance.rating < 4.0)
          .sort((a, b) => a.performance.rating - b.performance.rating)
          .slice(0, 3),
      },
    };
  }

  private getServiceCategoryStats(_providers: unknown[]): unknown[] {
    const categories = new Map();

    providers.forEach((_provider: unknown) => {
      provider.serviceCapabilities.forEach((_cap: unknown) => {
        if (!categories.has(cap.categoryId)) {
          categories.set(cap.categoryId, {
            _categoryId: cap.categoryId,
            _categoryName: cap.categoryName,
            _providerCount: 0,
            _averageRating: 0,
            _totalCapacity: 0,
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

  private getGeographicStats(_providers: unknown[]): unknown[] {
    const geographic = new Map();

    providers.forEach((_provider: unknown) => {
      provider.operatingAreas.forEach((_area: unknown) => {
        const key = `${area.city}, ${area.state}`;
        if (!geographic.has(key)) {
          geographic.set(key, {
            _location: key,
            _providerCount: 0,
            _averageRating: 0,
            _totalCoverage: 0,
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
// eslint-disable-next-line max-lines-per-function
export async function outsourcingMarketplaceRoutes(_server: FastifyInstance): Promise<void> {
  const marketplaceService = new OutsourcingMarketplaceService();

  // Get all service providers
  _server.get('/', async (request: FastifyRequest<{
    Querystring: { 
      tenantId?: string;
      status?: string;
      serviceCategory?: string;
      city?: string;
      rating?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId, ...filters } = (request as any).query;
      const providers = await marketplaceService.getAllProviders(tenantId, filters);
      
      return (reply as any).send({
        _success: true, data: providers,
        _count: providers.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve service providers',
        _error: error.message,
      });
    }
  });

  // Create new service provider
  _server.post('/', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const providerData = (request as any).body;
      const provider = await marketplaceService.createProvider(providerData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true, data: provider,
        _message: 'Service provider created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create service provider',
        _error: error.message,
      });
    }
  });

  // Get service provider by ID
  _server.get('/:providerId', async (request: FastifyRequest<{
    Params: { providerId: string }
  }>, reply: FastifyReply) => {
    try {
      const { providerId  } = ((request as any).params as unknown);
      const provider = await marketplaceService.getProviderById(providerId);
      
      if (!provider) {
        return (reply as FastifyReply).status(404).send({
          _success: false,
          _message: 'Service provider not found',
        });
      }
      
      return (reply as any).send({
        _success: true, data: provider,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve service provider',
        _error: error.message,
      });
    }
  });

  // Update service provider
  _server.put('/:providerId', async (request: FastifyRequest<{
    Params: { providerId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { providerId  } = ((request as any).params as unknown);
      const updateData = (request as any).body;
      
      const provider = await marketplaceService.updateProvider(providerId, updateData);
      
      return (reply as any).send({
        _success: true, data: provider,
        _message: 'Service provider updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Provider not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update service provider',
        _error: error.message,
      });
    }
  });

  // Find optimal providers for a job
  _server.post('/find-providers', async (request: FastifyRequest<{
    Body: {
      serviceCategory: string;
      location: { city: string; state: string };
      scheduledDate: string;
      complexity: string;
      budget: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const jobRequirements = (request as any).body;
      const providers = await marketplaceService.getOptimalProviders(jobRequirements);
      
      return (reply as any).send({
        _success: true, data: providers,
        _count: providers.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to find optimal providers',
        _error: error.message,
      });
    }
  });

  // Assign job to provider
  _server.post('/assign-job', async (request: FastifyRequest<{
    Body: {
      jobId: string;
      providerId: string;
      assignmentDetails: unknown;
    }
  }>, reply: FastifyReply) => {
    try {
      const { _jobId, providerId, assignmentDetails  } = ((request as any).body as unknown);
      const assignment = await marketplaceService.assignJobToProvider(_jobId, providerId, assignmentDetails);
      
      return (reply as FastifyReply).status(201).send({
        _success: true, data: assignment,
        _message: 'Job assigned to provider successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to assign job to provider',
        _error: error.message,
      });
    }
  });

  // Get provider performance analytics
  _server.get('/:providerId/performance', async (request: FastifyRequest<{
    Params: { providerId: string }
    Querystring: { startDate?: string; endDate?: string }
  }>, reply: FastifyReply) => {
    try {
      const { providerId  } = ((request as any).params as unknown);
      const { startDate, endDate  } = ((request as any).query as unknown);
      
      const period = startDate && endDate ? { _start: startDate, _end: endDate } : undefined;
      const performance = await marketplaceService.getProviderPerformance(providerId, period);
      
      return (reply as any).send({
        _success: true, data: performance,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to retrieve provider performance',
        _error: error.message,
      });
    }
  });

  // Get marketplace analytics
  _server.get('/analytics/overview', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const analytics = await marketplaceService.getMarketplaceAnalytics();
      
      return (reply as any).send({
        _success: true, data: analytics,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve marketplace analytics',
        _error: error.message,
      });
    }
  });

  // Get service categories list
  _server.get('/categories/list', async (request: FastifyRequest, reply: FastifyReply) => {
    const categories = [
      { _id: 'mobile-repair', _name: 'Mobile Device Repair', _icon: '📱' },
      { _id: 'computer-repair', _name: 'Computer Repair', _icon: '💻' },
      { _id: 'appliance-repair', _name: 'Home Appliance Repair', _icon: '🏠' },
      { _id: 'automotive-repair', _name: 'Automotive Repair', _icon: '🚗' },
      { _id: 'electronics-repair', _name: 'Electronics Repair', _icon: '📺' },
      { _id: 'hvac-repair', _name: 'HVAC Systems', _icon: '❄️' },
      { _id: 'plumbing-repair', _name: 'Plumbing Services', _icon: '🔧' },
      { _id: 'electrical-repair', _name: 'Electrical Services', _icon: '⚡' },
    ];

    return (reply as any).send({
      _success: true, data: categories,
    });
  });
}

export default outsourcingMarketplaceRoutes;