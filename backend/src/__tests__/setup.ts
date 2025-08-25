import { jest } from '@jest/globals';

// Mock implementations for production tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock database
jest.mock('../utils/database', () => ({
  mockUsers: [],
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

// Global test configuration
jest.setTimeout(30000);