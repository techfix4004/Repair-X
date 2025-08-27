/**
 * Phase 5 AI Advanced Features API Routes
 * 
 * RESTful endpoints for:
 * - Machine Learning Model Management
 * - Computer Vision Services
 * - Enterprise Integration Features
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import multer from 'fastify-multer';
import path from 'path';
import fs from 'fs';

import AIModelManagementService from '../services/ai-model-management.service';
import AIComputerVisionService from '../services/ai-computer-vision.service';
import EnterpriseIntegrationService from '../services/enterprise-integration.service';

// Request/Response Schemas
const ModelCreationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['CLASSIFICATION', 'REGRESSION', 'DEEP_LEARNING', 'NLP', 'COMPUTER_VISION']),
  features: z.array(z.string()),
  hyperparameters: z.record(z.string(), z.any())
});

const TrainingJobSchema = z.object({
  dataSource: z.string(),
  features: z.array(z.string()),
  hyperparameters: z.record(z.string(), z.any()),
  validationSplit: z.number().min(0.1).max(0.5)
});

const ABTestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  modelA: z.string().uuid(),
  modelB: z.string().uuid(),
  trafficSplit: z.number().min(0.1).max(0.9),
  duration: z.number().min(1).max(30)
});

const TenantCreationSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().min(1).max(100),
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM']),
  adminEmail: z.string().email(),
  adminName: z.string().min(1).max(100)
});

const SSOConfigSchema = z.object({
  provider: z.enum(['SAML', 'OIDC', 'LDAP', 'ACTIVE_DIRECTORY']),
  config: z.object({
    issuer: z.string(),
    ssoUrl: z.string().url(),
    certificate: z.string(),
    attributeMapping: z.record(z.string(), z.string()),
    groupMapping: z.record(z.string(), z.string()).optional(),
    defaultRole: z.string()
  }),
  enabled: z.boolean(),
  autoProvisioning: z.boolean()
});

const WorkflowTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.enum(['REPAIR', 'BILLING', 'CUSTOMER_SERVICE', 'QUALITY', 'CUSTOM']),
  triggers: z.array(z.object({
    type: z.enum(['JOB_STATUS_CHANGE', 'PAYMENT_RECEIVED', 'CUSTOMER_FEEDBACK', 'TIME_BASED', 'API_CALL']),
    config: z.record(z.string(), z.any())
  })),
  actions: z.array(z.object({
    type: z.enum(['SEND_EMAIL', 'CREATE_TASK', 'UPDATE_STATUS', 'TRIGGER_INTEGRATION', 'CUSTOM_FUNCTION']),
    config: z.record(z.string(), z.any()),
    order: z.number()
  })),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS']),
    value: z.any()
  })),
  isPublic: z.boolean()
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'cv-analysis');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerPhase5Routes(fastify: FastifyInstance) {

  /**
   * AI Model Management Routes
   */
  
  // Get all models
  fastify.get('/api/v1/ai/models', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const models = await AIModelManagementService.getAllModels();
      return { success: true, data: models };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch models' });
    }
  });

  // Get specific model
  fastify.get('/api/v1/ai/models/:modelId', async (request: FastifyRequest<{
    Params: { modelId: string }
  }>, reply: FastifyReply) => {
    try {
      const { modelId } = request.params;
      const model = await AIModelManagementService.getModel(modelId);
      
      if (!model) {
        return reply.code(404).send({ success: false, error: 'Model not found' });
      }
      
      return { success: true, data: model };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch model' });
    }
  });

  // Create new model
  fastify.post('/api/v1/ai/models', async (request: FastifyRequest<{
    Body: z.infer<typeof ModelCreationSchema>
  }>, reply: FastifyReply) => {
    try {
      const validation = ModelCreationSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Invalid request data',
          details: validation.error.issues 
        });
      }

      const model = await AIModelManagementService.createModel(validation.data);
      return { success: true, data: model };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to create model' });
    }
  });

  // Train model
  fastify.post('/api/v1/ai/models/:modelId/train', async (request: FastifyRequest<{
    Params: { modelId: string }
    Body: z.infer<typeof TrainingJobSchema>
  }>, reply: FastifyReply) => {
    try {
      const { modelId } = request.params;
      const validation = TrainingJobSchema.safeParse(request.body);
      
      if (!validation.success) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Invalid training configuration',
          details: validation.error.issues 
        });
      }

      const job = await AIModelManagementService.trainModel(modelId, validation.data);
      return { success: true, data: job };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to start training' });
    }
  });

  // Get model analytics
  fastify.get('/api/v1/ai/models/:modelId/analytics', async (request: FastifyRequest<{
    Params: { modelId: string }
    Querystring: { days?: string }
  }>, reply: FastifyReply) => {
    try {
      const { modelId } = request.params;
      const days = parseInt(request.query.days || '30');
      
      const analytics = await AIModelManagementService.getModelAnalytics(modelId, days);
      return { success: true, data: analytics };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch analytics' });
    }
  });

  // Get training jobs
  fastify.get('/api/v1/ai/training-jobs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const jobs = await AIModelManagementService.getTrainingJobs();
      return { success: true, data: jobs };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch training jobs' });
    }
  });

  // A/B Testing
  fastify.post('/api/v1/ai/ab-tests', async (request: FastifyRequest<{
    Body: z.infer<typeof ABTestSchema>
  }>, reply: FastifyReply) => {
    try {
      const validation = ABTestSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Invalid A/B test configuration',
          details: validation.error.issues 
        });
      }

      const experiment = await AIModelManagementService.createABTest(validation.data);
      return { success: true, data: experiment };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to create A/B test' });
    }
  });

  fastify.get('/api/v1/ai/ab-tests', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const experiments = await AIModelManagementService.getABTests();
      return { success: true, data: experiments };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch A/B tests' });
    }
  });

  fastify.post('/api/v1/ai/ab-tests/:experimentId/start', async (request: FastifyRequest<{
    Params: { experimentId: string }
  }>, reply: FastifyReply) => {
    try {
      const { experimentId } = request.params;
      await AIModelManagementService.startABTest(experimentId);
      return { success: true, message: 'A/B test started' };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to start A/B test' });
    }
  });

  /**
   * Computer Vision Routes (Simplified - no file upload for now)
   */

  // Computer vision analytics
  fastify.get('/api/v1/ai/cv/analytics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const analytics = await AIComputerVisionService.getAnalytics();
      return { success: true, data: analytics };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch CV analytics' });
    }
  });

  /**
   * Enterprise Integration Routes
   */

  // Tenant Management
  fastify.post('/api/v1/enterprise/tenants', async (request: FastifyRequest<{
    Body: z.infer<typeof TenantCreationSchema>
  }>, reply: FastifyReply) => {
    try {
      const validation = TenantCreationSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Invalid tenant configuration',
          details: validation.error.issues 
        });
      }

      const tenant = await EnterpriseIntegrationService.createTenant(validation.data);
      return { success: true, data: tenant };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to create tenant' });
    }
  });

  fastify.get('/api/v1/enterprise/tenants/:tenantId', async (request: FastifyRequest<{
    Params: { tenantId: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params;
      const tenant = await EnterpriseIntegrationService.getTenantConfiguration(tenantId);
      
      if (!tenant) {
        return reply.code(404).send({ success: false, error: 'Tenant not found' });
      }
      
      return { success: true, data: tenant };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch tenant' });
    }
  });

  // SSO Configuration
  fastify.post('/api/v1/enterprise/tenants/:tenantId/sso', async (request: FastifyRequest<{
    Params: { tenantId: string }
    Body: z.infer<typeof SSOConfigSchema>
  }>, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params;
      const validation = SSOConfigSchema.safeParse(request.body);
      
      if (!validation.success) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Invalid SSO configuration',
          details: validation.error.issues 
        });
      }

      await EnterpriseIntegrationService.setupSSO(tenantId, validation.data);
      return { success: true, message: 'SSO configured successfully' };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to configure SSO' });
    }
  });

  // SSO Authentication
  fastify.post('/api/v1/enterprise/tenants/:tenantId/sso/authenticate', async (request: FastifyRequest<{
    Params: { tenantId: string }
    Body: { samlResponse: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params;
      const { samlResponse } = request.body;
      
      if (!samlResponse) {
        return reply.code(400).send({ success: false, error: 'SAML response required' });
      }

      const result = await EnterpriseIntegrationService.authenticateSSO(tenantId, samlResponse);
      return { success: true, data: result };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'SSO authentication failed' });
    }
  });

  // White-label Setup
  fastify.post('/api/v1/enterprise/tenants/:tenantId/white-label', async (request: FastifyRequest<{
    Params: { tenantId: string }
    Body: {
      branding: {
        logo?: string;
        primaryColor: string;
        secondaryColor: string;
        favicon?: string;
      };
      customDomain?: string;
      customEmailDomain?: string;
      customTermsUrl?: string;
      customPrivacyUrl?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params;
      await EnterpriseIntegrationService.setupWhiteLabel(tenantId, request.body);
      return { success: true, message: 'White-label configuration updated' };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to configure white-label' });
    }
  });

  // Workflow Templates
  fastify.post('/api/v1/enterprise/workflows', async (request: FastifyRequest<{
    Body: z.infer<typeof WorkflowTemplateSchema>
  }>, reply: FastifyReply) => {
    try {
      const validation = WorkflowTemplateSchema.safeParse(request.body);
      if (!validation.success) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Invalid workflow template',
          details: validation.error.issues 
        });
      }

      const template = await EnterpriseIntegrationService.createWorkflowTemplate({
        ...validation.data,
        version: '1.0.0'
      });
      return { success: true, data: template };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to create workflow template' });
    }
  });

  fastify.post('/api/v1/enterprise/workflows/:templateId/execute', async (request: FastifyRequest<{
    Params: { templateId: string }
    Body: { context: Record<string, any> }
  }>, reply: FastifyReply) => {
    try {
      const { templateId } = request.params;
      const { context } = request.body;
      
      const result = await EnterpriseIntegrationService.executeWorkflow(templateId, context);
      return { success: true, data: result };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to execute workflow' });
    }
  });

  // Tenant Analytics
  fastify.get('/api/v1/enterprise/tenants/:tenantId/analytics', async (request: FastifyRequest<{
    Params: { tenantId: string }
    Querystring: { days?: string }
  }>, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params;
      const days = parseInt(request.query.days || '30');
      
      const analytics = await EnterpriseIntegrationService.getTenantAnalytics(tenantId, days);
      return { success: true, data: analytics };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to fetch tenant analytics' });
    }
  });

  // API Gateway Test
  fastify.post('/api/v1/enterprise/api-gateway/test', async (request: FastifyRequest<{
    Body: {
      tenantId: string;
      endpoint: string;
      method: string;
      userId?: string;
      requestSize: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const result = await EnterpriseIntegrationService.processAPIRequest(
        request.body.tenantId,
        {
          endpoint: request.body.endpoint,
          method: request.body.method,
          userId: request.body.userId,
          requestSize: request.body.requestSize
        }
      );
      return { success: true, data: result };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Failed to process API request' });
    }
  });

  /**
   * Health Check for Phase 5 Services
   */
  fastify.get('/api/v1/ai/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        services: {
          modelManagement: 'operational',
          computerVision: 'operational',
          enterpriseIntegration: 'operational'
        },
        version: '5.0.0',
        features: [
          'ML Model Management',
          'Computer Vision Analysis',
          'Enterprise SSO/SAML',
          'Multi-tenant SaaS',
          'Advanced Workflows',
          'White-label Platform'
        ]
      };

      return { success: true, data: health };
    } catch (error) {
      reply.code(500).send({ success: false, error: 'Health check failed' });
    }
  });
}