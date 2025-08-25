import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { businessMetrics, healthMetrics, register, tracer } from './metrics';

// Health check endpoints with comprehensive dependency checking
export async function healthRoutes(fastify: FastifyInstance) {
  // Liveness probe - basic application health
  fastify.get('/health/live', async (request: FastifyRequest, reply: FastifyReply) => {
    const span = tracer.startSpan('health_check_liveness');
    
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      };
      
      healthMetrics.healthStatus.labels('application').set(1);
      span.setAttributes({
        'health.status': 'healthy',
        'health.check': 'liveness'
      });
      
      reply.status(200).send(health);
    } catch (error) {
      healthMetrics.healthStatus.labels('application').set(0);
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Health check failed' });
      
      reply.status(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      span.end();
    }
  });

  // Readiness probe - dependency health check
  fastify.get('/health/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    const span = tracer.startSpan('health_check_readiness');
    
    try {
      const checks = await Promise.allSettled([
        checkDatabase(),
        checkRedis(),
        checkExternalServices()
      ]);
      
      const results = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
          redis: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
          external: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy'
        }
      };
      
      const allHealthy = Object.values(results.checks).every(status => status === 'healthy');
      
      // Update health metrics for each component
      healthMetrics.healthStatus.labels('database').set(results.checks.database === 'healthy' ? 1 : 0);
      healthMetrics.healthStatus.labels('redis').set(results.checks.redis === 'healthy' ? 1 : 0);
      healthMetrics.healthStatus.labels('external_services').set(results.checks.external === 'healthy' ? 1 : 0);
      
      span.setAttributes({
        'health.database': results.checks.database,
        'health.redis': results.checks.redis,
        'health.external': results.checks.external,
        'health.overall': allHealthy ? 'healthy' : 'unhealthy'
      });
      
      reply.status(allHealthy ? 200 : 503).send(results);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Readiness check failed' });
      
      reply.status(500).send({
        status: 'not_ready',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      span.end();
    }
  });

  // Business logic health check
  fastify.get('/health/business', async (request: FastifyRequest, reply: FastifyReply) => {
    const span = tracer.startSpan('health_check_business');
    
    try {
      const businessHealth = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        metrics: {
          activeCustomers: await getActiveCustomersCount(),
          pendingJobs: await getPendingJobsCount(),
          technicianUtilization: await getTechnicianUtilization(),
          systemLoad: await getSystemLoad()
        }
      };
      
      // Business logic validations
      const issues = [];
      if (businessHealth.metrics.technicianUtilization > 95) {
        issues.push('High technician utilization');
      }
      if (businessHealth.metrics.systemLoad > 0.8) {
        issues.push('High system load');
      }
      
      if (issues.length > 0) {
        businessHealth.status = 'degraded';
        (businessHealth as any).issues = issues;
      }
      
      span.setAttributes({
        'business.status': businessHealth.status,
        'business.active_customers': businessHealth.metrics.activeCustomers,
        'business.pending_jobs': businessHealth.metrics.pendingJobs,
        'business.technician_utilization': businessHealth.metrics.technicianUtilization
      });
      
      reply.status(200).send(businessHealth);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Business health check failed' });
      
      reply.status(500).send({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      span.end();
    }
  });

  // Prometheus metrics endpoint
  fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/plain');
    return await register.metrics();
  });
}

// Dependency check functions
async function checkDatabase(): Promise<boolean> {
  try {
    // Simulate database connectivity check
    // In real implementation, this would ping the actual database
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  } catch (error) {
    throw new Error(`Database connection failed: ${error}`);
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    // Simulate Redis connectivity check
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 50);
    });
  } catch (error) {
    throw new Error(`Redis connection failed: ${error}`);
  }
}

async function checkExternalServices(): Promise<boolean> {
  try {
    // Simulate external service checks (payment processor, email service, etc.)
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 200);
    });
  } catch (error) {
    throw new Error(`External services check failed: ${error}`);
  }
}

// Business metrics collection functions
async function getActiveCustomersCount(): Promise<number> {
  // Mock implementation - in real app, query from database
  const count = Math.floor(Math.random() * 1000) + 500;
  businessMetrics.activeCustomers.labels('default').set(count);
  return count;
}

async function getPendingJobsCount(): Promise<number> {
  // Mock implementation
  return Math.floor(Math.random() * 50) + 10;
}

async function getTechnicianUtilization(): Promise<number> {
  // Mock implementation - percentage
  return Math.random() * 100;
}

async function getSystemLoad(): Promise<number> {
  // Mock implementation - load average
  return Math.random();
}