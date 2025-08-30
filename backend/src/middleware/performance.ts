/**
 * Performance Middleware
 * 
 * Implements production-grade performance optimizations including
 * compression, caching headers, and request timing.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/environment';

export class PerformanceMiddleware {
  private static requestTimes = new Map<string, number>();

  static async register(fastify: FastifyInstance) {
    // Request timing middleware
    fastify.addHook('onRequest', async (request) => {
      const requestId = request.headers['x-request-id'] as string;
      this.requestTimes.set(requestId, Date.now());
    });

    // Response timing and headers
    fastify.addHook('onSend', async (request, reply, payload) => {
      const requestId = request.headers['x-request-id'] as string;
      const startTime = this.requestTimes.get(requestId);
      
      if (startTime) {
        const duration = Date.now() - startTime;
        reply.header('X-Response-Time', `${duration}ms`);
        this.requestTimes.delete(requestId);

        // Log slow requests
        if (duration > 2000) { // 2 seconds threshold
          console.warn('SLOW_REQUEST:', {
            requestId,
            duration,
            method: request.method,
            url: request.url,
            ip: request.ip
          });
        }
      }

      // Add performance headers
      this.addPerformanceHeaders(request, reply);

      return payload;
    });

    // Register compression plugin
    await fastify.register(import('@fastify/compress'), {
      global: true,
      threshold: 1024, // Only compress responses larger than 1KB
      encodings: ['gzip', 'deflate']
    });

    // Register static file serving with caching
    await fastify.register(import('@fastify/static'), {
      root: process.cwd(),
      prefix: '/static/',
      maxAge: env.NODE_ENV === 'production' ? 31536000000 : 0, // 1 year in production
      etag: true,
      lastModified: true
    });
  }

  private static addPerformanceHeaders(request: FastifyRequest, reply: FastifyReply) {
    // Cache control headers
    if (request.url.startsWith('/api/health')) {
      // Health checks should not be cached
      reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      reply.header('Pragma', 'no-cache');
      reply.header('Expires', '0');
    } else if (request.url.startsWith('/static/')) {
      // Static assets can be cached aggressively
      reply.header('Cache-Control', env.NODE_ENV === 'production' 
        ? 'public, max-age=31536000, immutable' 
        : 'no-cache'
      );
    } else if (request.method === 'GET' && request.url.startsWith('/api/')) {
      // API responses can be cached briefly
      reply.header('Cache-Control', 'private, max-age=60');
    } else {
      // Default: no cache for dynamic content
      reply.header('Cache-Control', 'no-cache, private');
    }

    // Add server identification (but not version for security)
    reply.header('Server', 'RepairX-API');

    // Performance hint headers
    if (env.NODE_ENV === 'production') {
      reply.header('X-Powered-By', ''); // Remove default powered-by header for security
    }
  }

  static getPerformanceStats(): {
    activeRequests: number;
    averageResponseTime?: number;
  } {
    return {
      activeRequests: this.requestTimes.size
    };
  }
}

// Request size limiter middleware
export async function requestSizeLimiter(fastify: FastifyInstance) {
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fieldNameSize: 100,
      fieldSize: 1000000, // 1MB
      fields: 20,
      fileSize: 10000000, // 10MB
      files: 5,
      headerPairs: 2000
    }
  });
}

// Graceful shutdown handler
export class GracefulShutdown {
  private static isShuttingDown = false;
  private static activeConnections = new Set<string>();

  static setup(fastify: FastifyInstance) {
    // Track active connections
    fastify.addHook('onRequest', async (request) => {
      const connectionId = `${request.ip}:${Date.now()}:${Math.random()}`;
      this.activeConnections.add(connectionId);
      
      // Store connection ID for cleanup
      (request as any).connectionId = connectionId;
    });

    fastify.addHook('onResponse', async (request) => {
      const connectionId = (request as any).connectionId;
      if (connectionId) {
        this.activeConnections.delete(connectionId);
      }
    });

    // Handle shutdown signals
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      if (this.isShuttingDown) {
        console.log('Already shutting down, forcing exit...');
        process.exit(1);
      }
      
      this.isShuttingDown = true;

      try {
        // Stop accepting new connections
        console.log('Stopping server...');
        await fastify.close();

        // Wait for active connections to finish (with timeout)
        const maxWaitTime = 30000; // 30 seconds
        const startTime = Date.now();
        
        while (this.activeConnections.size > 0 && (Date.now() - startTime) < maxWaitTime) {
          console.log(`Waiting for ${this.activeConnections.size} active connections...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (this.activeConnections.size > 0) {
          console.log(`Force closing ${this.activeConnections.size} remaining connections`);
        }

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('UNCAUGHT_EXCEPTION:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('UNHANDLED_REJECTION:', reason, promise);
      shutdown('UNHANDLED_REJECTION');
    });
  }

  static getStatus() {
    return {
      isShuttingDown: this.isShuttingDown,
      activeConnections: this.activeConnections.size
    };
  }
}