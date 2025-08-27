import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

const fastify: FastifyInstance = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
});

// Register plugins
async function registerPlugins() {
  // Register CORS first
  await fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });
}

// Register Phase 5 AI API endpoints with mock data
fastify.get('/api/v1/ai/models', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'model_001',
        name: 'Intelligent Job Assignment',
        type: 'CLASSIFICATION',
        version: '2.1.0',
        accuracy: 89.3,
        status: 'ACTIVE',
        lastTrained: '2024-01-15T10:30:00Z',
        deployedAt: '2024-01-15T12:00:00Z'
      },
      {
        id: 'model_002', 
        name: 'Repair Time Prediction',
        type: 'REGRESSION',
        version: '1.8.2',
        accuracy: 91.7,
        status: 'ACTIVE',
        lastTrained: '2024-01-14T15:45:00Z',
        deployedAt: '2024-01-14T16:30:00Z'
      },
      {
        id: 'model_003',
        name: 'Computer Vision Analysis', 
        type: 'COMPUTER_VISION',
        version: '3.2.1',
        accuracy: 92.4,
        status: 'ACTIVE',
        lastTrained: '2024-01-13T09:20:00Z',
        deployedAt: '2024-01-13T11:00:00Z'
      }
    ]
  };
});

// AI Dashboard endpoint
fastify.get('/api/v1/ai/dashboard', async (request, reply) => {
  return {
    success: true,
    data: {
      models: {
        total: 8,
        active: 6,
        training: 1,
        testing: 1
      },
      performance: {
        averageAccuracy: 91.2,
        totalPredictions: 456789,
        successfulPredictions: 417342,
        accuracyTrend: '+2.3%'
      },
      computeVision: {
        totalAnalyses: 34567,
        accuracy: 92.4,
        averageProcessingTime: '1.2s',
        failureRate: '0.8%'
      },
      businessImpact: {
        costSavings: 145000,
        revenueImpact: 234567,
        efficiencyGain: '18.7%',
        customerSatisfaction: 96.1
      }
    }
  };
});

// Computer Vision Analysis endpoint
fastify.post('/api/v1/ai/cv/analyze', async (request, reply) => {
  return {
    success: true,
    data: {
      analysisId: `cv_${Date.now()}`,
      results: {
        deviceType: 'Smartphone',
        deviceModel: 'iPhone 14 Pro',
        damageDetected: true,
        damageType: 'Screen Crack',
        severity: 'MODERATE',
        confidence: 94.2,
        estimatedRepairCost: 299,
        estimatedRepairTime: '45-60 minutes',
        recommendedActions: [
          'Replace screen assembly',
          'Check digitizer functionality', 
          'Test touch responsiveness'
        ]
      },
      processedAt: new Date().toISOString()
    }
  };
});

// Enterprise Multi-tenant endpoints
fastify.get('/api/v1/enterprise/tenants', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'tenant_001',
        name: 'TechFix Solutions',
        domain: 'techfix.repairx.com',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        createdAt: '2024-01-10T08:00:00Z',
        apiUsage: {
          requests: 12400,
          limit: 50000
        }
      },
      {
        id: 'tenant_002',
        name: 'QuickRepair Plus',
        domain: 'quickrepair.repairx.com', 
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        createdAt: '2024-01-08T14:30:00Z',
        apiUsage: {
          requests: 8760,
          limit: 25000
        }
      }
    ]
  };
});

// Advanced AI Management endpoints
fastify.get('/api/v1/ai/advanced/models/performance', async (request, reply) => {
  return {
    success: true,
    data: {
      modelPerformance: [
        {
          modelId: 'model_001',
          name: 'Intelligent Job Assignment',
          accuracy: 89.3,
          precision: 91.2,
          recall: 87.8,
          f1Score: 89.5,
          drift: {
            detected: false,
            score: 0.12,
            threshold: 0.15
          }
        },
        {
          modelId: 'model_002',
          name: 'Repair Time Prediction', 
          accuracy: 91.7,
          mae: 8.3,
          rmse: 12.1,
          r2Score: 0.923,
          drift: {
            detected: false,
            score: 0.08,
            threshold: 0.15
          }
        }
      ],
      systemHealth: {
        uptime: '99.97%',
        averageResponseTime: '89ms',
        errorRate: '0.03%',
        throughput: '1247 req/min'
      }
    }
  };
});

// Workflow Automation endpoints
fastify.get('/api/v1/enterprise/workflows', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'workflow_001',
        name: 'Automated Quality Check',
        triggers: ['JOB_COMPLETED'],
        actions: ['SEND_NOTIFICATION', 'UPDATE_STATUS', 'GENERATE_REPORT'],
        status: 'ACTIVE',
        executionCount: 1247,
        lastExecuted: '2024-01-15T16:45:00Z'
      },
      {
        id: 'workflow_002', 
        name: 'Customer Follow-up',
        triggers: ['JOB_DELIVERED'],
        actions: ['SEND_EMAIL', 'SCHEDULE_FEEDBACK'],
        status: 'ACTIVE',
        executionCount: 892,
        lastExecuted: '2024-01-15T14:20:00Z'
      }
    ]
  };
});
// Simple health check
fastify.get('/api/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    features: [
      'Phase 5: Advanced AI Features',
      'Enterprise Integration',
      'Multi-tenant SaaS',
      'Computer Vision Analysis',
      'ML Model Management',
      'Workflow Automation'
    ]
  };
});

// Enhanced auth endpoints
fastify.post('/api/v1/auth/login', async (request, reply) => {
  const { email, _email, password, loginType, adminAccessKey } = request.body as any;
  
  // Handle both email and _email formats for compatibility
  const userEmail = email || _email;
  
  // Mock authentication for development
  if (userEmail && password) {
    // For SaaS Admin, check admin access key
    if (loginType === 'SAAS_ADMIN' && !adminAccessKey) {
      reply.code(400);
      return {
        success: false,
        error: 'Admin Access Key is required for SaaS Admin access'
      };
    }
    
    const user = {
      id: `user_${Date.now()}`,
      email: userEmail,
      role: loginType === 'SAAS_ADMIN' ? 'SAAS_ADMIN' : 
            loginType === 'ORGANIZATION' ? 'ADMIN' : 'customer',
      loginType,
      name: userEmail.split('@')[0]
    };
    
    const token = `jwt_mock_${user.id}`;
    
    return {
      success: true,
      data: {
        user,
        token
      }
    };
  }
  
  reply.code(401);
  return {
    success: false,
    error: 'Invalid email or password'
  };
});

// Registration endpoint for tests
fastify.post('/api/v1/auth/register', async (request, reply) => {
  const { email, _email, password, _firstName, _lastName, _phone, _role } = request.body as any;
  
  // Handle both email and _email formats for compatibility
  const userEmail = email || _email;
  
  if (userEmail && password && (_firstName || _lastName)) {
    const user = {
      id: `user_${Date.now()}`,
      email: userEmail,
      firstName: _firstName,
      lastName: _lastName,
      phone: _phone,
      role: _role || 'customer',
      name: `${_firstName} ${_lastName}`
    };
    
    const token = `jwt_mock_${user.id}`;
    
    return {
      success: true,
      data: {
        user,
        token
      }
    };
  }
  
  reply.code(400);
  return {
    success: false,
    error: 'All required fields must be provided'
  };
});

// SaaS Admin dashboard endpoint
fastify.get('/api/v1/saas-admin/dashboard', async (request, reply) => {
  return {
    success: true,
    data: {
      totalTenants: 145,
      activeTenants: 132,
      platformRevenue: 2456780,
      systemLoad: 0.65,
      apiRequests: 145670,
      uptime: '99.97%'
    }
  };
});

// Business dashboard endpoints
fastify.get('/api/v1/dashboard/metrics', async (request, reply) => {
  return {
    success: true,
    data: {
      revenue: 124580,
      activeJobs: 94,
      urgentJobs: 23,
      technicians: {
        total: 28,
        active: 25
      },
      customerSatisfaction: {
        percentage: 96,
        rating: 4.8
      }
    }
  };
});

// Job management endpoints
fastify.get('/api/v1/jobs', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'job_001',
        status: 'IN_PROGRESS',
        customer: 'John Doe',
        device: 'iPhone 14',
        priority: 'HIGH'
      }
    ]
  };
});

// Device management endpoints
fastify.post('/api/v1/devices', async (request, reply) => {
  const { _brand, brand, model, _serialNumber, category, condition } = request.body as any;
  
  // Handle both _brand and brand formats for compatibility
  const deviceBrand = _brand || brand;
  
  if (!deviceBrand || !model) {
    reply.code(400);
    return {
      success: false,
      error: 'Brand and model are required'
    };
  }
  
  const device = {
    id: `device_${Date.now()}`,
    brand: deviceBrand,
    model,
    serialNumber: _serialNumber,
    category: category || 'ELECTRONICS',
    condition: condition || 'GOOD',
    registeredAt: new Date().toISOString()
  };
  
  return {
    success: true,
    data: device
  };
});

fastify.get('/api/v1/devices', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'device_001',
        brand: 'Apple',
        model: 'iPhone 14',
        category: 'ELECTRONICS',
        condition: 'GOOD'
      },
      {
        id: 'device_002',
        brand: 'Samsung',
        model: 'Galaxy S23',
        category: 'ELECTRONICS',
        condition: 'EXCELLENT'
      }
    ]
  };
});

// Start server
const start = async () => {
  try {
    await registerPlugins();
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('✅ Backend server running on http://localhost:3002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();