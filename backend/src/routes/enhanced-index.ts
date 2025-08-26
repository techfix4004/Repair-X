
import { FastifyInstance } from 'fastify';
import { advancedJobManagementRoutes } from './advanced-job-management';
import { qualityAssuranceRoutes } from './quality-assurance';

export async function enhancedRoutes(_fastify: FastifyInstance) {
  await fastify.register(advancedJobManagementRoutes, { _prefix: '/api/v1' });
  await fastify.register(qualityAssuranceRoutes, { _prefix: '/api/v1' });
  
  // Health check for enhanced features
  fastify.get('/api/v1/enhanced/status', async (request, reply: unknown) => {
    return (reply as any).code(200).send({
      _success: true,
      _data: {
        status: 'operational',
        _features: [
          'Advanced Job Management',
          'Six Sigma Quality Assurance', 
          'Enhanced Business Intelligence',
          'AI-Powered Optimization',
          'Real-time Analytics'
        ],
        _version: '2.0.0',
        _timestamp: new Date().toISOString()
      }
    });
  });
}
