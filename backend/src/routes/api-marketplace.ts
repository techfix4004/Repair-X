// @ts-nocheck
/**
 * API Marketplace System
 * Third-party integrations and white-label solution framework with API gateway,
 * developer portal, and comprehensive integration management.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Schemas for API Marketplace
const APIIntegrationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Integration name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum([
    'PAYMENT_GATEWAY',
    'SHIPPING_CARRIER',
    'EMAIL_SERVICE',
    'SMS_PROVIDER',
    'INVENTORY_MANAGEMENT',
    'CRM_SYSTEM',
    'ACCOUNTING_SOFTWARE',
    'MARKETING_PLATFORM',
    'ANALYTICS_TOOL',
    'COMMUNICATION_TOOL',
    'SCHEDULING_SERVICE',
    'MAP_SERVICE',
    'BACKUP_SERVICE',
    'SECURITY_SERVICE',
    'AI_SERVICE',
    'OTHER',
  ]),
  provider: z.object({
    name: z.string().min(1),
    website: z.string().url().optional(),
    supportEmail: z.string().email(),
    supportPhone: z.string().optional(),
    documentation: z.string().url().optional(),
  }),
  authentication: z.object({
    type: z.enum(['API_KEY', 'OAUTH2', 'JWT', 'BASIC_AUTH', 'BEARER_TOKEN']),
    endpoint: z.string().url().optional(),
    requiredFields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string().optional(),
    })),
    testCredentials: z.object({
      available: z.boolean(),
      sandbox: z.boolean(),
    }).optional(),
  }),
  endpoints: z.array(z.object({
    id: z.string(),
    name: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    url: z.string(),
    description: z.string(),
    requestSchema: z.unknown().optional(),
    responseSchema: z.unknown().optional(),
    rateLimit: z.object({
      requests: z.number(),
      period: z.string(), // e.g., "1 minute", "1 hour"
    }).optional(),
    isWebhook: z.boolean().default(false),
  })),
  pricing: z.object({
    model: z.enum(['FREE', 'FREEMIUM', 'SUBSCRIPTION', 'PAY_PER_USE', 'CUSTOM']),
    tiers: z.array(z.object({
      name: z.string(),
      price: z.number(),
      currency: z.string().default('USD'),
      period: z.string().optional(), // monthly, yearly, etc.
      features: z.array(z.string()),
      limits: z.object({
        requests: z.number().optional(),
        users: z.number().optional(),
        storage: z.string().optional(),
      }).optional(),
    })),
    customPricing: z.boolean().default(false),
  }),
  features: z.array(z.string()),
  requirements: z.object({
    minimumPlan: z.string().optional(),
    technicalRequirements: z.array(z.string()),
    permissions: z.array(z.string()),
  }),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'DEPRECATED']).default('DRAFT'),
  rating: z.object({
    average: z.number().min(1).max(5).default(5),
    total: z.number().min(0).default(0),
    reviews: z.array(z.object({
      userId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string(),
      date: z.string(),
    })).default([]),
  }),
  usage: z.object({
    totalInstalls: z.number().min(0).default(0),
    activeInstalls: z.number().min(0).default(0),
    lastMonthRequests: z.number().min(0).default(0),
  }),
  metadata: z.object({
    tags: z.array(z.string()).default([]),
    version: z.string().default('1.0.0'),
    lastUpdated: z.string().optional(),
    createdBy: z.string().optional(),
    maintainedBy: z.string().optional(),
  }),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const APIKeySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'API key name is required'),
  keyHash: z.string(),
  keyPrefix: z.string(),
  permissions: z.array(z.enum([
    'READ',
    'WRITE',
    'DELETE',
    'ADMIN',
    'INTEGRATIONS',
    'WEBHOOKS',
    'ANALYTICS',
  ])),
  restrictions: z.object({
    ipWhitelist: z.array(z.string()).default([]),
    rateLimits: z.object({
      requestsPerMinute: z.number().min(1).default(100),
      requestsPerHour: z.number().min(1).default(1000),
      requestsPerDay: z.number().min(1).default(10000),
    }),
    allowedEndpoints: z.array(z.string()).default([]),
  }),
  usage: z.object({
    totalRequests: z.number().min(0).default(0),
    lastUsed: z.string().optional(),
    requestsToday: z.number().min(0).default(0),
  }),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional(),
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: z.string().optional(),
});

const WebhookSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Webhook name is required'),
  url: z.string().url('Valid webhook URL is required'),
  events: z.array(z.enum([
    'JOB_CREATED',
    'JOB_UPDATED',
    'JOB_COMPLETED',
    'PAYMENT_PROCESSED',
    'CUSTOMER_REGISTERED',
    'INVOICE_GENERATED',
    'QUOTATION_APPROVED',
    'TECHNICIAN_ASSIGNED',
    'INVENTORY_LOW',
    'CUSTOM_EVENT',
  ])),
  authentication: z.object({
    type: z.enum(['NONE', 'BASIC', 'BEARER', 'SIGNATURE']),
    secret: z.string().optional(),
    headers: z.record(z.string()).optional(),
  }),
  settings: z.object({
    retryAttempts: z.number().min(0).max(5).default(3),
    retryBackoff: z.enum(['LINEAR', 'EXPONENTIAL']).default('EXPONENTIAL'),
    timeout: z.number().min(5).max(60).default(30), // seconds
    batchSize: z.number().min(1).max(100).default(1),
  }),
  filters: z.object({
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
      value: z.unknown(),
    })).default([]),
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']).default('ACTIVE'),
  statistics: z.object({
    totalDeliveries: z.number().min(0).default(0),
    successfulDeliveries: z.number().min(0).default(0),
    failedDeliveries: z.number().min(0).default(0),
    lastDelivery: z.string().optional(),
  }),
  tenantId: z.string(),
  createdBy: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const WhiteLabelConfigSchema = z.object({
  id: z.string().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  domain: z.string().min(1, 'Domain is required'),
  branding: z.object({
    businessName: z.string().min(1),
    logo: z.object({
      primary: z.string().url().optional(),
      favicon: z.string().url().optional(),
      loginPage: z.string().url().optional(),
    }),
    colors: z.object({
      primary: z.string().default('#2563eb'),
      secondary: z.string().default('#64748b'),
      accent: z.string().default('#f59e0b'),
      background: z.string().default('#ffffff'),
      text: z.string().default('#1f2937'),
    }),
    fonts: z.object({
      primary: z.string().default('Inter'),
      secondary: z.string().default('system-ui'),
    }),
  }),
  features: z.object({
    customEmailTemplates: z.boolean().default(false),
    customDashboard: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
    customDomain: z.boolean().default(false),
    ssoIntegration: z.boolean().default(false),
  }),
  subscription: z.object({
    plan: z.string(),
    features: z.array(z.string()),
    limits: z.object({
      users: z.number().optional(),
      technicians: z.number().optional(),
      locations: z.number().optional(),
      storage: z.string().optional(),
    }),
  }),
  status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED']).default('DRAFT'),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// API Marketplace Service
class APIMarketplaceService {
  private integrations: Map<string, any> = new Map();
  private apiKeys: Map<string, any[]> = new Map();
  private webhooks: Map<string, any[]> = new Map();
  private whiteLabelConfigs: Map<string, any> = new Map();

  constructor() {
    // Initialize empty stores for production use
    // Data will be loaded from database in real implementation
  }

  // Integration Management
  async getAllIntegrations(filters?: any): Promise<any[]> {
    let integrations = Array.from(this.integrations.values());

    if (filters) {
      if (filters.category) {
        integrations = integrations.filter((int: any) => int.category === filters.category);
      }
      if (filters.status) {
        integrations = integrations.filter((int: any) => int.status === filters.status);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        integrations = integrations.filter((int: any) =>
          int.name.toLowerCase().includes(searchTerm) ||
          int.description.toLowerCase().includes(searchTerm)
        );
      }
    }

    return integrations;
  }

  async getIntegrationById(integrationId: string): Promise<any | null> {
    return this.integrations.get(integrationId) || null;
  }

  async createIntegration(integrationData: any): Promise<any> {
    const validated = APIIntegrationSchema.parse(integrationData);
    const integration = {
      ...validated,
      id: `integration-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.integrations.set(integration.id, integration);
    return integration;
  }

  async updateIntegration(integrationId: string, updateData: any): Promise<any> {
    const existing = this.integrations.get(integrationId);
    if (!existing) {
      throw new Error('Integration not found');
    }

    const updated = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    this.integrations.set(integrationId, updated);
    return updated;
  }

  // API Key Management
  async generateAPIKey(keyData: any): Promise<any> {
    const validated = APIKeySchema.parse(keyData);
    const apiKey = {
      ...validated,
      id: `key-${Date.now()}`,
      keyHash: `hash_${Math.random().toString(36).substring(2)}`,
      keyPrefix: 'pk_live_',
      createdAt: new Date().toISOString(),
    };

    const tenantKeys = this.apiKeys.get(apiKey.tenantId) || [];
    tenantKeys.push(apiKey);
    this.apiKeys.set(apiKey.tenantId, tenantKeys);

    return apiKey;
  }

  async getAPIKeys(tenantId: string): Promise<any[]> {
    return this.apiKeys.get(tenantId) || [];
  }

  async revokeAPIKey(keyId: string, tenantId: string): Promise<boolean> {
    const tenantKeys = this.apiKeys.get(tenantId) || [];
    const keyIndex = tenantKeys.findIndex((key: any) => key.id === keyId);
    
    if (keyIndex === -1) {
      return false;
    }

    tenantKeys[keyIndex].isActive = false;
    return true;
  }

  // Webhook Management
  async createWebhook(webhookData: any): Promise<any> {
    const validated = WebhookSchema.parse(webhookData);
    const webhook = {
      ...validated,
      id: `webhook-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tenantWebhooks = this.webhooks.get(webhook.tenantId) || [];
    tenantWebhooks.push(webhook);
    this.webhooks.set(webhook.tenantId, tenantWebhooks);

    return webhook;
  }

  async getWebhooks(tenantId: string): Promise<any[]> {
    return this.webhooks.get(tenantId) || [];
  }

  async updateWebhook(webhookId: string, tenantId: string, updateData: any): Promise<any> {
    const tenantWebhooks = this.webhooks.get(tenantId) || [];
    const webhookIndex = tenantWebhooks.findIndex((wh: any) => wh.id === webhookId);
    
    if (webhookIndex === -1) {
      throw new Error('Webhook not found');
    }

    tenantWebhooks[webhookIndex] = {
      ...tenantWebhooks[webhookIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return tenantWebhooks[webhookIndex];
  }

  // White Label Configuration
  async createWhiteLabelConfig(configData: any): Promise<any> {
    const validated = WhiteLabelConfigSchema.parse(configData);
    const config = {
      ...validated,
      id: `config-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.whiteLabelConfigs.set(config.id, config);
    return config;
  }

  async getWhiteLabelConfig(tenantId: string): Promise<any | null> {
    const configs = Array.from(this.whiteLabelConfigs.values());
    return configs.find((config: any) => config.tenantId === tenantId) || null;
  }

  // Analytics and Reporting
  async getMarketplaceAnalytics(): Promise<any> {
    const totalIntegrations = this.integrations.size;
    const totalApiKeys = Array.from(this.apiKeys.values()).reduce((acc, keys) => acc + keys.length, 0);
    const totalWebhooks = Array.from(this.webhooks.values()).reduce((acc, webhooks) => acc + webhooks.length, 0);

    return {
      overview: {
        totalIntegrations,
        totalApiKeys,
        totalWebhooks,
        totalWhiteLabelConfigs: this.whiteLabelConfigs.size,
      },
      integrations: {
        byCategory: this.getIntegrationCategories(Array.from(this.integrations.values())),
        byStatus: this.getIntegrationsByStatus(Array.from(this.integrations.values())),
      },
      usage: {
        apiKeyUsage: this.getAPIKeyUsageStats(),
        webhookStats: this.getWebhookStats(),
      },
    };
  }

  private getIntegrationCategories(integrations: any[]): any[] {
    const categories = integrations.reduce((acc: any, integration: any) => {
      acc[integration.category] = (acc[integration.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
    }));
  }

  private getIntegrationsByStatus(integrations: any[]): any[] {
    const statuses = integrations.reduce((acc: any, integration: any) => {
      acc[integration.status] = (acc[integration.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count,
    }));
  }

  private getAPIKeyUsageStats(): any {
    let totalRequests = 0;
    let activeKeys = 0;

    Array.from(this.apiKeys.values()).forEach((tenantKeys: any[]) => {
      tenantKeys.forEach((key: any) => {
        if (key.isActive) {
          activeKeys++;
          totalRequests += key.usage.totalRequests || 0;
        }
      });
    });

    return {
      totalRequests,
      activeKeys,
      averageRequestsPerKey: activeKeys > 0 ? Math.round(totalRequests / activeKeys) : 0,
    };
  }

  private getWebhookStats(): any {
    let totalDeliveries = 0;
    let successfulDeliveries = 0;
    let activeWebhooks = 0;

    Array.from(this.webhooks.values()).forEach((tenantWebhooks: any[]) => {
      tenantWebhooks.forEach((webhook: any) => {
        if (webhook.status === 'ACTIVE') {
          activeWebhooks++;
          totalDeliveries += webhook.statistics.totalDeliveries || 0;
          successfulDeliveries += webhook.statistics.successfulDeliveries || 0;
        }
      });
    });

    return {
      totalDeliveries,
      successfulDeliveries,
      activeWebhooks,
      successRate: totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 100,
    };
  }

  async getDeveloperPortalStats(tenantId: string): Promise<any> {
    const apiKeys = this.apiKeys.get(tenantId) || [];
    const webhooks = this.webhooks.get(tenantId) || [];
    
    return {
      apiKeys: {
        total: apiKeys.length,
        active: apiKeys.filter((key: any) => key.isActive).length,
        totalRequests: apiKeys.reduce((acc: number, key: any) => acc + (key.usage.totalRequests || 0), 0),
      },
      webhooks: {
        total: webhooks.length,
        active: webhooks.filter((wh: any) => wh.status === 'ACTIVE').length,
        successRate: this.calculateWebhookSuccessRate(webhooks),
      },
    };
  }

  private calculateWebhookSuccessRate(webhooks: any[]): number {
    const totalDeliveries = webhooks.reduce((acc: number, wh: any) => 
      acc + (wh.statistics.totalDeliveries || 0), 0);
    const successfulDeliveries = webhooks.reduce((acc: number, wh: any) => 
      acc + (wh.statistics.successfulDeliveries || 0), 0);

    return totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 100;
  }
}

const marketplaceService = new APIMarketplaceService();

// Route Handlers
export async function apiMarketplaceRoutes(server: FastifyInstance): Promise<void> {
  // Integration routes
  server.get('/api/marketplace/integrations', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { category, status, search } = request.query as any;
      const integrations = await marketplaceService.getAllIntegrations({
        category,
        status,
        search,
      });

      return reply.send({
        success: true,
        data: integrations,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  server.get('/api/marketplace/integrations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const integration = await marketplaceService.getIntegrationById(id);

      if (!integration) {
        return reply.status(404).send({
          success: false,
          error: 'Integration not found',
        });
      }

      return reply.send({
        success: true,
        data: integration,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  server.post('/api/marketplace/integrations', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const integration = await marketplaceService.createIntegration(request.body);

      return reply.status(201).send({
        success: true,
        data: integration,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  // API Key routes
  server.post('/api/marketplace/api-keys', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const apiKey = await marketplaceService.generateAPIKey(request.body);

      return reply.status(201).send({
        success: true,
        data: apiKey,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  server.get('/api/marketplace/api-keys/:tenantId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params as any;
      const apiKeys = await marketplaceService.getAPIKeys(tenantId);

      return reply.send({
        success: true,
        data: apiKeys,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // Webhook routes
  server.post('/api/marketplace/webhooks', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const webhook = await marketplaceService.createWebhook(request.body);

      return reply.status(201).send({
        success: true,
        data: webhook,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  server.get('/api/marketplace/webhooks/:tenantId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params as any;
      const webhooks = await marketplaceService.getWebhooks(tenantId);

      return reply.send({
        success: true,
        data: webhooks,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // White label routes
  server.post('/api/marketplace/white-label', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = await marketplaceService.createWhiteLabelConfig(request.body);

      return reply.status(201).send({
        success: true,
        data: config,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  // Analytics routes
  server.get('/api/marketplace/analytics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const analytics = await marketplaceService.getMarketplaceAnalytics();

      return reply.send({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // Integration categories (for filtering)
  server.get('/api/marketplace/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    const categories = [
      { id: 'PAYMENT_GATEWAY', name: 'Payment Gateways', icon: '💳' },
      { id: 'SHIPPING_CARRIER', name: 'Shipping Carriers', icon: '📦' },
      { id: 'EMAIL_SERVICE', name: 'Email Services', icon: '📧' },
      { id: 'SMS_PROVIDER', name: 'SMS Providers', icon: '📱' },
      { id: 'INVENTORY_MANAGEMENT', name: 'Inventory Management', icon: '📋' },
      { id: 'CRM_SYSTEM', name: 'CRM Systems', icon: '👥' },
      { id: 'ACCOUNTING_SOFTWARE', name: 'Accounting Software', icon: '💰' },
      { id: 'MARKETING_PLATFORM', name: 'Marketing Platforms', icon: '📊' },
      { id: 'ANALYTICS_TOOL', name: 'Analytics Tools', icon: '📈' },
      { id: 'COMMUNICATION_TOOL', name: 'Communication Tools', icon: '💬' },
      { id: 'SCHEDULING_SERVICE', name: 'Scheduling Services', icon: '📅' },
      { id: 'MAP_SERVICE', name: 'Map Services', icon: '🗺️' },
      { id: 'BACKUP_SERVICE', name: 'Backup Services', icon: '💾' },
      { id: 'SECURITY_SERVICE', name: 'Security Services', icon: '🔒' },
      { id: 'AI_SERVICE', name: 'AI Services', icon: '🤖' },
      { id: 'OTHER', name: 'Other', icon: '🔧' },
    ];

    return reply.send({
      success: true,
      data: categories,
    });
  });
}