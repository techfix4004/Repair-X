/**
 * Simple Production Demo Server
 * 
 * A minimal server that demonstrates the production readiness fixes
 * without requiring full database setup
 */

const Fastify = require('fastify');
const cors = require('@fastify/cors');

// Mock data for demo
const categories = [
  { id: '1', name: 'Electronics Repair', description: 'Mobile phones, laptops, tablets' },
  { id: '2', name: 'Appliance Repair', description: 'Refrigerators, washing machines, dryers' },
  { id: '3', name: 'HVAC Services', description: 'Heating, ventilation, and air conditioning' },
  { id: '4', name: 'Plumbing Services', description: 'Pipes, fixtures, water systems' }
];

const integrations = [
  { id: '1', name: 'Google Calendar', status: 'active', description: 'Schedule management' },
  { id: '2', name: 'Stripe Payments', status: 'active', description: 'Payment processing' },
  { id: '3', name: 'Twilio SMS', status: 'active', description: 'Customer notifications' },
  { id: '4', name: 'AWS S3', status: 'inactive', description: 'File storage' }
];

async function createServer() {
  const server = Fastify({
    logger: true,
    trustProxy: true
  });

  // Register CORS
  await server.register(cors, {
    origin: true,
    credentials: true
  });

  // Health check endpoint
  server.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    };
  });

  // API health check with database status
  server.get('/api/health/database', async (request, reply) => {
    return {
      status: 'healthy',
      database: 'connected',
      connection: 'mock',
      timestamp: new Date().toISOString()
    };
  });

  // Service categories endpoint
  server.get('/api/marketplace/categories', async (request, reply) => {
    return categories;
  });

  // Marketplace integrations endpoint
  server.get('/api/marketplace/integrations', async (request, reply) => {
    return integrations;
  });

  // Authentication endpoints
  server.post('/auth/organization/login', async (request, reply) => {
    const { email, password } = request.body || {};
    
    if (!email || !password) {
      return reply.code(400).send({
        error: 'Missing email or password'
      });
    }

    // For demo, reject all login attempts to test error handling
    return reply.code(401).send({
      error: 'Invalid credentials'
    });
  });

  server.post('/auth/customer/login', async (request, reply) => {
    const { emailOrPhone, password } = request.body || {};
    
    if (!emailOrPhone || !password) {
      return reply.code(400).send({
        error: 'Missing emailOrPhone or password'
      });
    }

    // For demo, reject all login attempts to test error handling
    return reply.code(401).send({
      error: 'Invalid credentials'
    });
  });

  // Add security headers
  server.addHook('onSend', async (request, reply, payload) => {
    reply.headers({
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
  });

  // Error handler
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    
    reply.code(statusCode).send({
      error: message,
      statusCode
    });
  });

  // 404 handler
  server.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      statusCode: 404,
      path: request.url
    });
  });

  return server;
}

async function start() {
  try {
    const server = await createServer();
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port: parseInt(port), host });
    console.log(`🚀 RepairX Demo Server running at http://${host}:${port}`);
    console.log(`📊 Health check: http://${host}:${port}/health`);
    console.log(`🔧 API Categories: http://${host}:${port}/api/marketplace/categories`);
    console.log(`⚡ API Integrations: http://${host}:${port}/api/marketplace/integrations`);
    
    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
        await server.close();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if called directly
if (require.main === module) {
  start();
}

module.exports = { createServer, start };