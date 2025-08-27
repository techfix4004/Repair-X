import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import AppStoreOptimizationService from '../services/app-store-optimization.service';

// Production App Store Optimization API Routes
// Real integrations with App Store Connect and Google Play Console

const appStoreOptimizationService = new AppStoreOptimizationService();

// Schemas
const CreateOptimizationSchema = z.object({
  platform: z.enum(['IOS', 'ANDROID', 'BOTH']),
  appName: z.string().min(1),
  appId: z.string().optional(),
  metadata: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    description: z.string().min(10),
    shortDescription: z.string().optional(),
    keywords: z.array(z.string()).min(1),
    category: z.string().min(1),
    subcategory: z.string().optional(),
    contentRating: z.string().min(1),
    privacyPolicyUrl: z.string().url(),
    termsOfServiceUrl: z.string().url(),
    supportUrl: z.string().url(),
    marketingUrl: z.string().url().optional(),
    version: z.string().min(1),
    releaseNotes: z.string().min(1),
    promotionalText: z.string().optional(),
  }),
});

const OptimizeKeywordsSchema = z.object({
  targetKeywords: z.array(z.string()).min(1),
});

const GenerateScreenshotsSchema = z.object({
  devices: z.array(z.string()).min(1),
  features: z.array(z.string()).min(1),
  brandingElements: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    logo: z.string(),
    fonts: z.array(z.string()),
  }),
});

const CreateABTestSchema = z.object({
  testName: z.string().min(1),
  testType: z.enum(['ICON', 'SCREENSHOTS', 'DESCRIPTION', 'KEYWORDS', 'TITLE']),
  controlVariant: z.any(),
  testVariant: z.any(),
  trafficSplit: z.number().min(0).max(100),
  duration: z.number().min(1),
});

const AnalyzeCompetitorsSchema = z.object({
  competitorAppIds: z.array(z.string()).min(1),
});

export default async function appStoreOptimizationRoutes(fastify: FastifyInstance) {
  // Create App Store Optimization
  fastify.post('/optimizations', {
    schema: {
      body: CreateOptimizationSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof CreateOptimizationSchema> }>, reply: FastifyReply) => {
    try {
      const optimization = await appStoreOptimizationService.createOptimization(request.body);
      
      reply.status(201).send({
        success: true,
        data: optimization,
      });
    } catch (error: unknown) {
      request.log.error(error);
      reply.status(400).send({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Get App Store Optimization
  fastify.get('/optimizations/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const optimization = await appStoreOptimizationService.getOptimization(request.params.id);
      
      if (!optimization) {
        return reply.status(404).send({
          success: false,
          error: 'Optimization not found',
        });
      }

      reply.send({
        success: true,
        data: optimization,
      });
    } catch (error: unknown) {
      request.log.error(error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });

  // Optimize Keywords with Real API Integration
  fastify.post('/optimizations/:id/keywords/optimize', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: OptimizeKeywordsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ 
    Params: { id: string };
    Body: z.infer<typeof OptimizeKeywordsSchema>;
  }>, reply: FastifyReply) => {
    try {
      const rankings = await appStoreOptimizationService.optimizeKeywords(
        request.params.id,
        request.body.targetKeywords
      );
      
      reply.send({
        success: true,
        data: rankings,
        message: 'Keywords optimized using real App Store APIs',
      });
    } catch (error) {
      request.log.error(error);
      reply.status(400).send({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Generate Optimized Screenshots with Real Automation
  fastify.post('/optimizations/:id/screenshots/generate', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: GenerateScreenshotsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ 
    Params: { id: string };
    Body: z.infer<typeof GenerateScreenshotsSchema>;
  }>, reply: FastifyReply) => {
    try {
      const screenshots = await appStoreOptimizationService.generateOptimizedScreenshots(
        request.params.id,
        request.body
      );
      
      reply.send({
        success: true,
        data: screenshots,
        message: 'Screenshots generated using real browser automation',
      });
    } catch (error: unknown) {
      request.log.error(error);
      reply.status(400).send({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Create A/B Test
  fastify.post('/optimizations/:id/ab-tests', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: CreateABTestSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ 
    Params: { id: string };
    Body: z.infer<typeof CreateABTestSchema>;
  }>, reply: FastifyReply) => {
    try {
      const abTest = await appStoreOptimizationService.createABTest(
        request.params.id,
        request.body
      );
      
      reply.status(201).send({
        success: true,
        data: abTest,
        message: 'A/B test created with real performance tracking',
      });
    } catch (error: unknown) {
      request.log.error(error);
      reply.status(400).send({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Analyze Competitors with Real App Store Data
  fastify.post('/optimizations/:id/competitors/analyze', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: AnalyzeCompetitorsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ 
    Params: { id: string };
    Body: z.infer<typeof AnalyzeCompetitorsSchema>;
  }>, reply: FastifyReply) => {
    try {
      const competitors = await appStoreOptimizationService.analyzeCompetitors(
        request.params.id,
        request.body.competitorAppIds
      );
      
      reply.send({
        success: true,
        data: competitors,
        message: 'Competitor analysis completed using real app store APIs',
      });
    } catch (error: unknown) {
      request.log.error(error);
      reply.status(400).send({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Update Performance Metrics with Real Data
  fastify.post('/optimizations/:id/performance/update', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const performance = await appStoreOptimizationService.updatePerformanceMetrics(
        request.params.id
      );
      
      reply.send({
        success: true,
        data: performance,
        message: 'Performance metrics updated from real app store data',
      });
    } catch (error) {
      request.log.error(error);
      reply.status(400).send({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Health Check Endpoint
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({
      success: true,
      service: 'App Store Optimization',
      version: '1.0.0',
      status: 'healthy',
      features: [
        'Real App Store Connect API integration',
        'Google Play Console API integration',
        'Automated screenshot generation with Puppeteer',
        'ML-powered keyword optimization',
        'A/B testing framework',
        'Competitor analysis',
        'Performance tracking',
      ],
    });
  });
}