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
      headings: z.string().default('Inter'),
    }),
  }),
  features: z.object({
    enabledModules: z.array(z.string()),
    customPages: z.array(z.object({
      slug: z.string(),
      title: z.string(),
      content: z.string(),
    })).default([]),
    hiddenFeatures: z.array(z.string()).default([]),
  }),
  contact: z.object({
    supportEmail: z.string().email(),
    supportPhone: z.string(),
    businessAddress: z.string(),
    website: z.string().url().optional(),
  }),
  integrations: z.array(z.string()).default([]), // Integration IDs
  customization: z.object({
    css: z.string().optional(),
    javascript: z.string().optional(),
    customFields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
    })).default([]),
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
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample integrations
    const sampleIntegrations = [
      {
        id: 'stripe-payment',
        name: 'Stripe Payment Gateway',
        description: 'Accept payments online with Stripe\'s secure payment processing',
        category: 'PAYMENT_GATEWAY',
        provider: {
          name: 'Stripe Inc.',
          website: 'https://stripe.com',
          supportEmail: 'support@stripe.com',
          documentation: 'https://stripe.com/docs/api',
        },
        authentication: {
          type: 'API_KEY',
          requiredFields: [
            { name: 'publishable_key', type: 'string', required: true, description: 'Stripe publishable key' },
            { name: 'secret_key', type: 'string', required: true, description: 'Stripe secret key' },
          ],
          testCredentials: { available: true, sandbox: true },
        },
        endpoints: [
          {
            id: 'create_payment_intent',
            name: 'Create Payment Intent',
            method: 'POST',
            url: 'https://api.stripe.com/v1/payment_intents',
            description: 'Create a payment intent for a specific amount',
            rateLimit: { requests: 100, period: '1 second' },
          },
          {
            id: 'retrieve_payment_intent',
            name: 'Retrieve Payment Intent',
            method: 'GET',
            url: 'https://api.stripe.com/v1/payment_intents/{id}',
            description: 'Retrieve details of a payment intent',
          },
        ],
        pricing: {
          model: 'PAY_PER_USE',
          tiers: [
            {
              name: 'Standard',
              price: 2.9,
              currency: 'USD',
              features: ['Card processing', 'Real-time reporting', 'Fraud protection'],
            },
          ],
        },
        features: [
          'PCI DSS Level 1 compliance',
          'Real-time fraud protection',
          '135+ currencies',
          'Mobile-optimized checkout',
        ],
        requirements: {
          technicalRequirements: ['HTTPS enabled', 'Webhook endpoints'],
          permissions: ['PAYMENT_PROCESSING'],
        },
        status: 'PUBLISHED',
        rating: {
          average: 4.8,
          total: 1247,
          reviews: [
            {
              userId: 'user-001',
              rating: 5,
              comment: 'Excellent integration, very reliable',
              date: '2025-08-01T00:00:00Z',
            },
          ],
        },
        usage: {
          totalInstalls: 15420,
          activeInstalls: 12350,
          lastMonthRequests: 2450000,
        },
        metadata: {
          tags: ['payments', 'e-commerce', 'security'],
          version: '2.1.0',
          createdBy: 'marketplace-admin',
        },
      },
      {
        id: 'sendgrid-email',
        name: 'SendGrid Email Service',
        description: 'Reliable email delivery with SendGrid\'s cloud-based SMTP relay',
        category: 'EMAIL_SERVICE',
        provider: {
          name: 'Twilio SendGrid',
          website: 'https://sendgrid.com',
          supportEmail: 'support@sendgrid.com',
          documentation: 'https://docs.sendgrid.com/api-reference',
        },
        authentication: {
          type: 'API_KEY',
          requiredFields: [
            { name: 'api_key', type: 'string', required: true, description: 'SendGrid API key' },
          ],
          testCredentials: { available: true, sandbox: true },
        },
        endpoints: [
          {
            id: 'sendemail',
            name: 'Send Email',
            method: 'POST',
            url: 'https://api.sendgrid.com/v3/mail/send',
            description: 'Send transactional and marketing emails',
            rateLimit: { requests: 600, period: '1 minute' },
          },
          {
            id: 'email_stats',
            name: 'Email Statistics',
            method: 'GET',
            url: 'https://api.sendgrid.com/v3/stats',
            description: 'Get email delivery statistics',
          },
        ],
        pricing: {
          model: 'FREEMIUM',
          tiers: [
            {
              name: 'Free',
              price: 0,
              currency: 'USD',
              features: ['100 emails/day', 'Email API', 'SMTP relay'],
              limits: { requests: 100 },
            },
            {
              name: 'Essentials',
              price: 14.95,
              currency: 'USD',
              period: 'monthly',
              features: ['40K emails/month', 'Email validation', 'Analytics'],
            },
          ],
        },
        features: [
          '99.9% uptime SLA',
          'Global email delivery',
          'Advanced analytics',
          'Template management',
        ],
        requirements: {
          technicalRequirements: ['Valid sender domain', 'SPF/DKIM records'],
          permissions: ['EMAIL_SENDING'],
        },
        status: 'PUBLISHED',
        rating: {
          average: 4.5,
          total: 892,
        },
        usage: {
          totalInstalls: 8420,
          activeInstalls: 7250,
          lastMonthRequests: 15750000,
        },
        metadata: {
          tags: ['email', 'transactional', 'marketing'],
          version: '1.8.2',
          createdBy: 'marketplace-admin',
        },
      },
    ];

    sampleIntegrations.forEach((integration: unknown) => {
      this.integrations.set(integration.id, integration);
    });

    // Sample API keys
    const sampleApiKeys = [
      {
        id: 'key-001',
        name: 'Production API Key',
        keyHash: 'sk_live_...',
        keyPrefix: 'sk_live',
        permissions: ['READ', 'WRITE', 'INTEGRATIONS'],
        restrictions: {
          ipWhitelist: ['192.168.1.100'],
          rateLimits: {
            requestsPerMinute: 100,
            requestsPerHour: 1000,
            requestsPerDay: 10000,
          },
        },
        usage: {
          totalRequests: 45780,
          lastUsed: '2025-08-10T10:30:00Z',
          requestsToday: 234,
        },
        isActive: true,
        tenantId: 'tenant-001',
        createdBy: 'admin-001',
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];

    sampleApiKeys.forEach((apiKey: unknown) => {
      const tenantKeys = this.apiKeys.get(apiKey.tenantId) || [];
      tenantKeys.push(apiKey);
      this.apiKeys.set(apiKey.tenantId, tenantKeys);
    });

    // Sample webhooks
    const sampleWebhooks = [
      {
        id: 'webhook-001',
        name: 'Job Status Updates',
        url: 'https://client-system.example.com/webhooks/job-status',
        events: ['JOB_CREATED', 'JOB_UPDATED', 'JOB_COMPLETED'],
        authentication: {
          type: 'SIGNATURE',
          secret: 'whsec_...',
        },
        settings: {
          retryAttempts: 3,
          retryBackoff: 'EXPONENTIAL',
          timeout: 30,
          batchSize: 1,
        },
        status: 'ACTIVE',
        statistics: {
          totalDeliveries: 1247,
          successfulDeliveries: 1198,
          failedDeliveries: 49,
          lastDelivery: '2025-08-10T09:45:00Z',
        },
        tenantId: 'tenant-001',
        createdBy: 'admin-001',
        createdAt: '2025-02-01T00:00:00Z',
      },
    ];

    sampleWebhooks.forEach((webhook: unknown) => {
      const tenantWebhooks = this.webhooks.get(webhook.tenantId) || [];
      tenantWebhooks.push(webhook);
      this.webhooks.set(webhook.tenantId, tenantWebhooks);
    });
  }

  // Integration Management
  async getAllIntegrations(filters?: any): Promise<any[]> {
    let integrations = Array.from(this.integrations.values());

    if (filters) {
      if (filters.category) {
        integrations = integrations.filter((int: unknown) => int.category === filters.category);
      }
      if (filters.status) {
        integrations = integrations.filter((int: unknown) => int.status === filters.status);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        integrations = integrations.filter((int: unknown) =>
          int.name.toLowerCase().includes(searchTerm) ||
          int.description.toLowerCase().includes(searchTerm) ||
          int.metadata.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
        );
      }
      if (filters.minRating) {
        integrations = integrations.filter((int: unknown) => int.rating.average >= filters.minRating);
      }
    }

    return integrations;
  }

  async getIntegrationById(integrationId: string): Promise<any | null> {
    return this.integrations.get(integrationId) || null;
  }

  async createIntegration(integrationData: unknown): Promise<any> {
    const validated = APIIntegrationSchema.parse(integrationData);
    const id = validated.id || `integration-${Date.now()}`;
    
    const integration = { 
      ...validated, 
      id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(integrationId: string, updateData: unknown): Promise<any> {
    const existingIntegration = this.integrations.get(integrationId);
    if (!existingIntegration) {
      throw new Error('Integration not found');
    }

    const updatedIntegration = { 
      ...existingIntegration, 
      ...updateData, 
      updatedAt: new Date().toISOString(),
    };
    
    const validated = APIIntegrationSchema.parse(updatedIntegration);
    this.integrations.set(integrationId, validated);
    
    return validated;
  }

  // API Key Management
  async generateAPIKey(keyData: unknown): Promise<any> {
    const validated = APIKeySchema.parse({
      ...keyData,
      keyHash: `sk_${(keyData as any).tenantId}_${Date.now()}`,
      keyPrefix: 'sk_live',
      createdAt: new Date().toISOString(),
    });
    
    const id = validated.id || `key-${Date.now()}`;
    const apiKey = { ...validated, id };
    
    const tenantKeys = this.apiKeys.get(validated.tenantId) || [];
    tenantKeys.push(apiKey);
    this.apiKeys.set(validated.tenantId, tenantKeys);
    
    return apiKey;
  }

  async getAPIKeys(tenantId: string): Promise<any[]> {
    return this.apiKeys.get(tenantId) || [];
  }

  async revokeAPIKey(keyId: string, tenantId: string): Promise<void> {
    const tenantKeys = this.apiKeys.get(tenantId) || [];
    const keyIndex = tenantKeys.findIndex(key => key.id === keyId);
    
    if (keyIndex === -1) {
      throw new Error('API key not found');
    }
    
    tenantKeys[keyIndex]?.isActive = false;
    this.apiKeys.set(tenantId, tenantKeys);
  }

  // Webhook Management
  async createWebhook(webhookData: unknown): Promise<any> {
    const validated = WebhookSchema.parse({
      ...webhookData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    const id = validated.id || `webhook-${Date.now()}`;
    const webhook = { ...validated, id };
    
    const tenantWebhooks = this.webhooks.get(validated.tenantId) || [];
    tenantWebhooks.push(webhook);
    this.webhooks.set(validated.tenantId, tenantWebhooks);
    
    return webhook;
  }

  async getWebhooks(tenantId: string): Promise<any[]> {
    return this.webhooks.get(tenantId) || [];
  }

  async updateWebhook(webhookId: string, tenantId: string, updateData: unknown): Promise<any> {
    const tenantWebhooks = this.webhooks.get(tenantId) || [];
    const webhookIndex = tenantWebhooks.findIndex(webhook => webhook.id === webhookId);
    
    if (webhookIndex === -1) {
      throw new Error('Webhook not found');
    }
    
    const updatedWebhook = { 
      ...tenantWebhooks[webhookIndex], 
      ...updateData, 
      updatedAt: new Date().toISOString(),
    };
    
    const validated = WebhookSchema.parse(updatedWebhook);
    tenantWebhooks[webhookIndex] = validated;
    this.webhooks.set(tenantId, tenantWebhooks);
    
    return validated;
  }

  // White Label Management
  async createWhiteLabelConfig(configData: unknown): Promise<any> {
    const validated = WhiteLabelConfigSchema.parse({
      ...configData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    const id = validated.id || `wl-${Date.now()}`;
    const config = { ...validated, id };
    
    this.whiteLabelConfigs.set(id, config);
    return config;
  }

  async getWhiteLabelConfig(configId: string): Promise<any | null> {
    return this.whiteLabelConfigs.get(configId) || null;
  }

  async updateWhiteLabelConfig(configId: string, updateData: unknown): Promise<any> {
    const existingConfig = this.whiteLabelConfigs.get(configId);
    if (!existingConfig) {
      throw new Error('White label configuration not found');
    }

    const updatedConfig = { 
      ...existingConfig, 
      ...updateData, 
      updatedAt: new Date().toISOString(),
    };
    
    const validated = WhiteLabelConfigSchema.parse(updatedConfig);
    this.whiteLabelConfigs.set(configId, validated);
    
    return validated;
  }

  // Analytics and Reporting
  async getMarketplaceAnalytics(): Promise<any> {
    const integrations = Array.from(this.integrations.values());
    const allApiKeys = Array.from(this.apiKeys.values()).flat();
    const allWebhooks = Array.from(this.webhooks.values()).flat();
    
    return {
      overview: {
        totalIntegrations: integrations.length,
        publishedIntegrations: integrations.filter((i: unknown) => i.status === 'PUBLISHED').length,
        totalAPIKeys: allApiKeys.length,
        activeAPIKeys: allApiKeys.filter((k: unknown) => k.isActive).length,
        totalWebhooks: allWebhooks.length,
        activeWebhooks: allWebhooks.filter((w: unknown) => w.status === 'ACTIVE').length,
      },
      categories: this.getIntegrationCategories(integrations),
      topIntegrations: integrations
        .sort((a, b) => b.usage.activeInstalls - a.usage.activeInstalls)
        .slice(0, 10),
      usage: {
        totalRequests: allApiKeys.reduce((sum: unknown, key: unknown) => sum + key.usage.totalRequests, 0),
        requestsToday: allApiKeys.reduce((sum: unknown, key: unknown) => sum + key.usage.requestsToday, 0),
        webhookDeliveries: allWebhooks.reduce((sum: unknown, webhook: unknown) => sum + webhook.statistics.totalDeliveries, 0),
      },
    };
  }

  private getIntegrationCategories(integrations: unknown[]): any[] {
    const categoryMap = new Map();
    
    integrations.forEach((integration: unknown) => {
      const count = categoryMap.get(integration.category) || 0;
      categoryMap.set(integration.category, count + 1);
    });
    
    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / integrations.length) * 100),
    }));
  }

  async getDeveloperPortalStats(tenantId: string): Promise<any> {
    const tenantApiKeys = this.apiKeys.get(tenantId) || [];
    const tenantWebhooks = this.webhooks.get(tenantId) || [];
    
    return {
      apiKeys: {
        total: tenantApiKeys.length,
        active: tenantApiKeys.filter((k: unknown) => k.isActive).length,
        totalRequests: tenantApiKeys.reduce((sum: unknown, key: unknown) => sum + key.usage.totalRequests, 0),
        requestsToday: tenantApiKeys.reduce((sum: unknown, key: unknown) => sum + key.usage.requestsToday, 0),
      },
      webhooks: {
        total: tenantWebhooks.length,
        active: tenantWebhooks.filter((w: unknown) => w.status === 'ACTIVE').length,
        successRate: this.calculateWebhookSuccessRate(tenantWebhooks),
        totalDeliveries: tenantWebhooks.reduce((sum: unknown, webhook: unknown) => sum + webhook.statistics.totalDeliveries, 0),
      },
      integrations: {
        installed: [], // Would be fetched from tenant configuration
        available: Array.from(this.integrations.values()).filter((i: unknown) => i.status === 'PUBLISHED').length,
      },
    };
  }

  private calculateWebhookSuccessRate(webhooks: unknown[]): number {
    const totalDeliveries = webhooks.reduce((sum: unknown, w: unknown) => sum + w.statistics.totalDeliveries, 0);
    const successfulDeliveries = webhooks.reduce((sum: unknown, w: unknown) => sum + w.statistics.successfulDeliveries, 0);
    
    return totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 100;
  }
}

// Route Handlers
export async function apiMarketplaceRoutes(server: FastifyInstance): Promise<void> {
  const marketplaceService = new APIMarketplaceService();

  // Get all integrations
  server.get('/integrations', async (request: FastifyRequest<{
    Querystring: { 
      category?: string;
      status?: string;
      search?: string;
      minRating?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const filters = request.query;
      const integrations = await marketplaceService.getAllIntegrations(filters);
      
      return reply.send({
        success: true,
        data: integrations,
        count: integrations.length,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve integrations',
        error: error.message,
      });
    }
  });

  // Create new integration
  server.post('/integrations', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const integrationData = request.body;
      const integration = await marketplaceService.createIntegration(integrationData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: integration,
        message: 'Integration created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create integration',
        error: error.message,
      });
    }
  });

  // Get integration by ID
  server.get('/integrations/:integrationId', async (request: FastifyRequest<{
    Params: { integrationId: string }
  }>, reply: FastifyReply) => {
    try {
      const { integrationId  } = (request.params as unknown);
      const integration = await marketplaceService.getIntegrationById(integrationId);
      
      if (!integration) {
        return (reply as FastifyReply).status(404).send({
          success: false,
          message: 'Integration not found',
        });
      }
      
      return reply.send({
        success: true,
        data: integration,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve integration',
        error: error.message,
      });
    }
  });

  // Update integration
  server.put('/integrations/:integrationId', async (request: FastifyRequest<{
    Params: { integrationId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { integrationId  } = (request.params as unknown);
      const updateData = request.body;
      
      const integration = await marketplaceService.updateIntegration(integrationId, updateData);
      
      return reply.send({
        success: true,
        data: integration,
        message: 'Integration updated successfully',
      });
    } catch (error: unknown) {
      const status = error.message === 'Integration not found' ? 404 : 400;
      return (reply as FastifyReply).status(status).send({
        success: false,
        message: 'Failed to update integration',
        error: error.message,
      });
    }
  });

  // Generate API key
  server.post('/api-keys', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const keyData = request.body;
      const apiKey = await marketplaceService.generateAPIKey(keyData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: apiKey,
        message: 'API key generated successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to generate API key',
        error: error.message,
      });
    }
  });

  // Get API keys
  server.get('/api-keys/:tenantId', async (request: FastifyRequest<{
    Params: { tenantId: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId  } = (request.params as unknown);
      const apiKeys = await marketplaceService.getAPIKeys(tenantId);
      
      return reply.send({
        success: true,
        data: apiKeys,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve API keys',
        error: error.message,
      });
    }
  });

  // Revoke API key
  server.delete('/api-keys/:keyId/:tenantId', async (request: FastifyRequest<{
    Params: { keyId: string; tenantId: string }
  }>, reply: FastifyReply) => {
    try {
      const { keyId, tenantId  } = (request.params as unknown);
      await marketplaceService.revokeAPIKey(keyId, tenantId);
      
      return reply.send({
        success: true,
        message: 'API key revoked successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to revoke API key',
        error: error.message,
      });
    }
  });

  // Create webhook
  server.post('/webhooks', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const webhookData = request.body;
      const webhook = await marketplaceService.createWebhook(webhookData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: webhook,
        message: 'Webhook created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create webhook',
        error: error.message,
      });
    }
  });

  // Get webhooks
  server.get('/webhooks/:tenantId', async (request: FastifyRequest<{
    Params: { tenantId: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId  } = (request.params as unknown);
      const webhooks = await marketplaceService.getWebhooks(tenantId);
      
      return reply.send({
        success: true,
        data: webhooks,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve webhooks',
        error: error.message,
      });
    }
  });

  // Update webhook
  server.put('/webhooks/:webhookId/:tenantId', async (request: FastifyRequest<{
    Params: { webhookId: string; tenantId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { webhookId, tenantId  } = (request.params as unknown);
      const updateData = request.body;
      
      const webhook = await marketplaceService.updateWebhook(webhookId, tenantId, updateData);
      
      return reply.send({
        success: true,
        data: webhook,
        message: 'Webhook updated successfully',
      });
    } catch (error: unknown) {
      const status = error.message === 'Webhook not found' ? 404 : 400;
      return (reply as FastifyReply).status(status).send({
        success: false,
        message: 'Failed to update webhook',
        error: error.message,
      });
    }
  });

  // White Label Configuration
  server.post('/white-label', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const configData = request.body;
      const config = await marketplaceService.createWhiteLabelConfig(configData);
      
      return (reply as FastifyReply).status(201).send({
        success: true,
        data: config,
        message: 'White label configuration created successfully',
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(400).send({
        success: false,
        message: 'Failed to create white label configuration',
        error: error.message,
      });
    }
  });

  // Get white label configuration
  server.get('/white-label/:configId', async (request: FastifyRequest<{
    Params: { configId: string }
  }>, reply: FastifyReply) => {
    try {
      const { configId  } = (request.params as unknown);
      const config = await marketplaceService.getWhiteLabelConfig(configId);
      
      if (!config) {
        return (reply as FastifyReply).status(404).send({
          success: false,
          message: 'White label configuration not found',
        });
      }
      
      return reply.send({
        success: true,
        data: config,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve white label configuration',
        error: error.message,
      });
    }
  });

  // Update white label configuration
  server.put('/white-label/:configId', async (request: FastifyRequest<{
    Params: { configId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { configId  } = (request.params as unknown);
      const updateData = request.body;
      
      const config = await marketplaceService.updateWhiteLabelConfig(configId, updateData);
      
      return reply.send({
        success: true,
        data: config,
        message: 'White label configuration updated successfully',
      });
    } catch (error: unknown) {
      const status = error.message === 'White label configuration not found' ? 404 : 400;
      return (reply as FastifyReply).status(status).send({
        success: false,
        message: 'Failed to update white label configuration',
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

  // Get developer portal stats
  server.get('/developer/:tenantId/stats', async (request: FastifyRequest<{
    Params: { tenantId: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId  } = (request.params as unknown);
      const stats = await marketplaceService.getDeveloperPortalStats(tenantId);
      
      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error: unknown) {
      return (reply as FastifyReply).status(500).send({
        success: false,
        message: 'Failed to retrieve developer portal stats',
        error: error.message,
      });
    }
  });

  // Get integration categories
  server.get('/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    const categories = [
      { id: 'PAYMENT_GATEWAY', name: 'Payment Gateways', icon: '💳' },
      { id: 'SHIPPING_CARRIER', name: 'Shipping Carriers', icon: '📦' },
      { id: 'EMAIL_SERVICE', name: 'Email Services', icon: '📧' },
      { id: 'SMS_PROVIDER', name: 'SMS Providers', icon: '📱' },
      { id: 'INVENTORY_MANAGEMENT', name: 'Inventory Management', icon: '📊' },
      { id: 'CRM_SYSTEM', name: 'CRM Systems', icon: '👥' },
      { id: 'ACCOUNTING_SOFTWARE', name: 'Accounting Software', icon: '💼' },
      { id: 'MARKETING_PLATFORM', name: 'Marketing Platforms', icon: '📢' },
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

export default apiMarketplaceRoutes;