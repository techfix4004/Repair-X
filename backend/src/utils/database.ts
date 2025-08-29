
/**
 * Production Database Configuration
 * 
 * Prisma database client configuration for RepairX production environment.
 * Provides database connection management and type-safe database operations.
 */

// Try to import real Prisma client, fallback to mock if not available
let PrismaClient: any;
let prisma: any;

try {
  ({ PrismaClient } = require('@prisma/client'));
} catch (error) {
  console.warn('Prisma client not available, using mock client for development');
  ({ PrismaClient } = require('./mock-prisma'));
}

// Global Prisma instance for production use
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: any;
}

// Singleton pattern for Prisma client to prevent connection issues in serverless environments
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  });
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.cachedPrisma;
}

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('Shutting down Prisma connection...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Health check function for database connectivity
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database connection test
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export { prisma };
