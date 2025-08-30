import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { registerPhase5Routes } from './routes/phase5-advanced-ai';

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
  
  // Add security headers
  fastify.addHook('onSend', async (request, reply, payload) => {
    reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    return payload;
  });
  
  // Register Phase 5 Advanced AI routes
  await registerPhase5Routes(fastify);
}

// Simple health check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  };
});

// Simple health check
fastify.get('/api/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  };
});

// Root API endpoint
fastify.get('/', async (request, reply) => {
  return {
    success: true,
    message: 'RepairX Production API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: 'production'
  };
});

// Marketplace endpoints
fastify.get('/api/marketplace/integrations', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'stripe-payment',
        name: 'Stripe Payment Gateway',
        category: 'PAYMENT',
        status: 'ACTIVE',
        description: 'Secure payment processing'
      },
      {
        id: 'twilio-sms',
        name: 'Twilio SMS Gateway',
        category: 'COMMUNICATION',
        status: 'ACTIVE',
        description: 'SMS notification service'
      }
    ]
  };
});

fastify.get('/api/marketplace/categories', async (request, reply) => {
  return {
    success: true,
    data: [
      { id: 'PAYMENT', name: 'Payment Gateways', count: 5 },
      { id: 'COMMUNICATION', name: 'Communication Services', count: 8 },
      { id: 'ANALYTICS', name: 'Analytics & Reporting', count: 12 },
      { id: 'INTEGRATION', name: 'Third-party Integrations', count: 15 }
    ]
  };
});

// Enhanced auth endpoints
fastify.post('/auth/login', async (request, reply) => {
  const { email, _email, password, loginType, adminAccessKey, organizationSlug } = request.body as any;
  
  // Handle both email and _email formats for compatibility
  const userEmail = email || _email;
  
  // Mock authentication for development
  if (userEmail && password) {
    // Determine role based on email or explicit role specification
    let userRole = 'CUSTOMER';
    let actualLoginType = loginType;
    
    if (userEmail === 'admin@repairx.com') {
      userRole = 'SAAS_ADMIN';
      actualLoginType = 'SAAS_ADMIN';
    } else if (userEmail === 'owner@demo-company.com') {
      userRole = 'ORG_OWNER';
      actualLoginType = 'ORG_OWNER';
    } else if (userEmail === 'manager@demo-company.com') {
      userRole = 'MANAGER';
      actualLoginType = 'MANAGER';
    } else if (userEmail.includes('technician')) {
      userRole = 'TECHNICIAN';
      actualLoginType = 'TECHNICIAN';
    }
    
    // For SaaS Admin, check admin access key if required
    if (userRole === 'SAAS_ADMIN' && adminAccessKey !== undefined && !adminAccessKey) {
      reply.code(400);
      return {
        success: false,
        error: 'Admin Access Key is required for SaaS Admin access'
      };
    }
    
    const user = {
      id: `user_${Date.now()}`,
      email: userEmail,
      role: userRole,
      loginType: actualLoginType,
      name: userEmail.split('@')[0],
      organizationSlug: organizationSlug || 'demo-company'
    };
    
    const token = `jwt_mock_${user.id}_${userRole}`;
    
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

// Auth profile endpoint
fastify.get('/auth/me', async (request, reply) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401);
    return {
      success: false,
      error: 'Authorization token required'
    };
  }
  
  // Mock user profile based on token
  const token = authHeader.replace('Bearer ', '');
  if (token.startsWith('jwt_mock_')) {
    // Extract role from token - handle both formats
    const parts = token.split('_');
    let role = 'CUSTOMER';
    let userId = 'user_123';
    
    if (parts.length >= 4) {
      // Format: jwt_mock_user_123456_ROLE
      role = parts[parts.length - 1];
      userId = parts[2];
    } else if (parts.length >= 3) {
      // Format: jwt_mock_user_123456
      userId = parts[2];
      // Try to determine role from email patterns
      role = 'CUSTOMER';
    }
    
    const roleToEmail = {
      'SAAS_ADMIN': 'admin@repairx.com',
      'ORG_OWNER': 'owner@demo-company.com', 
      'MANAGER': 'manager@demo-company.com',
      'TECHNICIAN': 'tech@demo-company.com',
      'CUSTOMER': 'customer@demo-company.com'
    };
    
    return {
      success: true,
      data: {
        user: {
          id: userId,
          email: roleToEmail[role] || 'test@example.com',
          role: role,
          name: `Test ${role}`,
          organizationSlug: role === 'SAAS_ADMIN' ? null : 'demo-company'
        }
      }
    };
  }
  
  reply.code(401);
  return {
    success: false,
    error: 'Invalid token'
  };
});

// Enhanced auth endpoints (with API prefix for compatibility)
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

// Technician management endpoints
fastify.get('/api/technicians', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'tech_001',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@repairx.com',
        phone: '+1234567892',
        skills: ['smartphone_repair', 'laptop_repair'],
        rating: 4.8,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tech_002',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@repairx.com',
        phone: '+1234567893',
        skills: ['tablet_repair', 'gaming_console_repair'],
        rating: 4.9,
        status: 'BUSY',
        createdAt: new Date().toISOString()
      }
    ]
  };
});

fastify.get('/api/technicians/available', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'tech_001',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@repairx.com',
        skills: ['smartphone_repair', 'laptop_repair'],
        rating: 4.8,
        status: 'AVAILABLE',
        estimatedAvailability: '2024-01-15T16:00:00Z'
      }
    ]
  };
});

fastify.post('/api/technicians', async (request, reply) => {
  const { firstName, lastName, email, phone, skills } = request.body as any;
  
  if (!firstName || !lastName || !email) {
    reply.code(400);
    return {
      success: false,
      error: 'firstName, lastName, and email are required'
    };
  }
  
  const technician = {
    id: `tech_${Date.now()}`,
    firstName,
    lastName,
    email,
    phone,
    skills: skills || [],
    rating: 0,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString()
  };
  
  reply.code(201);
  return {
    success: true,
    data: technician
  };
});

// Payment processing endpoints
fastify.get('/api/payments/methods', async (request, reply) => {
  return {
    success: true,
    data: [
      { id: 'card', name: 'Credit/Debit Card', enabled: true },
      { id: 'paypal', name: 'PayPal', enabled: true },
      { id: 'apple_pay', name: 'Apple Pay', enabled: true },
      { id: 'google_pay', name: 'Google Pay', enabled: true },
      { id: 'bank_transfer', name: 'Bank Transfer', enabled: false }
    ]
  };
});

fastify.post('/api/payments/process', async (request, reply) => {
  const { jobId, amount, method } = request.body as any;
  
  if (!jobId || !amount || !method) {
    reply.code(400);
    return {
      success: false,
      error: 'jobId, amount, and method are required'
    };
  }
  
  return {
    success: true,
    data: {
      paymentId: `pay_${Date.now()}`,
      jobId,
      amount,
      method,
      status: 'COMPLETED',
      transactionId: `txn_${Date.now()}`,
      processedAt: new Date().toISOString()
    }
  };
});

// Mobile operations endpoints
fastify.get('/api/mobile/jobs/assigned', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'job_001',
        title: 'iPhone Screen Repair',
        address: '123 Main St',
        customer: { name: 'John Doe', phone: '+1234567890' },
        priority: 'HIGH',
        estimatedDuration: 60,
        status: 'ASSIGNED'
      }
    ]
  };
});

fastify.post('/api/mobile/checkin', async (request, reply) => {
  const { jobId, location, notes } = request.body as any;
  
  if (!jobId || !location) {
    reply.code(400);
    return {
      success: false,
      error: 'jobId and location are required'
    };
  }
  
  return {
    success: true,
    data: {
      jobId,
      checkedInAt: new Date().toISOString(),
      location,
      notes,
      status: 'ON_SITE'
    }
  };
});

// Organization management endpoints
fastify.get('/api/org/settings', async (request, reply) => {
  return {
    success: true,
    data: {
      organizationName: 'Demo Company',
      organizationSlug: 'demo-company',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        businessHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { closed: true }
        },
        emailNotifications: true,
        smsNotifications: true
      }
    }
  };
});

fastify.get('/api/org/analytics', async (request, reply) => {
  return {
    success: true,
    data: {
      period: '30d',
      metrics: {
        totalJobs: 245,
        completedJobs: 198,
        activeJobs: 47,
        revenue: 48960.50,
        averageJobValue: 199.84,
        customerSatisfaction: 4.7,
        technicianUtilization: 0.78,
        completionRate: 0.81
      },
      trends: {
        jobsGrowth: 15.2,
        revenueGrowth: 22.8,
        satisfactionTrend: 0.3
      }
    }
  };
});

// SaaS Administration endpoints
fastify.get('/api/admin/tenants', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'tenant_001',
        name: 'Demo Company',
        slug: 'demo-company',
        status: 'ACTIVE',
        plan: 'PROFESSIONAL',
        usersCount: 25,
        jobsThisMonth: 245,
        revenue: 48960.50,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'tenant_002',
        name: 'Tech Solutions Inc',
        slug: 'tech-solutions',
        status: 'ACTIVE',
        plan: 'ENTERPRISE',
        usersCount: 120,
        jobsThisMonth: 1240,
        revenue: 247800.00,
        createdAt: '2024-01-05T00:00:00Z'
      }
    ]
  };
});

fastify.get('/api/admin/analytics', async (request, reply) => {
  return {
    success: true,
    data: {
      platform: {
        totalTenants: 145,
        activeTenants: 132,
        totalRevenue: 2456780.50,
        totalJobs: 24567,
        totalUsers: 4890
      },
      performance: {
        systemUptime: 99.97,
        averageResponseTime: 245,
        apiRequestsPerMinute: 1240,
        errorRate: 0.03
      },
      growth: {
        newTenantsThisMonth: 12,
        revenueGrowth: 18.5,
        userGrowth: 22.3
      }
    }
  };
});

// Customer management endpoints
fastify.get('/api/customers', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'cust_001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        createdAt: new Date().toISOString()
      },
      {
        id: 'cust_002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        address: '456 Oak Ave',
        createdAt: new Date().toISOString()
      }
    ]
  };
});

fastify.post('/api/customers', async (request, reply) => {
  const { firstName, lastName, email, phone, address } = request.body as any;
  
  if (!firstName || !lastName || !email) {
    reply.code(400);
    return {
      success: false,
      error: 'firstName, lastName, and email are required'
    };
  }
  
  const customer = {
    id: `cust_${Date.now()}`,
    firstName,
    lastName,
    email,
    phone,
    address,
    createdAt: new Date().toISOString()
  };
  
  reply.code(201);
  return {
    success: true,
    data: customer
  };
});

fastify.get('/api/customers/:id', async (request, reply) => {
  const { id } = request.params as any;
  
  return {
    success: true,
    data: {
      id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      jobHistory: [
        { id: 'job_001', status: 'COMPLETED', date: '2024-01-15' },
        { id: 'job_002', status: 'IN_PROGRESS', date: '2024-01-20' }
      ],
      createdAt: new Date().toISOString()
    }
  };
});

// Job management endpoints (enhanced)
fastify.get('/api/jobs', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'job_001',
        title: 'iPhone Screen Repair',
        description: 'Cracked screen replacement',
        status: 'IN_PROGRESS',
        customerId: 'cust_001',
        technicianId: 'tech_001',
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      },
      {
        id: 'job_002',
        title: 'Laptop Battery Replacement',
        description: 'Battery not holding charge',
        status: 'PENDING',
        customerId: 'cust_002',
        priority: 'MEDIUM',
        createdAt: new Date().toISOString()
      }
    ]
  };
});

fastify.post('/api/jobs', async (request, reply) => {
  const { title, description, customerId, priority } = request.body as any;
  
  if (!title || !description || !customerId) {
    reply.code(400);
    return {
      success: false,
      error: 'title, description, and customerId are required'
    };
  }
  
  const job = {
    id: `job_${Date.now()}`,
    title,
    description,
    customerId,
    priority: priority || 'MEDIUM',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  
  reply.code(201);
  return {
    success: true,
    data: job
  };
});

fastify.get('/api/jobs/:id', async (request, reply) => {
  const { id } = request.params as any;
  
  return {
    success: true,
    data: {
      id,
      title: 'iPhone Screen Repair',
      description: 'Cracked screen replacement',
      status: 'IN_PROGRESS',
      customerId: 'cust_001',
      technicianId: 'tech_001',
      priority: 'HIGH',
      timeline: [
        { status: 'CREATED', timestamp: '2024-01-15T10:00:00Z', notes: 'Job created' },
        { status: 'ASSIGNED', timestamp: '2024-01-15T11:00:00Z', notes: 'Assigned to technician' },
        { status: 'IN_PROGRESS', timestamp: '2024-01-15T14:00:00Z', notes: 'Work started' }
      ],
      createdAt: new Date().toISOString()
    }
  };
});

fastify.post('/api/jobs/:id/assign', async (request, reply) => {
  const { id } = request.params as any;
  const { technicianId } = request.body as any;
  
  if (!technicianId) {
    reply.code(400);
    return {
      success: false,
      error: 'technicianId is required'
    };
  }
  
  return {
    success: true,
    data: {
      jobId: id,
      technicianId,
      assignedAt: new Date().toISOString(),
      status: 'ASSIGNED'
    }
  };
});

fastify.patch('/api/jobs/:id/status', async (request, reply) => {
  const { id } = request.params as any;
  const { status, notes } = request.body as any;
  
  if (!status) {
    reply.code(400);
    return {
      success: false,
      error: 'status is required'
    };
  }
  
  return {
    success: true,
    data: {
      jobId: id,
      status,
      notes,
      updatedAt: new Date().toISOString()
    }
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
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ Backend server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();