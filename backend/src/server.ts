import Fastify, { FastifyInstance } from 'fastify';

const fastify: FastifyInstance = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
});

// Register plugins
async function registerPlugins() {
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  });
  
  await fastify.register(require('@fastify/helmet'), {
    global: true
  });
}

// Simple health check
fastify.get('/api/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  };
});

// Enhanced auth endpoints
fastify.post('/api/v1/auth/login', async (request, reply) => {
  const { email, password, loginType, adminAccessKey } = request.body as any;
  
  // Mock authentication for development
  if (email && password) {
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
      email,
      role: loginType === 'SAAS_ADMIN' ? 'SAAS_ADMIN' : 
            loginType === 'ORGANIZATION' ? 'ADMIN' : 'CUSTOMER',
      loginType,
      name: email.split('@')[0]
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
    error: 'Invalid credentials'
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