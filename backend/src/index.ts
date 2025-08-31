
// Initialize observability first
// import './observability/telemetry'; // Temporarily disabled

import Fastify from 'fastify';
import { env } from './config/environment';
import { ErrorHandler } from './middleware/error-handler';
import { PerformanceMiddleware, requestSizeLimiter, GracefulShutdown } from './middleware/performance';
import { healthRoutes } from './routes/health';
import { healthRoutes as observabilityHealthRoutes } from './observability/health';
import { registerRoutes } from './routes/index';
import { registerPlugins } from './plugins';
import { metricsMiddleware } from './observability/metrics';
import { securityHeadersMiddleware, RateLimitService } from './security/security';
import { tenantIsolationMiddleware } from './security/tenant-isolation';

const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL
  },
  trustProxy: env.NODE_ENV === 'production'
});

async function setupRoutes() {
  // Register error handling first
  await ErrorHandler.register(fastify);

  // Register performance middleware
  await PerformanceMiddleware.register(fastify);
  await requestSizeLimiter(fastify);

  // Register plugins (helmet, rate limiting, etc.)
  await registerPlugins(fastify);

  // Register security middleware (only if enabled)
  if (env.SECURITY_HEADERS_ENABLED) {
    fastify.addHook('onRequest', securityHeadersMiddleware);
  }
  
  // Register tenant isolation and authentication middleware
  await tenantIsolationMiddleware(fastify);
  
  // Register metrics middleware
  // fastify.addHook('onRequest', metricsMiddleware); // Temporarily disabled

  // Health check routes with comprehensive monitoring
  await fastify.register(observabilityHealthRoutes, { prefix: '/api' });
  await fastify.register(healthRoutes, { prefix: '/api' });
  
  // Register all organization-bound and SaaS admin routes
  await registerRoutes(fastify);

  // Global rate limiting for API routes (only if enabled)
  if (env.RATE_LIMIT_ENABLED) {
    fastify.register(async function (fastify) {
      fastify.addHook('preHandler', RateLimitService.createRateLimitMiddleware('_api'));
    }, { prefix: '/api/v1' });
  }
}

async function start() {
  try {
    console.log(`🚀 Starting RepairX API Server in ${env.NODE_ENV} mode...`);
    
    // Setup graceful shutdown handling
    GracefulShutdown.setup(fastify);
    
    await setupRoutes();

    // Start server with enhanced monitoring
    await fastify.listen({ port: env.PORT, host: env.HOST });
    
    console.log(`🚀 RepairX Enterprise API Server running on port ${env.PORT}`);
    console.log(`📊 Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`📊 Health check (observability): http://localhost:${env.PORT}/api/health/live`);
    console.log(`📊 Readiness check: http://localhost:${env.PORT}/api/health/ready`);
    console.log(`📊 Business health: http://localhost:${env.PORT}/api/health/business`);
    
    // Organization-bound authentication endpoints
    console.log(`🔐 Customer Login: http://localhost:${env.PORT}/api/v1/auth/customer/login`);
    console.log(`🔐 Organization Login: http://localhost:${env.PORT}/api/v1/auth/organization/login`);
    console.log(`🔐 Accept Invitation: http://localhost:${env.PORT}/api/v1/auth/accept-invitation`);
    
    // SaaS Admin endpoints (backend-only)
    console.log(`🔒 SaaS Admin Login: http://localhost:${env.PORT}/admin-backend/saas-admin/login`);
    console.log(`🔒 SaaS Admin Initialize: http://localhost:${env.PORT}/admin-backend/saas-admin/initialize`);
    
    // Organization management
    console.log(`🏢 Organization Management: http://localhost:${env.PORT}/api/v1/organizations`);
    
    // Business features
    console.log(`🎯 Complete Business Management: http://localhost:${env.PORT}/api/v1/business-management`);
    console.log(`📧 Email Settings: http://localhost:${env.PORT}/api/v1/email-settings`);
    console.log(`👥 Employee Management: http://localhost:${env.PORT}/api/v1/employees`);
    console.log(`📦 Parts Inventory: http://localhost:${env.PORT}/api/v1/inventory`);
    console.log(`🤖 AI Analytics: http://localhost:${env.PORT}/api/v1/ai-analytics`);
    
    // System status
    console.log(`🔍 Tenant isolation middleware enabled`);
    console.log(`📊 Organization-bound access control active`);
    
    const securityStatus = env.SECURITY_HEADERS_ENABLED ? 'enabled' : 'disabled';
    const rateLimitStatus = env.RATE_LIMIT_ENABLED ? 'enabled' : 'disabled';
    console.log(`🔒 Security: Security headers ${securityStatus}, rate limiting ${rateLimitStatus}`);
    
    if (env.NODE_ENV === 'production') {
      console.log(`🔐 Production mode: HTTPS enforced, enhanced security active`);
    } else {
      console.log(`🔧 Development mode: Some security features relaxed for development`);
    }
    
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
