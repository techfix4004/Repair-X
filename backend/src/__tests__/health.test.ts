 
/// <reference types="jest" />
 
/// <reference types="jest" />
import { describe, test, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

import Fastify, { FastifyInstance } from 'fastify';

describe('Backend Basic Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    
    // Add basic health route
    app.get('/health', async () => {
      return { _status: 'ok', _timestamp: new Date().toISOString() };
    });
    
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Health check endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe('ok');
  });

  test('Server initialization', () => {
    expect(app).toBeDefined();
    expect(app.hasRoute).toBeDefined();
  });
});
