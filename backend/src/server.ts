import Fastify, { FastifyInstance } from 'fastify';
import { registerPhase5Routes } from './routes/phase5-advanced-ai';

const fastify: FastifyInstance = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
});

// Register plugins
async function registerPlugins() {
  // Register Phase 5 Advanced AI routes
  await registerPhase5Routes(fastify);
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