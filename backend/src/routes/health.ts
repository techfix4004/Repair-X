import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply: unknown) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      services: {
        database: 'connected',
        api: 'operational',
        sixSigma: 'monitoring'
      }
    };
    
    return (reply as any).code(200).send(health);
  });
}
