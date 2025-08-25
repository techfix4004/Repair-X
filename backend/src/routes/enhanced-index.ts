
import { FastifyInstance } from 'fastify';
import { advancedJobManagementRoutes } from './advanced-job-management';
import { qualityAssuranceRoutes } from './quality-assurance';

export async function enhancedRoutes(fastify: FastifyInstance) {
  await fastify.register(advancedJobManagementRoutes, { prefix: '/api/v1' });
  await fastify.register(qualityAssuranceRoutes, { prefix: '/api/v1' });
  
  // Health check for enhanced features
  fastify.get('/api/v1/enhanced/status', async (request, reply: unknown) => {
    return reply.code(200).send({
      success: true,
      data: {
        status: 'operational',
        features: [
          'Advanced Job Management',
          'Six Sigma Quality Assurance', 
          'Enhanced Business Intelligence',
          'AI-Powered Optimization',
          'Real-time Analytics'
        ],
        version: '2.0.0',
        timestamp: new Date().toISOString()
      }
    });
  });
}
