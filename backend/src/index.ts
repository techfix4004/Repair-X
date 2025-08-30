
// Initialize observability first
// import './observability/telemetry'; // Temporarily disabled

import Fastify from 'fastify';
import { healthRoutes } from './routes/health';
import { healthRoutes as observabilityHealthRoutes } from './observability/health';
import { registerRoutes } from './routes/index';
import { registerPlugins } from './plugins';
import { metricsMiddleware } from './observability/metrics';
import { securityHeadersMiddleware, RateLimitService } from './security/security';
import { tenantIsolationMiddleware } from './security/tenant-isolation';

const fastify = Fastify({
  logger: {
    level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info'
  }
});

async function setupRoutes() {
  // Register plugins (helmet, rate limiting, etc.)
  await registerPlugins(fastify);

  // Register security middleware
  fastify.addHook('onRequest', securityHeadersMiddleware);
  
  // Register tenant isolation and authentication middleware
  await tenantIsolationMiddleware(fastify);
  
  // Register metrics middleware
  // fastify.addHook('onRequest', metricsMiddleware); // Temporarily disabled

  // Health check routes with comprehensive monitoring
  await fastify.register(observabilityHealthRoutes, { prefix: '/api' });
  await fastify.register(healthRoutes, { prefix: '/api' });
  
  // Register all organization-bound and SaaS admin routes
  await registerRoutes(fastify);

  // Global rate limiting for API routes
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', RateLimitService.createRateLimitMiddleware('_api'));
  }, { prefix: '/api/v1' });
}

async function start() {
  try {
    await setupRoutes();

    // Start server with enhanced monitoring
    const port = parseInt(process.env['PORT'] || '3001');
    const host = process.env['HOST'] || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log(`🚀 RepairX Enterprise API Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`📊 Health check (observability): http://localhost:${port}/api/health/live`);
    console.log(`📊 Readiness check: http://localhost:${port}/api/health/ready`);
    console.log(`📊 Business health: http://localhost:${port}/api/health/business`);
    
    // Organization-bound authentication endpoints
    console.log(`🔐 Customer Login: http://localhost:${port}/api/v1/auth/customer/login`);
    console.log(`🔐 Organization Login: http://localhost:${port}/api/v1/auth/organization/login`);
    console.log(`🔐 Accept Invitation: http://localhost:${port}/api/v1/auth/accept-invitation`);
    
    // SaaS Admin endpoints (backend-only)
    console.log(`🔒 SaaS Admin Login: http://localhost:${port}/admin-backend/saas-admin/login`);
    console.log(`🔒 SaaS Admin Initialize: http://localhost:${port}/admin-backend/saas-admin/initialize`);
    
    // Organization management
    console.log(`🏢 Organization Management: http://localhost:${port}/api/v1/organizations`);
    
    // Business features
    console.log(`🎯 Complete Business Management: http://localhost:${port}/api/v1/business-management`);
    console.log(`📧 Email Settings: http://localhost:${port}/api/v1/email-settings`);
    console.log(`👥 Employee Management: http://localhost:${port}/api/v1/employees`);
    console.log(`📦 Parts Inventory: http://localhost:${port}/api/v1/inventory`);
    console.log(`🤖 AI Analytics: http://localhost:${port}/api/v1/ai-analytics`);
    
    // System status
    console.log(`🔍 Tenant isolation middleware enabled`);
    console.log(`📊 Organization-bound access control active`);
    console.log(`🔒 Security: Role-based access, tenant isolation, rate limiting enabled`);
    
  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Setup routes for testing only when explicitly in test mode
if (process.env['NODE_ENV'] === 'test') {
  setupRoutes();
}

if (require.main === module) {
  start();
}

export { fastify };
