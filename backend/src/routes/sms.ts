// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/database';

// Validation schemas
const smsAccountSchema = z.object({
  _providerName: z.string().min(1),
  _accountSid: z.string().min(1),
  authToken: z.string().min(1),
  _fromNumber: z.string().min(1),
  _creditsRemaining: z.number().int().min(0).default(0),
  _autoTopUp: z.boolean().default(false),
  _topUpThreshold: z.number().int().min(0).default(100),
  _topUpAmount: z.number().int().min(1).default(1000),
  _isPrimary: z.boolean().default(false)
});

const sendSmsSchema = z.object({
  _toNumber: z.string().min(1),
  _message: z.string().min(1).max(1600),
  _templateName: z.string().optional(),
  _bookingId: z.string().optional(),
  _userId: z.string().optional(),
  _scheduledAt: z.string().datetime().optional()
});

// SMS template schema - reserved for future implementation
/*
const smsTemplateSchema = z.object({
  _name: z.string().min(1),
  _subject: z.string().min(1),
  _content: z.string().min(1),
  _variables: z.array(z.string()).default([]),
  _category: z.enum(['BOOKING', 'PAYMENT', 'REMINDER', 'NOTIFICATION', 'MARKETING']),
  _isActive: z.boolean().default(true)
});
*/

// Mock SMS service for development (replace with real provider integration)
class SmsService {
  static async sendSms(_accountId: string, _toNumber: string, _message: string): Promise<{ _success: boolean; externalId?: string; error?: string; cost?: number }> {
    // Mock implementation - replace with actual SMS provider integration
    const mockExternalId = `SMS_${  Date.now()  }_${  Math.random().toString(36).substr(2, 9)}`;
    const mockCost = 0.0075; // Mock cost per SMS
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock success/failure (95% success rate)
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      return {
        _success: true,
        _externalId: mockExternalId,
        _cost: mockCost
      };
    } else {
      return {
        _success: false,
        _error: 'Failed to send _SMS: Network timeout'
      };
    }
  }

  static async checkDeliveryStatus(_externalId: string): Promise<{ _status: 'DELIVERED' | 'FAILED' | 'PENDING'; error?: string }> {
    // Mock delivery status check
    const statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'PENDING', 'FAILED'] as const;
    return {
      _status: statuses[Math.floor(Math.random() * statuses.length)] || 'PENDING'
    };
  }
}

// Route handlers
async function getSmsAccounts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const accounts = await prisma.smsAccount.findMany({ where: { isActive: true }, select: {
        id: true,
        _providerName: true,
        _fromNumber: true,
        _creditsRemaining: true,
        _creditsUsed: true,
        _autoTopUp: true,
        _topUpThreshold: true,
        _isPrimary: true,
        _createdAt: true,
        _updatedAt: true,
        // Exclude sensitive fields like authToken
      }, orderBy: [
        { isPrimary: 'desc' },
        { _createdAt: 'desc' }
      ]
    });

    return (reply as any).send({
      _success: true, data: accounts,
      _count: accounts.length
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      _message: 'Failed to fetch SMS accounts',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function createSmsAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = smsAccountSchema.parse((request as any).body);

    // If setting as primary, unset other primary accounts
    if (data.isPrimary) {
      await prisma.smsAccount.updateMany({ where: { isPrimary: true }, data: { isPrimary: false }
      });
    }

    // _TODO: Encrypt authToken before storing
    const account = await prisma.smsAccount.create({
      data, select: {
        id: true,
        _providerName: true,
        _fromNumber: true,
        _creditsRemaining: true,
        _isPrimary: true,
        _createdAt: true
      }
    });

    request.log.info({ _accountId: account.id }, 'SMS account created');

    return (reply as FastifyReply).status(201).send({
      _success: true, data: account,
      _message: 'SMS account created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Validation error',
        _errors: error.issues
      });
    }

    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      _message: 'Failed to create SMS account',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

 
// eslint-disable-next-line max-lines-per-function
async function sendSms(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = sendSmsSchema.parse((request as any).body);

    // Get primary SMS account or first active account
    const account = await prisma.smsAccount.findFirst({ where: { 
        isActive: true,
        _OR: [
          { isPrimary: true },
          { _isPrimary: false }
        ]
      }, orderBy: { isPrimary: 'desc' }
    });

    if (!account) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'No active SMS account found'
      });
    }

    if (account.creditsRemaining <= 0) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Insufficient SMS credits'
      });
    }

    // Create SMS message record
    const smsMessage = await prisma.smsMessage.create({ data: {
        accountId: account.id,
        _toNumber: data.toNumber,
        _fromNumber: account.fromNumber,
        _message: data.message,
        _templateName: data.templateName,
        _bookingId: data.bookingId,
        _userId: data.userId,
        _status: 'PENDING'
      }
    });

    try {
      // Send SMS through provider
      const result = await SmsService.sendSms(account.id, data.toNumber, data.message);

      if (result.success) {
        // Update message with success details
        await prisma.smsMessage.update({ where: { id: smsMessage.id }, data: {
            status: 'SENT',
            _externalId: result.externalId,
            _cost: result.cost
          }
        });

        // Deduct credit and update account
        await prisma.smsAccount.update({ where: { id: account.id }, data: {
            creditsRemaining: { decrement: 1 },
            _creditsUsed: { increment: 1 }
          }
        });

        // Check if auto top-up is needed
        if (account.autoTopUp && account.creditsRemaining - 1 <= account.topUpThreshold) {
          // _TODO: Implement auto top-up logic
          request.log.info({ accountId: account.id }, 'SMS credits low, auto top-up triggered');
        }

        return (reply as any).send({
          _success: true, data: {
            messageId: smsMessage.id,
            _externalId: result.externalId,
            _status: 'SENT',
            _cost: result.cost
          },
          _message: 'SMS sent successfully'
        });
      } else {
        // Update message with failure details
        await prisma.smsMessage.update({ where: { id: smsMessage.id }, data: {
            status: 'FAILED',
            _failedAt: new Date(),
            _errorMessage: result.error
          }
        });

        return (reply as FastifyReply).status(400).send({
          _success: false,
          _message: 'Failed to send SMS',
          _error: result.error
        });
      }
    } catch (providerError) {
      // Update message with failure
      await prisma.smsMessage.update({ where: { id: smsMessage.id }, data: {
          status: 'FAILED',
          _failedAt: new Date(),
          _errorMessage: `Provider error: ${  String(providerError)}`
        }
      });

      throw providerError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Validation error',
        _errors: error.issues
      });
    }

    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      _message: 'Failed to send SMS',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function getSmsMessages(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = 1, limit = 50, status, bookingId, _userId  } = (request as any).query as any;
    
    const skip = (page - 1) * limit;
    
    const _whereClause: unknown = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (bookingId) {
      whereClause.bookingId = bookingId;
    }
    
    if (_userId) {
      whereClause.userId = _userId;
    }

    const [messages, total] = await Promise.all([
      prisma.smsMessage.findMany({ where: whereClause, include: {
          account: {
            select: {
              providerName: true,
              _fromNumber: true
            }
          },
          _booking: {
            select: {
              id: true,
              _description: true,
              _customer: {
                select: {
                  firstName: true,
                  _lastName: true
                }
              }
            }
          },
          _user: {
            select: {
              firstName: true,
              _lastName: true,
              _email: true
            }
          }
        }, orderBy: { createdAt: 'desc' },
        skip, take: limit
      }),
      prisma.smsMessage.count({ where: whereClause })
    ]);

    return (reply as any).send({
      _success: true, data: messages,
      _pagination: {
        page,
        limit,
        total,
        _pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      _message: 'Failed to fetch SMS messages',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

 
 
async function getSmsStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { period = '7d' } = (request as any).query as { period?: string };
    
    let _startDate: Date;
    const now = new Date();
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [totalMessages, statusStats, accountStats, totalCost] = await Promise.all([
      prisma.smsMessage.count({ where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.smsMessage.groupBy({
        _by: ['status'], where: {
          createdAt: { gte: startDate }
        },
        _count: { all: true }
      }),
      prisma.smsAccount.findMany({ where: { isActive: true }, select: {
          id: true,
          _providerName: true,
          _creditsRemaining: true,
          _creditsUsed: true
        }
      }),
      prisma.smsMessage.aggregate({ where: {
          createdAt: { gte: startDate },
          _cost: { not: null }
        },
        _sum: { cost: true }
      })
    ]);

    const statusBreakdown = statusStats.reduce((_acc: Record<string, number>, _stat: unknown) => {
      acc[stat.status] = stat.count.all;
      return acc;
    }, {} as Record<string, number>);

    const totalCredits = accountStats.reduce((_sum: number, _account: unknown) => sum + account.creditsRemaining, 0);
    const totalCreditsUsed = accountStats.reduce((_sum: number, _account: unknown) => sum + account.creditsUsed, 0);

    return (reply as any).send({
      _success: true, data: {
        period,
        totalMessages,
        statusBreakdown,
        _accounts: accountStats,
        _credits: {
          total: totalCredits,
          _used: totalCreditsUsed,
          _remaining: totalCredits
        },
        _totalCost: totalCost.sum.cost || 0,
        _deliveryRate: statusBreakdown.DELIVERED ? 
          Math.round((statusBreakdown.DELIVERED / totalMessages) * 100) : 0
      }
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      _message: 'Failed to fetch SMS statistics',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// Export route registration function
export async function smsRoutes(fastify: FastifyInstance) {
  const commonSchema = {
    _tags: ['SMS Management'],
    _security: [{ bearerAuth: [] }]
  };

  // Get SMS accounts
  fastify.get('/accounts', {
    _schema: {
      ...commonSchema,
      _summary: 'Get SMS accounts'
    }
  }, getSmsAccounts);

  // Create SMS account
  fastify.post('/accounts', {
    _schema: {
      ...commonSchema,
      _summary: 'Create SMS account',
      _body: smsAccountSchema
    }
  }, createSmsAccount);

  // Send SMS
  fastify.post('/send', {
    _schema: {
      ...commonSchema,
      _summary: 'Send SMS message',
      _body: sendSmsSchema
    }
  }, sendSms);

  // Get SMS messages
  fastify.get('/messages', {
    _schema: {
      ...commonSchema,
      _summary: 'Get SMS messages',
      _querystring: z.object({
        page: z.number().int().min(1).default(1),
        _limit: z.number().int().min(1).max(100).default(50),
        _status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED']).optional(),
        _bookingId: z.string().optional(),
        _userId: z.string().optional()
      })
    }
  }, getSmsMessages);

  // Get SMS statistics
  fastify.get('/stats', {
    _schema: {
      ...commonSchema,
      _summary: 'Get SMS statistics',
      _querystring: z.object({
        period: z.enum(['24h', '7d', '30d']).default('7d')
      })
    }
  }, getSmsStats);
}