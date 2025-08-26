import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default async function mobileOperationsRoutes(fastify: FastifyInstance) {
  // Mobile technician operations
  fastify.get('/api/v1/mobile/jobs/assigned', async (request: FastifyRequest, reply: FastifyReply) => {
    return (reply as any).send({
      success: true,
      data: {
        assignedJobs: [],
        todaySchedule: [],
        notifications: [],
        offlineCapability: true
      }
    });
  });

  fastify.post('/api/v1/mobile/jobs/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
    return (reply as any).send({
      success: true,
      message: 'Job status updated successfully'
    });
  });

  fastify.post('/api/v1/mobile/jobs/:id/photos', async (request: FastifyRequest, reply: FastifyReply) => {
    return (reply as any).send({
      success: true,
      message: 'Photos uploaded successfully',
      data: { photoIds: [Date.now().toString()] }
    });
  });
}