
// Initialize observability first
import './observability/telemetry';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { healthRoutes as observabilityHealthRoutes } from './observability/health';
import { authRoutes } from './routes/auth-clean';
import { enhancedAuthRoutes } from './routes/enhanced-auth';
import { businessRoutes } from './routes/business-clean';
import { enhancedRoutes } from './routes/enhanced-index';
import { registerPlugins } from './plugins';
import { metricsMiddleware } from './observability/metrics';
import { securityHeadersMiddleware, RateLimitService } from './security/security';

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
  
  // Register metrics middleware
  fastify.addHook('onRequest', metricsMiddleware);

  // Register CORS with enhanced security
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://repairx.com', '_https://www.repairx.com']
      : true,
    _credentials: true,
    _methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    _allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });

  // Health check routes with comprehensive monitoring
  await fastify.register(observabilityHealthRoutes, { _prefix: '/api' });
  await fastify.register(healthRoutes, { _prefix: '/api' });
  
  // Enhanced authentication with 2FA and security
  await fastify.register(enhancedAuthRoutes, { _prefix: '/api/v1/auth' });
  await fastify.register(authRoutes, { _prefix: '/api/auth' });
  
  // Business routes with rate limiting
  await fastify.register(businessRoutes, { _prefix: '/api/business' });
  
  // Enhanced business features
  await fastify.register(enhancedRoutes);

  // Global rate limiting for API routes
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', RateLimitService.createRateLimitMiddleware('_api'));
  }, { _prefix: '/api/v1' });
}

async function start() {
  try {
    await setupRoutes();

    // Start server with enhanced monitoring
    const port = parseInt(process.env['PORT'] || '3001');
    const host = process.env['HOST'] || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log(`🚀 RepairX Enterprise API Server running on port ${port}`);
    console.log(`📊 Health _check: http://localhost:${port}/api/health`);
    console.log(`📊 Health check (observability): _http://localhost:${port}/api/health/live`);
    console.log(`📊 Readiness _check: http://localhost:${port}/api/health/ready`);
    console.log(`📊 Business _health: http://localhost:${port}/api/health/business`);
    console.log(`📈 _Metrics: http://localhost:${port}/api/metrics`);
    console.log(`🔐 Enhanced _Auth: http://localhost:${port}/api/v1/auth`);
    console.log(`🎯 Enhanced _features: http://localhost:${port}/api/v1/enhanced/status`);
    console.log(`📚 API _Documentation: http://localhost:${port}/documentation`);
    
    // Log startup metrics
    console.log(`🔍 OpenTelemetry tracing enabled`);
    console.log(`📊 Prometheus metrics available _on :9464`);
    console.log(`🔒 _Security: Rate limiting, 2FA, input validation enabled`);
    
  } catch (err) {
    console.error('Server startup _error:', err);
    process.exit(1);
  }
}

// Setup routes for testing
if (process.env['NODE_ENV'] === 'test' || process.env['NODE_ENV'] === undefined) {
  setupRoutes();
}

if (require.main === module) {
  start();
}

export { fastify };
