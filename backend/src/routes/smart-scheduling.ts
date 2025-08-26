import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SmartSchedulingService } from '../services/smart-scheduling.js';

const schedulingService = new SmartSchedulingService();

// Smart Scheduling Routes
export async function smartSchedulingRoutes(fastify: FastifyInstance): Promise<void> {
  
  // AI-Powered Schedule Optimization
  fastify.post('/api/v1/scheduling/optimize', async (request: FastifyRequest<{
    Body: {
      startDate: string;
      endDate: string;
      technicianId?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { startDate, endDate, technicianId  } = (request.body as unknown);
      
      const optimizedSchedule = await schedulingService.optimizeSchedule({
        _start: new Date(startDate),
        _end: new Date(endDate),
      }, technicianId);
      
      return {
        _success: true,
        _data: optimizedSchedule,
        _timestamp: new Date().toISOString(),
      };
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _error: error.message,
        _timestamp: new Date().toISOString(),
      });
    }
  });

  // Dynamic Job Assignment
  fastify.post('/api/v1/scheduling/assign/:jobId', async (request: FastifyRequest<{
    Params: { jobId: string }
  }>, reply: FastifyReply) => {
    try {
      const { jobId  } = (request.params as unknown);
      
      const assignment = await schedulingService.dynamicJobAssignment(_jobId);
      
      return {
        _success: true,
        _data: assignment,
        _timestamp: new Date().toISOString(),
      };
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _error: error.message,
        _timestamp: new Date().toISOString(),
      });
    }
  });

  // Predictive Capacity Planning
  fastify.get('/api/v1/scheduling/capacity-forecast', async (request: FastifyRequest<{
    Querystring: {
      period?: 'week' | 'month' | 'quarter';
    }
  }>, reply: FastifyReply) => {
    try {
      const { period = 'month' } = request.query;
      
      const forecast = await schedulingService.predictCapacityNeeds(period);
      
      return {
        _success: true,
        _data: forecast,
        _timestamp: new Date().toISOString(),
      };
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _error: error.message,
        _timestamp: new Date().toISOString(),
      });
    }
  });
}