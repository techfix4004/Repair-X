/**
 * Production Database Client - Real Implementation
 * 
 * REPLACES the mock in-memory database with real Prisma-based persistence.
 * This eliminates all Map-based storage and provides true production-ready database access.
 */

import { PrismaClient } from '@prisma/client';

// Database client configuration interface
interface DatabaseConfig {
  logLevel: string[];
  errorFormat: string;
}

// Global database instance
declare global {
  var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Initialize real Prisma database client
console.log('🚀 Initializing production-ready Prisma database client');

// Singleton pattern for database client to prevent connection issues
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
  console.log('🔄 Shutting down database connection...');
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
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

// Initialize database with basic data if empty (production-safe)
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔍 Checking database initialization status...');
    
    // Check if we have any organizations
    const orgCount = await prisma.organization.count();
    
    if (orgCount === 0) {
      console.log('🌱 Initializing empty database with basic structure...');
      
      // Create default organization for development/testing
      const defaultOrg = await prisma.organization.create({
        data: {
          name: 'RepairX Development Organization',
          slug: 'repairx-dev',
          contactEmail: 'dev@repairx.com',
          subscriptionTier: 'ENTERPRISE',
          isActive: true,
          settings: {
            allowPublicRegistration: false,
            requireTechnicianVerification: true,
            autoAssignJobs: true
          }
        }
      });

      console.log(`✅ Created default organization: ${defaultOrg.name} (ID: ${defaultOrg.id})`);
      
      // Create SaaS admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const saasAdmin = await prisma.user.create({
        data: {
          email: 'admin@repairx.com',
          password: hashedPassword,
          firstName: 'SaaS',
          lastName: 'Administrator',
          role: 'SAAS_ADMIN',
          status: 'ACTIVE',
          organizationId: null // SaaS admins are not bound to organizations
        }
      });

      console.log(`✅ Created SaaS admin user: ${saasAdmin.email}`);
      
      console.log('🎉 Database initialization completed successfully');
    } else {
      console.log(`📊 Database already initialized with ${orgCount} organizations`);
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Export the real Prisma client
export { prisma };

// For backward compatibility with existing code expecting the old interface
export const createDatabaseClient = (config?: DatabaseConfig) => {
  console.log('⚠️ Using legacy createDatabaseClient - please update to use prisma directly');
  return prisma;
};

// Alias for the old interface
export type DatabaseClient = PrismaClient;

console.log('✅ Production database client initialized successfully');