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

      // Check if booking exists and is completed
      const booking = await prisma.booking.findUnique({
        where: { id: _jobId },
        select: { status: true, customerId: true, technicianId: true }
      });

      if (!booking) {
        return (reply as FastifyReply).status(404).send({ _error: 'Booking not found' });
      }

      if (booking.status !== 'COMPLETED' && booking.status !== 'DELIVERED') {
        return (reply as FastifyReply).status(400).send({ _error: 'Can only rate completed jobs' });
      }

      // Verify customer owns the booking
      if (booking.customerId !== customerId) {
        return (reply as FastifyReply).status(403).send({ _error: 'Not authorized to rate this booking' });
      }

      // Create or update review (rating)
      const existingReview = await prisma.review.findFirst({
        where: { bookingId: _jobId, customerId }
      });

      let review_record;
      if (existingReview) {
        review_record = await prisma.review.update({
          where: { id: existingReview.id },
          data: { rating, comment }
        });
      } else {
        review_record = await prisma.review.create({
          data: {
            bookingId: _jobId,
            customerId,
            technicianId,
            rating,
            comment
          }
        });
      }

      // Update technician's average rating
      const technicianReviews = await prisma.review.findMany({
        where: { technicianId },
        select: { rating: true }
      });

      const averageRating = technicianReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / technicianReviews.length;

      await prisma.user.update({
        where: { id: technicianId },
        data: { averageRating }
      });

      (reply as any).send({
        success: true,
        review: review_record,
        message: 'Rating submitted successfully'
      });

    } catch (error) {
      console.error('Rating submission _error:', error);
      reply.status(500).send({ _error: 'Failed to submit rating' });
    }
  });

  // Get reviews for a booking
  fastify.get('/booking/:bookingId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const { bookingId } = params;

      const reviews = await prisma.review.findMany({
        where: { bookingId },
        include: {
          customer: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      (reply as any).send({ reviews });

    } catch (error) {
      console.error('Get reviews error:', error);
      reply.status(500).send({ error: 'Failed to get reviews' });
    }
  });

  // Get reviews for a technician
  fastify.get('/technician/:technicianId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const { technicianId } = params;
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const offset = (page - 1) * limit;

      const reviews = await prisma.review.findMany({
        where: { technicianId },
        include: {
          customer: {
            select: { firstName: true, lastName: true }
          },
          booking: {
            select: { description: true, status: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      const totalReviews = await prisma.review.count({
        where: { technicianId }
      });

      // Calculate rating statistics
      const ratingStats = await prisma.review.groupBy({
        by: ['rating'],
        where: { technicianId },
        _count: { rating: true }
      });

      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
        : 0;

      (reply as any).send({
        reviews,
        pagination: {
          page,
          limit,
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        },
        statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution: ratingStats
        }
      });

    } catch (error) {
      console.error('Get technician reviews error:', error);
      reply.status(500).send({ error: 'Failed to get technician reviews' });
    }
  });

  // Get customer's review history
  fastify.get('/customer/:customerId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const { customerId } = params;
      const query = request.query as any;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const offset = (page - 1) * limit;

      const reviews = await prisma.review.findMany({
        where: { customerId },
        include: {
          technician: {
            select: { firstName: true, lastName: true }
          },
          booking: {
            select: { description: true, status: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      const totalReviews = await prisma.review.count({
        where: { customerId }
      });

      (reply as any).send({
        reviews,
        pagination: {
          page,
          limit,
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        }
      });

    } catch (error) {
      console.error('Get customer reviews error:', error);
      reply.status(500).send({ error: 'Failed to get customer reviews' });
    }
  });
}