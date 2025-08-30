
/**
 * Production Database Configuration
 * 
 * Real database client configuration for RepairX production environment.
 * Provides database connection management and type-safe database operations.
 * 
 * UPDATED: Now uses real SQLite database instead of mock Map-based storage.
 */

import { prisma, checkDatabaseHealth, initializeDatabase } from './real-database-implementation';

// Export the real database client
export { prisma };

// Export utility functions
export { checkDatabaseHealth, initializeDatabase };

console.log('🚀 Production database module loaded successfully');
