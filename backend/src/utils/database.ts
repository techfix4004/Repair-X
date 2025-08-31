
/**
 * Production Database Configuration with PostgreSQL and Redis
 * 
 * Real database client configuration for RepairX production environment.
 * Provides PostgreSQL database operations with Redis caching layer.
 */

import { DatabaseClient, createDatabaseClient } from './real-database-client';
import { redisService } from './redis-client';
import { logger } from './logger';

// Global database instance for production use
declare global {
  var cachedDatabase: DatabaseClient | undefined;
}

let prisma: DatabaseClient;

// Initialize real PostgreSQL + Redis database client - production ready
logger.info('🚀 Initializing production-ready PostgreSQL + Redis database client');

// Singleton pattern for database client to prevent connection issues
if (process.env.NODE_ENV === 'production') {
  prisma = createDatabaseClient({
    logLevel: ['error', 'warn'],
    errorFormat: 'pretty',
  });
} else {
  if (!global.cachedDatabase) {
    global.cachedDatabase = createDatabaseClient({
      logLevel: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.cachedDatabase;
}

// Graceful shutdown handling
const gracefulShutdown = async () => {
  logger.info('🔴 Shutting down database connections...');
  await prisma.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGQUIT', gracefulShutdown);

// Health check function for database connectivity
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const health = await prisma.healthCheck();
    return health.database === 'healthy' && health.redis === 'healthy';
  } catch (error) {
    logger.error('❌ Database health check failed:', error);
    return false;
  }
};

// Database connection test
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.connect();
    
    // Seed production data if needed
    await prisma.seedProductionData();
    
    logger.info('✅ PostgreSQL database connected successfully');
    logger.info('✅ Redis cache layer connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Redis service access
export { redisService };

// Export the database client
export { prisma };
