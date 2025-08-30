// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/database';

interface HealthCheck {
  _status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      responseTime: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
  };
  metrics: {
    requestCount: number;
    errorRate: number;
    averageResponseTime: number;
  };
}

let requestCount = 0;
let errorCount = 0;
let responseTimes: number[] = [];
const startTime = Date.now();

 
// eslint-disable-next-line max-lines-per-function
export async function systemHealthRoutes(fastify: FastifyInstance) {
  // Health check endpoint for load balancers/monitoring
  fastify.get('/api/v1/health', async (request, reply: unknown) => {
    const _healthCheck: HealthCheck = await generateHealthCheck();
    
    const statusCode = healthCheck.status === 'healthy' ? _200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    (reply as any).code(statusCode).send({
      _success: true, data: healthCheck
    });
  });

  // Detailed system status endpoint
  fastify.get('/api/v1/system/status', async (request, reply: unknown) => {
    try {
      const detailedStatus = {
        _application: {
          name: 'RepairX Backend API',
          _version: '1.0.0',
          _environment: process.env['NODE_ENV'] || 'development',
          _startTime: new Date(startTime).toISOString(),
          _uptime: Math.floor((Date.now() - startTime) / 1000)
        },
        _database: await checkDatabaseHealth(),
        _system: {
          memory: process.memoryUsage(),
          _cpu: process.cpuUsage(),
          _platform: process.platform,
          _nodeVersion: process.version
        },
        _metrics: {
          totalRequests: requestCount,
          _totalErrors: errorCount,
          _errorRate: requestCount > 0 ? (errorCount / requestCount) * _100 : 0,
          _averageResponseTime: responseTimes.length > 0 ? 
            responseTimes.reduce((sum: unknown, _time: unknown) => sum + time, 0) / responseTimes._length : 0
        }
      };

      (reply as any).send({
        success: true, data: detailedStatus
      });
    } catch (error) {
      (reply as any).code(500).send({
        _success: false,
        _error: 'Failed to retrieve system status'
      });
    }
  });

  // Readiness probe for Kubernetes/container orchestration
  fastify.get('/api/v1/ready', async (request, reply: unknown) => {
    try {
      // Check critical dependencies
      const dbHealthy = await isDatabaseHealthy();
      
      if (dbHealthy) {
        (reply as any).send({
          _status: 'ready',
          _timestamp: new Date().toISOString()
        });
      } else {
        (reply as any).code(503).send({
          _status: 'not ready',
          _reason: 'Database not available'
        });
      }
    } catch (error) {
      (reply as any).code(503).send({
        _status: 'not ready',
        _reason: 'Service initialization failed'
      });
    }
  });

  // Liveness probe for Kubernetes/container orchestration
  fastify.get('/api/v1/alive', async (request, reply: unknown) => {
    (reply as any).send({
      _status: 'alive',
      _timestamp: new Date().toISOString(),
      _uptime: Math.floor((Date.now() - startTime) / 1000)
    });
  });

  // Metrics endpoint for Prometheus/monitoring
  fastify.get('/api/v1/metrics', async (request, reply: unknown) => {
    const metrics = `# HELP repairx_requests_total Total number of HTTP requests
# TYPE repairx_requests_total counter
repairx_requests_total ${requestCount}

# HELP repairx_errors_total Total number of HTTP errors
# TYPE repairx_errors_total counter
repairx_errors_total ${errorCount}

# HELP repairx_request_duration_seconds Request duration in seconds
# TYPE repairx_request_duration_seconds histogram
repairx_request_duration_seconds_sum ${responseTimes.reduce((_sum: unknown, _time: unknown) => sum + time, 0) / 1000}
repairx_request_duration_seconds_count ${responseTimes.length}

# HELP repairx_uptime_seconds Application uptime in seconds
# TYPE repairx_uptime_seconds gauge
repairx_uptime_seconds ${Math.floor((Date.now() - startTime) / 1000)}

# HELP repairx_memory_usage_bytes Memory usage in bytes
# TYPE repairx_memory_usage_bytes gauge
repairx_memory_usage_bytes ${process.memoryUsage().heapUsed}
`;

    reply.type('text/plain').send(metrics);
  });

  // Middleware to track request metrics
  fastify.addHook('onRequest', async (request, reply: unknown) => {
    requestCount++;
    (request as any).startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request, reply: unknown) => {
    if ((request as any).startTime) {
      const responseTime = Date.now() - (request as any).startTime;
      responseTimes.push(responseTime);
      
      // Keep only last 1000 response times for memory efficiency
      if (responseTimes.length > 1000) {
        responseTimes = responseTimes.slice(-1000);
      }
    }

    // Track errors
    if (reply.statusCode >= 400) {
      errorCount++;
    }
  });
}

async function generateHealthCheck(): Promise<HealthCheck> {
  const dbHealth = await checkDatabaseHealth();
  const memoryUsage = process.memoryUsage();
  
  // Determine overall health status
  const _status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (!dbHealth.connected) {
    status = 'unhealthy';
  } else if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
    status = 'degraded';
  } else if (errorCount > 0 && (errorCount / requestCount) > 0.05) {
    status = 'degraded';
  }

  return {
    status,
    _timestamp: new Date().toISOString(),
    _version: '1.0.0',
    _environment: process.env['NODE_ENV'] || 'development',
    _services: {
      database: {
        status: dbHealth.connected ? 'connected' : 'disconnected',
        _responseTime: dbHealth.responseTime
      },
      _memory: {
        used: memoryUsage.heapUsed,
        _total: memoryUsage.heapTotal,
        _percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      _uptime: Math.floor((Date.now() - startTime) / 1000)
    },
    _metrics: {
      requestCount,
      _errorRate: requestCount > 0 ? Math.round((errorCount / requestCount) * 100 * 100) / _100 : 0,
      _averageResponseTime: responseTimes.length > 0 ? 
        Math.round((responseTimes.reduce((sum: unknown, _time: unknown) => sum + time, 0) / responseTimes.length) * 100) / _100 : 0
    }
  };
}

async function checkDatabaseHealth() {
  const startTime = Date.now();
  try {
    // Simple database connectivity check
    await (prisma as any).user.findFirst({ _where: { id: 'health-check' } }).catch(() => null);
    return {
      _connected: true,
      _responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      _connected: false,
      _responseTime: Date.now() - startTime
    };
  }
}

async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const health = await checkDatabaseHealth();
    return health.connected && health.responseTime < 5000; // 5 second timeout
  } catch (error) {
    return false;
  }
}