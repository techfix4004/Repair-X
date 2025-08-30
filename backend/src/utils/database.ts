
/**
 * Production Database Configuration
 * 
 * Real database client configuration for RepairX production environment.
 * Provides database connection management and type-safe database operations.
 */

import { DatabaseClient, createDatabaseClient } from './real-database-client';

// Global database instance for production use
declare global {
   
  var cachedDatabase: DatabaseClient | undefined;
}

let prisma: DatabaseClient;

// Initialize real database client - production ready
console.log('🚀 Initializing production-ready database client');

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
  console.log('Shutting down database connection...');
  await prisma.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Health check function for database connectivity
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.testConnection();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database connection test
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Export the database client
export { prisma };
