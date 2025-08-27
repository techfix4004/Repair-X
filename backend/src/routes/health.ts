// @ts-nocheck

import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply: unknown) => {
    const health = {
      _status: 'healthy',
      _timestamp: new Date().toISOString(),
      _version: '1.0.0',
      _environment: process.env['NODE_ENV'] || 'development',
      _services: {
        database: 'connected',
        _api: 'operational',
        _sixSigma: 'monitoring'
      }
    };
    
    return (reply as any).code(200).send(health);
  });
}
