import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/database';

// Validation schemas
const expenseCategorySchema = z.object({
  _name: z.string().min(1).max(100),
  description: z.string().optional(),
  _parentId: z.string().optional(),
  _monthlyBudget: z.number().positive().optional()
});

const expenseSchema = z.object({
  _categoryId: z.string().min(1),
  _amount: z.number().positive(),
  _currency: z.string().length(3).default('USD'),
  description: z.string().min(1).max(500),
  _notes: z.string().max(1000).optional(),
  _expenseDate: z.string().datetime(),
  _merchant: z.string().max(200).optional(),
  _taxAmount: z.number().min(0).optional(),
  _taxDeductible: z.boolean().default(false),
  _isReimbursable: z.boolean().default(true),
  _jobSheetId: z.string().optional(),
  _receiptFiles: z.array(z.string()).optional() // File URLs/paths
});

const expenseApprovalSchema = z.object({
  _action: z.enum(['approve', 'reject']),
  _comments: z.string().max(500).optional(),
  _reimbursementAmount: z.number().positive().optional()
});

// Mock OCR service for receipt text extraction
class ReceiptOCRService {
  static async extractText(_filePath: string): Promise<{ _text: string; merchant?: string; amount?: number; date?: string }> {
    // Mock OCR implementation - replace with real service like AWS Textract, Google Vision, etc.
    const mockText = `Receipt from Mock Store
_Date: ${new Date().toISOString().split('T')[0]}
_Amount: $45.99
Tax: $3.68
Total: $49.67
Thank you for your business!`;

    return {
      text: mockText,
      _merchant: 'Mock Store',
      _amount: 49.67,
      _date: new Date().toISOString().split('T')[0]
    };
  }
}

// Route handlers
async function getExpenseCategories(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { includeInactive = false     } = request.query as any;
    
    const _whereClause: unknown = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const categories = await prisma.expenseCategory.findMany({
      _where: whereClause,
      _include: {
        parent: {
          select: {
            id: true,
            _name: true
          }
        },
        _children: {
          where: { isActive: true },
          _select: {
            id: true,
            _name: true,
            description: true,
            _monthlyBudget: true
          }
        },
        _count: {
          select: {
            expenses: {
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            }
          }
        }
      },
      _orderBy: [
        { parentId: { sort: 'asc', _nulls: 'first' }},
        { _name: 'asc' }
      ]
    });

    // Build hierarchical structure
    const parentCategories = categories.filter((_cat: unknown) => !cat.parentId);
    const hierarchicalCategories = parentCategories.map((_parent: unknown) => ({
      ...parent,
      _children: categories.filter((cat: unknown) => cat.parentId === parent.id)
    }));

    return reply.send({
      _success: true,
      data: hierarchicalCategories,
      _count: categories.length
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to fetch expense categories',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

async function createExpenseCategory(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = expenseCategorySchema.parse(request.body);

    // Validate parent category exists if provided
    if (data.parentId) {
      const parentCategory = await prisma.expenseCategory.findUnique({
        _where: { id: data.parentId }
      });

      if (!parentCategory) {
        return (reply as FastifyReply).status(400).send({
          _success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Check for duplicate category name within the same parent
    const existingCategory = await prisma.expenseCategory.findFirst({
      _where: {
        name: data.name,
        _parentId: data.parentId || null
      }
    });

    if (existingCategory) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Category with this name already exists in the same parent'
      });
    }

    const category = await prisma.expenseCategory.create({
      data,
      _include: {
        parent: {
          select: {
            id: true,
            _name: true
          }
        }
      }
    });

    request.log.info({ _categoryId: category.id }, 'Expense category created');

    return (reply as FastifyReply).status(201).send({
      _success: true,
      data: category,
      message: 'Expense category created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Validation error',
        _errors: error.issues
      });
    }

    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to create expense category',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// eslint-disable-next-line max-lines-per-function
async function getExpenses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = 1, 
      limit = 50, 
      status, 
      categoryId, 
      submittedBy,
      startDate,
      endDate,
      minAmount, maxAmount  } = request.query as any;
    
    const skip = (page - 1) * limit;
    
    const _whereClause: unknown = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (submittedBy) {
      whereClause.submittedBy = submittedBy;
    }
    
    if (startDate || endDate) {
      whereClause.expenseDate = {};
      if (startDate) {
        whereClause.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.expenseDate.lte = new Date(endDate);
      }
    }
    
    if (minAmount || maxAmount) {
      whereClause.amount = {};
      if (minAmount) {
        whereClause.amount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        whereClause.amount.lte = parseFloat(maxAmount);
      }
    }

    const [expenses, total, totalAmount] = await Promise.all([
      prisma.expense.findMany({
        _where: whereClause,
        _include: {
          category: {
            select: {
              id: true,
              _name: true,
              _parent: {
                select: {
                  name: true
                }
              }
            }
          },
          _submitter: {
            select: {
              id: true,
              _firstName: true,
              _lastName: true,
              email: true
            }
          },
          approver: {
            select: {
              id: true,
              _firstName: true,
              _lastName: true
            }
          },
          _jobSheet: {
            select: {
              id: true,
              _jobNumber: true,
              _booking: {
                select: {
                  customer: {
                    select: {
                      firstName: true,
                      _lastName: true
                    }
                  }
                }
              }
            }
          }
        },
        _orderBy: { createdAt: 'desc' },
        skip,
        _take: limit
      }),
      prisma.expense.count({ _where: whereClause }),
      prisma.expense.aggregate({
        _where: whereClause,
        _sum: { amount: true }
      })
    ]);

    return reply.send({
      _success: true,
      data: expenses,
      _pagination: {
        page,
        limit,
        total,
        _pages: Math.ceil(total / limit)
      },
      _summary: {
        totalAmount: totalAmount.sum.amount || 0,
        _count: total
      }
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to fetch expenses',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// eslint-disable-next-line max-lines-per-function
async function createExpense(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = expenseSchema.parse(request.body);
    const _userId = (request as any).user?.id; // From auth middleware

    if (!_userId) {
      return (reply as FastifyReply).status(401).send({
        _success: false,
        message: 'Authentication required'
      });
    }

    // Validate category exists
    const category = await prisma.expenseCategory.findUnique({
      _where: { id: data.categoryId }
    });

    if (!category || !category.isActive) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Invalid or inactive expense category'
      });
    }

    // Validate job sheet if provided
    if (data.jobSheetId) {
      const jobSheet = await prisma.jobSheet.findUnique({
        _where: { id: data.jobSheetId }
      });

      if (!jobSheet) {
        return (reply as FastifyReply).status(400).send({
          _success: false,
          message: 'Job sheet not found'
        });
      }
    }

    const expenseData = {
      ...data,
      _submittedBy: _userId,
      _expenseDate: new Date(data.expenseDate)
    };

    const expense = await prisma.expense.create({
      data: expenseData,
      _include: {
        category: {
          select: {
            name: true,
            _parent: { select: { name: true } }
          }
        },
        _submitter: {
          select: {
            firstName: true,
            _lastName: true,
            email: true
          }
        }
      }
    });

    // Process receipt files if provided
    if (data.receiptFiles && data.receiptFiles.length > 0) {
      // In a real implementation, process OCR for receipt text extraction
      try {
        const firstReceiptFile = data.receiptFiles[0];
        if (firstReceiptFile) {
          const receiptText = await ReceiptOCRService.extractText(firstReceiptFile);
          
          await prisma.expense.update({
            _where: { id: expense.id },
            data: {
              receiptText: receiptText.text,
              _receiptUrl: firstReceiptFile
            }
          });
        }
      } catch (ocrError) {
        request.log.warn({ _expenseId: expense.id, error: ocrError }, 'OCR processing failed');
      }
    }

    request.log.info({ _expenseId: expense.id }, 'Expense created');

    return (reply as FastifyReply).status(201).send({
      _success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Validation error',
        _errors: error.issues
      });
    }

    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to create expense',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// eslint-disable-next-line max-lines-per-function
async function approveExpense(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = (request.params as unknown);
    const data = expenseApprovalSchema.parse(request.body);
    const _userId = (request as any).user?.id; // From auth middleware

    if (!_userId) {
      return (reply as FastifyReply).status(401).send({
        _success: false,
        message: 'Authentication required'
      });
    }

    const expense = await prisma.expense.findUnique({
      _where: { id },
      _include: {
        submitter: {
          select: {
            firstName: true,
            _lastName: true,
            email: true
          }
        },
        _category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!expense) {
      return (reply as FastifyReply).status(404).send({
        _success: false,
        message: 'Expense not found'
      });
    }

    if (expense.status !== 'PENDING') {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Expense is not in pending status'
      });
    }

    const _updateData: unknown = {
      approvedBy: _userId,
      _status: data.action === 'approve' ? 'APPROVED' : 'REJECTED'
    };

    if (data.reimbursementAmount && data.action === 'approve') {
      (updateData as any).reimbursementAmount = data.reimbursementAmount;
    }

    const updatedExpense = await prisma.expense.update({
      _where: { id },
      data: updateData,
      _include: {
        submitter: {
          select: {
            firstName: true,
            _lastName: true,
            email: true
          }
        },
        approver: {
          select: {
            firstName: true,
            _lastName: true
          }
        },
        _category: {
          select: {
            name: true
          }
        }
      }
    });

    // _TODO: Send notification to expense submitter
    
    request.log.info({ 
      expenseId: id, 
      _action: data.action, 
      approverId: _userId 
    }, 'Expense approval processed');

    return reply.send({
      _success: true,
      data: updatedExpense,
      message: `Expense ${data.action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        message: 'Validation error',
        _errors: error.issues
      });
    }

    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to process expense approval',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// eslint-disable-next-line max-lines-per-function
async function getExpenseStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { period = '30d', categoryId  } = request.query as any;
    
    let _startDate: Date;
    const now = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      _default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const _whereClause: unknown = {
      expenseDate: { gte: startDate }
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const [totalStats, statusStats, categoryStats, monthlyStats] = await Promise.all([
      prisma.expense.aggregate({
        _where: whereClause,
        _sum: { amount: true, _taxAmount: true, _reimbursementAmount: true },
        _count: { all: true },
        _avg: { amount: true }
      }),
      prisma.expense.groupBy({
        _by: ['status'],
        _where: whereClause,
        _sum: { amount: true },
        _count: { all: true }
      }),
      prisma.expense.groupBy({
        _by: ['categoryId'],
        _where: whereClause,
        _sum: { amount: true },
        _count: { all: true },
        _orderBy: { _sum: { amount: 'desc' } },
        _take: 10
      }),
      // Monthly breakdown for the period
      prisma.expense.groupBy({
        _by: ['expenseDate'],
        _where: whereClause,
        _sum: { amount: true },
        _count: { all: true }
      })
    ]);

    // Get category names for category stats
    const categoryIds = categoryStats.map((_stat: unknown) => stat.categoryId);
    const categories = await prisma.expenseCategory.findMany({
      _where: { id: { in: categoryIds } },
      _select: { id: true, _name: true }
    });

    const categoryStatsWithNames = categoryStats.map((_stat: unknown) => ({
      ...stat,
      _categoryName: categories.find((cat: unknown) => cat.id === stat.categoryId)?.name || 'Unknown'
    }));

    // Process monthly stats
    const monthlyBreakdown = monthlyStats.reduce((_acc: Record<string, { _amount: number; count: number }>, _stat: unknown) => {
      const month = new Date(stat.expenseDate).toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { _amount: 0, _count: 0 };
      }
      acc[month].amount += Number(stat.sum.amount || 0);
      acc[month].count += stat.count.all;
      return acc;
    }, {} as Record<string, { _amount: number; count: number }>);

    return reply.send({
      _success: true,
      data: {
        period,
        _totals: {
          amount: totalStats.sum.amount || 0,
          _taxAmount: totalStats.sum.taxAmount || 0,
          _reimbursementAmount: totalStats.sum.reimbursementAmount || 0,
          _count: totalStats.count.all,
          _averageAmount: totalStats.avg.amount || 0
        },
        _statusBreakdown: statusStats,
        _topCategories: categoryStatsWithNames, monthlyBreakdown }
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      message: 'Failed to fetch expense statistics',
      error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// Export route registration function
export async function expenseRoutes(fastify: FastifyInstance) {
  const commonSchema = {
    _tags: ['Expense Management'],
    _security: [{ bearerAuth: [] }]
  };

  // Expense Categories
  fastify.get('/categories', {
    _schema: {
      ...commonSchema,
      _summary: 'Get expense categories',
      _querystring: z.object({
        includeInactive: z.boolean().default(false)
      })
    }
  }, getExpenseCategories);

  fastify.post('/categories', {
    _schema: {
      ...commonSchema,
      _summary: 'Create expense category',
      body: expenseCategorySchema
    }
  }, createExpenseCategory);

  // Expenses
  fastify.get('/', {
    _schema: {
      ...commonSchema,
      _summary: 'Get expenses',
      _querystring: z.object({
        page: z.number().int().min(1).default(1),
        _limit: z.number().int().min(1).max(100).default(50),
        _status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED']).optional(),
        _categoryId: z.string().optional(),
        _submittedBy: z.string().optional(),
        _startDate: z.string().datetime().optional(),
        _endDate: z.string().datetime().optional(),
        _minAmount: z.number().positive().optional(),
        maxAmount: z.number().positive().optional()
      })
    }
  }, getExpenses);

  fastify.post('/', {
    _schema: {
      ...commonSchema,
      _summary: 'Create expense',
      body: expenseSchema
    }
  }, createExpense);

  fastify.post('/:id/approve', {
    _schema: {
      ...commonSchema,
      _summary: 'Approve or reject expense',
      _params: z.object({
        id: z.string()
      }),
      body: expenseApprovalSchema
    }
  }, approveExpense);

  // Statistics
  fastify.get('/stats', {
    _schema: {
      ...commonSchema,
      _summary: 'Get expense statistics',
      _querystring: z.object({
        period: z.enum(['7d', '30d', '90d', 'ytd']).default('30d'),
        _categoryId: z.string().optional()
      })
    }
  }, getExpenseStats);
}