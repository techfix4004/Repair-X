// Test setup configuration
import { config } from '../src/config/config';

// Set test environment
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://test_user:test_password@localhost:5432/repairx_test_db?schema=public';

// Mock external services in test environment
jest.mock('../src/utils/database', () => ({
  prisma: {
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Global test timeout
jest.setTimeout(30000);