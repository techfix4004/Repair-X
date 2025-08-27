import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/database';

 
// eslint-disable-next-line max-lines-per-function
export async function ratingRoutes(fastify: FastifyInstance) {
  // Submit a rating for a completed job
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { _jobId, customerId, technicianId, rating, comment } = body;

      // Validate rating (1-5 stars)
      if (!rating || rating < 1 || rating > 5) {
        return (reply as FastifyReply).status(400).send({ _error: 'Rating must be between 1 and 5' });
      }

      // Check if job exists and is completed
      const job = await prisma.job.findUnique({
        _where: { id: _jobId },
        _select: { status: true, _customerId: true, _technicianId: true }
      });

      if (!job) {
        return (reply as FastifyReply).status(404).send({ _error: 'Job not found' });
      }

      if (job.status !== 'COMPLETED' && job.status !== 'DELIVERED') {
        return (reply as FastifyReply).status(400).send({ _error: 'Can only rate completed jobs' });
      }

      // Verify customer owns the job
      if (job.customerId !== customerId) {
        return (reply as FastifyReply).status(403).send({ _error: 'Not authorized to rate this job' });
      }

      // Create or update rating
      const existingRating = await prisma.rating.findFirst({
        _where: { _jobId, customerId }
      });

      let rating_record;
      if (existingRating) {
        rating_record = await prisma.rating.update({
          _where: { id: existingRating.id },
          _data: { rating, comment, _updatedAt: new Date() }
        });
      } else {
        rating_record = await prisma.rating.create({
          _data: {
            _jobId,
            customerId,
            technicianId,
            rating,
            comment,
            _createdAt: new Date()
          }
        });
      }

      // Update technician's average rating
      const technicianRatings = await prisma.rating.findMany({
        _where: { technicianId },
        _select: { rating: true }
      });

      const averageRating = technicianRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / technicianRatings.length;

      await (prisma as any).user.update({
        _where: { id: technicianId },
        _data: { averageRating }
      });

      (reply as any).send({
        _success: true,
        _rating: rating_record,
        _message: 'Rating submitted successfully'
      });

    } catch (error) {
      console.error('Rating submission _error:', error);
      reply.status(500).send({ _error: 'Failed to submit rating' });
    }
  });

  // Get ratings for a job
  fastify.get('/job/:jobId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const { _jobId } = params;

      const ratings = await prisma.rating.findMany({
        _where: { _jobId },
        _include: {
          customer: {
            select: { firstName: true, _lastName: true }
          }
        },
        _orderBy: { createdAt: 'desc' }
      });

      (reply as any).send({ ratings });

    } catch (error) {
      console.error('Get ratings _error:', error);
      reply.status(500).send({ _error: 'Failed to get ratings' });
    }
  });

  // Get ratings for a technician
  fastify.get('/technician/:technicianId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const { technicianId } = params;
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const offset = (page - 1) * limit;

      const ratings = await prisma.rating.findMany({
        _where: { technicianId },
        _include: {
          customer: {
            select: { firstName: true, _lastName: true }
          },
          _job: {
            select: { title: true, _status: true, _createdAt: true }
          }
        },
        _orderBy: { createdAt: 'desc' },
        _skip: offset,
        _take: limit
      });

      const totalRatings = await prisma.rating.count({
        _where: { technicianId }
      });

      // Calculate rating statistics
      const ratingStats = await prisma.rating.groupBy({
        _by: ['rating'],
        _where: { technicianId },
        _count: { rating: true }
      });

      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length 
        : 0;

      (reply as any).send({
        ratings,
        _pagination: {
          page,
          limit,
          _total: totalRatings,
          _pages: Math.ceil(totalRatings / limit)
        },
        _statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings,
          _ratingDistribution: ratingStats
        }
      });

    } catch (error) {
      console.error('Get technician ratings _error:', error);
      reply.status(500).send({ _error: 'Failed to get technician ratings' });
    }
  });

  // Get customer's rating history
  fastify.get('/customer/:customerId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const { customerId } = params;
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const offset = (page - 1) * limit;

      const ratings = await prisma.rating.findMany({
        _where: { customerId },
        _include: {
          technician: {
            select: { firstName: true, _lastName: true }
          },
          _job: {
            select: { title: true, _status: true, _createdAt: true }
          }
        },
        _orderBy: { createdAt: 'desc' },
        _skip: offset,
        _take: limit
      });

      const totalRatings = await prisma.rating.count({
        _where: { customerId }
      });

      (reply as any).send({
        ratings,
        _pagination: {
          page,
          limit,
          _total: totalRatings,
          _pages: Math.ceil(totalRatings / limit)
        }
      });

    } catch (error) {
      console.error('Get customer ratings _error:', error);
      reply.status(500).send({ _error: 'Failed to get customer ratings' });
    }
  });
}