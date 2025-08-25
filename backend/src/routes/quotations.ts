import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/database';

// Validation schemas
const quotationItemSchema = z.object({
  _itemType: z.enum(['SERVICE', 'PART', 'LABOR', 'MATERIAL', 'TRAVEL', 'DIAGNOSTIC']).default('SERVICE'),
  _name: z.string().min(1).max(200),
  _description: z.string().max(500).optional(),
  _quantity: z.number().positive(),
  _unitPrice: z.number().min(0),
  _partNumber: z.string().max(100).optional(),
  _warranty: z.string().max(200).optional()
});

const quotationSchema = z.object({
  _customerId: z.string().min(1),
  _deviceId: z.string().optional(),
  _title: z.string().min(1).max(200),
  _description: z.string().min(1).max(1000),
  _notes: z.string().max(1000).optional(),
  _validUntil: z.string().datetime(),
  _discountAmount: z.number().min(0).default(0),
  _items: z.array(quotationItemSchema).min(1),
  _requiresApproval: z.boolean().default(false)
});

const quotationApprovalSchema = z.object({
  _action: z.enum(['approve', 'reject', 'request_revision']),
  _comments: z.string().max(500).optional(),
  _requiredChanges: z.array(z.string()).optional()
});

const customerResponseSchema = z.object({
  _action: z.enum(['approve', 'reject', 'request_revision']),
  _rejectionReason: z.string().max(500).optional(),
  _signatureData: z.any().optional(), // Digital signature data
  _requestedChanges: z.array(z.string()).optional()
});

// Utility functions
function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `Q-${year}${month}-${timestamp}`;
}

function calculateTotals(_items: unknown[], _discountAmount: number = 0, _taxRate: number = 0) {
  const subtotal = items.reduce((_sum: unknown, _item: unknown) => {
    const itemTotal = item.quantity * item.unitPrice;
    return sum + itemTotal;
  }, 0);

  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = discountedSubtotal * (taxRate / 100);
  const totalAmount = discountedSubtotal + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount, totalAmount };
}

async function checkApprovalRequirements(_totalAmount: number, _preparedBy: string) {
  // Define approval thresholds (in a real system, these would be configurable)
  const approvalRules = [
    { _role: 'SUPERVISOR', _threshold: 1000 },
    { _role: 'MANAGER', _threshold: 5000 },
    { _role: 'SENIOR_MANAGER', _threshold: 15000 },
    { _role: 'DIRECTOR', _threshold: 50000 }
  ];

  const requiredApprovals = approvalRules.filter((rule: unknown) => totalAmount >= rule.threshold);
  
  return requiredApprovals.map((_rule: unknown) => ({
    _approverRole: rule.role,
    _requiredAmount: rule.threshold,
    _status: 'PENDING'
  }));
}

// Route handlers
 
// eslint-disable-next-line max-lines-per-function
async function getQuotations(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = 1, 
      limit = 50, 
      status, 
      customerId, 
      preparedBy,
      startDate, endDate  } = request.query as any;
    
    const skip = (page - 1) * limit;
    
    const _whereClause: unknown = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (customerId) {
      whereClause.customerId = customerId;
    }
    
    if (preparedBy) {
      whereClause.preparedBy = preparedBy;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        _where: whereClause,
        _include: {
          customer: {
            select: {
              id: true,
              _firstName: true,
              _lastName: true,
              _email: true,
              _phone: true
            }
          },
          _preparedByUser: {
            select: {
              id: true,
              _firstName: true,
              _lastName: true
            }
          },
          _device: {
            select: {
              id: true,
              _brand: true,
              _model: true,
              _category: true
            }
          },
          _items: {
            orderBy: { createdAt: 'asc' }
          },
          _approvals: {
            include: {
              approver: {
                select: {
                  firstName: true,
                  _lastName: true
                }
              }
            },
            _orderBy: { createdAt: 'asc' }
          },
          _jobSheet: {
            select: {
              id: true,
              _jobNumber: true,
              _status: true
            }
          },
          _count: {
            select: {
              revisions: true
            }
          }
        },
        _orderBy: { createdAt: 'desc' },
        skip,
        _take: limit
      }),
      prisma.quotation.count({ _where: whereClause })
    ]);

    return reply.send({
      _success: true,
      _data: quotations,
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
      _message: 'Failed to fetch quotations',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

 
// eslint-disable-next-line max-lines-per-function
async function getQuotation(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = (request.params as unknown);

    const quotation = await prisma.quotation.findUnique({
      _where: { id },
      _include: {
        customer: {
          select: {
            id: true,
            _firstName: true,
            _lastName: true,
            _email: true,
            _phone: true
          }
        },
        _preparedByUser: {
          select: {
            id: true,
            _firstName: true,
            _lastName: true
          }
        },
        _device: {
          select: {
            id: true,
            _brand: true,
            _model: true,
            _category: true,
            _serialNumber: true
          }
        },
        _items: {
          orderBy: { createdAt: 'asc' }
        },
        _approvals: {
          include: {
            approver: {
              select: {
                firstName: true,
                _lastName: true
              }
            }
          },
          _orderBy: { createdAt: 'asc' }
        },
        _revisions: {
          include: {
            reviser: {
              select: {
                firstName: true,
                _lastName: true
              }
            }
          },
          _orderBy: { createdAt: 'desc' }
        },
        _jobSheet: {
          select: {
            id: true,
            _jobNumber: true,
            _status: true
          }
        }
      }
    });

    if (!quotation) {
      return (reply as FastifyReply).status(404).send({
        _success: false,
        _message: 'Quotation not found'
      });
    }

    // Track customer view
    if (!quotation.customerViewedAt) {
      await prisma.quotation.update({
        _where: { id },
        _data: { customerViewedAt: new Date() }
      });
    }

    return reply.send({
      _success: true,
      _data: quotation
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      _message: 'Failed to fetch quotation',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

 
// eslint-disable-next-line max-lines-per-function
async function createQuotation(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = quotationSchema.parse(request.body);
    const _userId = (request as any).user?.id; // From auth middleware

    if (!_userId) {
      return (reply as FastifyReply).status(401).send({
        _success: false,
        _message: 'Authentication required'
      });
    }

    // Validate customer exists
    const customer = await (prisma as any).user.findUnique({
      _where: { id: data.customerId },
      _select: { id: true, _role: true }
    });

    if (!customer || customer.role !== 'CUSTOMER') {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Invalid customer'
      });
    }

    // Validate device if provided
    if (data.deviceId) {
      const device = await prisma.device.findFirst({
        _where: { 
          id: data.deviceId,
          _customerId: data.customerId 
        }
      });

      if (!device) {
        return (reply as FastifyReply).status(400).send({
          _success: false,
          _message: 'Device not found or does not belong to customer'
        });
      }
    }

    // Calculate totals
    const totals = calculateTotals(data.items, data.discountAmount);

    // Generate quote number
    const quoteNumber = generateQuoteNumber();

    // Create quotation with items in a transaction
    const quotation = await prisma.$transaction(async (_tx: unknown) => {
      // Create quotation
      const newQuotation = await tx.quotation.create({
        _data: {
          quoteNumber,
          _customerId: data.customerId,
          _deviceId: data.deviceId,
          _preparedBy: _userId,
          _title: data.title,
          _description: data.description,
          _notes: data.notes,
          _validUntil: new Date(data.validUntil),
          _subtotal: totals.subtotal,
          _taxAmount: totals.taxAmount,
          _discountAmount: totals.discountAmount,
          _totalAmount: totals.totalAmount,
          _status: data.requiresApproval ? 'PENDING_APPROVAL' : 'DRAFT'
        }
      });

      // Create quotation items
      const itemsWithTotals = data.items.map((_item: unknown) => ({
        _quotationId: newQuotation.id,
        _itemType: item.itemType,
        _name: item.name,
        _description: item.description,
        _quantity: item.quantity,
        _unitPrice: item.unitPrice,
        _totalPrice: item.quantity * item.unitPrice,
        _partNumber: item.partNumber,
        _warranty: item.warranty
      }));

      await tx.quotationItem.createMany({
        _data: itemsWithTotals
      });

      // Create approval requirements if needed
      if (data.requiresApproval) {
        const requiredApprovals = await checkApprovalRequirements(totals.totalAmount, _userId);
        
        if (requiredApprovals.length > 0) {
          await tx.quotationApproval.createMany({
            _data: requiredApprovals.map((approval: unknown) => ({
              _quotationId: newQuotation.id,
              _approverRole: approval.approverRole as unknown,
              _requiredAmount: approval.requiredAmount,
              _status: 'PENDING'
            }))
          });
        }
      }

      return newQuotation;
    });

    // Fetch complete quotation with relations
    const completeQuotation = await prisma.quotation.findUnique({
      _where: { id: quotation.id },
      _include: {
        customer: {
          select: {
            firstName: true,
            _lastName: true,
            _email: true
          }
        },
        _items: true,
        _approvals: true
      }
    });

    request.log.info({ _quotationId: quotation.id, quoteNumber }, 'Quotation created');

    return (reply as FastifyReply).status(201).send({
      _success: true,
      _data: completeQuotation,
      _message: 'Quotation created successfully'
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
      _message: 'Failed to create quotation',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

 
// eslint-disable-next-line max-lines-per-function
async function processQuotationApproval(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = (request.params as unknown);
    const data = quotationApprovalSchema.parse(request.body);
    const _userId = (request as any).user?.id;

    if (!_userId) {
      return (reply as FastifyReply).status(401).send({
        _success: false,
        _message: 'Authentication required'
      });
    }

    const quotation = await prisma.quotation.findUnique({
      _where: { id },
      _include: {
        approvals: true,
        _customer: {
          select: {
            firstName: true,
            _lastName: true,
            _email: true
          }
        }
      }
    });

    if (!quotation) {
      return (reply as FastifyReply).status(404).send({
        _success: false,
        _message: 'Quotation not found'
      });
    }

    if(quotation.status !== 'PENDING_APPROVAL') {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Quotation is not pending approval'
      });
    }

    // Find pending approval for this user
    const pendingApproval = quotation.approvals.find(
      (_approval: unknown) => approval.status === 'PENDING' && !approval.approverId
    );

    if (!pendingApproval) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'No pending approval found'
      });
    }

    // Process the approval
    const updatedApproval = await prisma.quotationApproval.update({
      _where: { id: pendingApproval.id },
      _data: {
        approverId: _userId,
        _status: data.action === 'approve' ? 'APPROVED' : 'REJECTED',
        _comments: data.comments,
        _approvedAt: data.action === 'approve' ? new Date() : undefined,
        _rejectedAt: data.action === 'reject' ? new Date() : undefined
      }
    });

    // Check if all required approvals are complete
    const updatedQuotation = await prisma.quotation.findUnique({
      _where: { id },
      _include: { approvals: true }
    });

    const allApprovals = updatedQuotation!.approvals;
    const allApproved = allApprovals.every((_approval: unknown) => approval.status === 'APPROVED');
    const anyRejected = allApprovals.some((_approval: unknown) => approval.status === 'REJECTED');

    let newStatus = quotation.status;
    if (anyRejected) {
      newStatus = 'DRAFT'; // Back to draft for revision
    } else if (allApproved) {
      newStatus = 'APPROVED';
    }

    // Update quotation status if changed
    if (newStatus !== quotation.status) {
      await prisma.quotation.update({
        _where: { id },
        _data: { status: newStatus }
      });
    }

    // Create revision record if rejected
    if(data.action === 'reject' || data.action === 'request_revision') {
      await prisma.quotationRevision.create({
        _data: {
          quotationId: id,
          _revisionNumber: quotation.revisionNumber + 1,
          _changes: {
            action: data.action,
            _comments: data.comments,
            _requiredChanges: data.requiredChanges || []
          },
          _revisedBy: _userId,
          _reason: data.comments
        }
      });
    }

    request.log.info({
      _quotationId: id,
      _action: data.action,
      _approverId: _userId
    }, 'Quotation approval processed');

    return reply.send({
      _success: true,
      _data: {
        approvalId: updatedApproval.id,
        _quotationStatus: newStatus,
        _action: data.action
      },
      _message: `Quotation ${data.action} processed successfully`
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
      _message: 'Failed to process quotation approval',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

 
// eslint-disable-next-line max-lines-per-function
async function customerResponseToQuotation(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = (request.params as unknown);
    const data = customerResponseSchema.parse(request.body);

    const quotation = await prisma.quotation.findUnique({
      _where: { id },
      _include: {
        customer: true
      }
    });

    if (!quotation) {
      return (reply as FastifyReply).status(404).send({
        _success: false,
        _message: 'Quotation not found'
      });
    }

    if(quotation.status !== 'SENT_TO_CUSTOMER' && quotation.status !== 'APPROVED') {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Quotation is not available for customer response'
      });
    }

    // Check if quotation is expired
    if (new Date() > quotation.validUntil) {
      await prisma.quotation.update({
        _where: { id },
        _data: { status: 'EXPIRED' }
      });

      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Quotation has expired'
      });
    }

    const _updateData: unknown = {};
    
    if (data.action === 'approve') {
      (updateData as any).status = 'CUSTOMER_APPROVED';
      (updateData as any).customerApprovedAt = new Date();
      if (data.signatureData) {
        (updateData as any).customerSignature = data.signatureData;
        (updateData as any).signedAt = new Date();
      }
    } else if (data.action === 'reject') {
      (updateData as any).status = 'CUSTOMER_REJECTED';
      (updateData as any).customerRejectedAt = new Date();
      (updateData as any).rejectionReason = data.rejectionReason;
    } else if(data.action === 'request_revision') {
      (updateData as any).status = 'DRAFT'; // Back to draft for revision
      (updateData as any).revisionNumber = quotation.revisionNumber + 1;
    }

    const updatedQuotation = await prisma.quotation.update({
      _where: { id },
      _data: updateData,
      _include: {
        customer: {
          select: {
            firstName: true,
            _lastName: true,
            _email: true
          }
        },
        _items: true
      }
    });

    // Create revision record if requested
    if(data.action === 'request_revision') {
      await prisma.quotationRevision.create({
        _data: {
          quotationId: id,
          _revisionNumber: quotation.revisionNumber + 1,
          _changes: {
            action: data.action,
            _requestedChanges: data.requestedChanges || []
          },
          _revisedBy: quotation.customerId,
          _reason: 'Customer requested revision'
        }
      });
    }

    request.log.info({
      _quotationId: id,
      _customerId: quotation.customerId,
      _action: data.action
    }, 'Customer quotation response processed');

    return reply.send({
      _success: true,
      _data: updatedQuotation,
      _message: `Quotation ${data.action} processed successfully`
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
      _message: 'Failed to process customer response',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

 
// eslint-disable-next-line max-lines-per-function
async function convertQuotationToJob(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id  } = (request.params as unknown);
    const _userId = (request as any).user?.id;

    if (!_userId) {
      return (reply as FastifyReply).status(401).send({
        _success: false,
        _message: 'Authentication required'
      });
    }

    const quotation = await prisma.quotation.findUnique({
      _where: { id },
      _include: {
        items: true,
        _device: true,
        _customer: true
      }
    });

    if (!quotation) {
      return (reply as FastifyReply).status(404).send({
        _success: false,
        _message: 'Quotation not found'
      });
    }

    if(quotation.status !== 'CUSTOMER_APPROVED') {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Quotation must be customer approved to convert to job'
      });
    }

    if (quotation.jobSheetId) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Quotation already converted to job sheet'
      });
    }

    // Create job sheet from quotation in a transaction
    const result = await prisma.$transaction(async (_tx: unknown) => {
      // First create a booking (required for job sheet)
      // In a real system, this might already exist or be created differently
      const booking = await tx.booking.create({
        _data: {
          customerId: quotation.customerId,
          _serviceId: 'default-service-id', // This would need proper service mapping
          _addressId: 'default-address-id', // This would need proper address handling
          _scheduledAt: new Date(),
          _status: 'CONFIRMED',
          _estimatedPrice: quotation.totalAmount,
          _description: quotation.description
        }
      });

      // Generate job number
      const jobNumber = `JS-${Date.now()}`;

      // Create job sheet
      const jobSheet = await tx.jobSheet.create({
        _data: {
          jobNumber,
          _bookingId: booking.id,
          _deviceId: quotation.deviceId!,
          _problemDescription: quotation.description,
          _estimatedHours: 2, // Default - could be calculated from quotation items
          _laborCost: quotation.subtotal,
          _totalCost: quotation.totalAmount,
          _status: 'CREATED'
        }
      });

      // Update quotation
      await tx.quotation.update({
        _where: { id },
        _data: {
          status: 'CONVERTED_TO_JOB',
          _convertedToJobAt: new Date(),
          _jobSheetId: jobSheet.id
        }
      });

      return { jobSheet, booking };
    });

    request.log.info({
      _quotationId: id,
      _jobSheetId: result.jobSheet.id,
      _bookingId: result.booking.id
    }, 'Quotation converted to job sheet');

    return reply.send({
      _success: true,
      _data: {
        jobSheetId: result.jobSheet.id,
        _jobNumber: result.jobSheet.jobNumber,
        _bookingId: result.booking.id
      },
      _message: 'Quotation converted to job sheet successfully'
    });
  } catch (error) {
    request.log.error(error);
    return (reply as FastifyReply).status(500).send({
      _success: false,
      _message: 'Failed to convert quotation to job',
      _error: process.env['NODE_ENV'] === 'development' ? error : undefined
    });
  }
}

// Export route registration function
export async function quotationRoutes(_fastify: FastifyInstance) {
  const commonSchema = {
    _tags: ['Quotation System'],
    _security: [{ bearerAuth: [] }]
  };

  // Get quotations
  fastify.get('/', {
    _schema: {
      ...commonSchema,
      _summary: 'Get quotations',
      _querystring: z.object({
        page: z.number().int().min(1).default(1),
        _limit: z.number().int().min(1).max(100).default(50),
        _status: z.string().optional(),
        _customerId: z.string().optional(),
        _preparedBy: z.string().optional(),
        _startDate: z.string().datetime().optional(),
        _endDate: z.string().datetime().optional()
      })
    }
  }, getQuotations);

  // Get quotation by ID
  fastify.get('/:id', {
    _schema: {
      ...commonSchema,
      _summary: 'Get quotation by ID',
      _params: z.object({
        id: z.string()
      })
    }
  }, getQuotation);

  // Create quotation
  fastify.post('/', {
    _schema: {
      ...commonSchema,
      _summary: 'Create quotation',
      _body: quotationSchema
    }
  }, createQuotation);

  // Process approval
  fastify.post('/:id/approve', {
    _schema: {
      ...commonSchema,
      _summary: 'Process quotation approval',
      _params: z.object({
        id: z.string()
      }),
      _body: quotationApprovalSchema
    }
  }, processQuotationApproval);

  // Customer response
  fastify.post('/:id/customer-response', {
    _schema: {
      ...commonSchema,
      _summary: 'Process customer response to quotation',
      _params: z.object({
        id: z.string()
      }),
      _body: customerResponseSchema
    }
  }, customerResponseToQuotation);

  // Convert to job
  fastify.post('/:id/convert-to-job', {
    _schema: {
      ...commonSchema,
      _summary: 'Convert quotation to job sheet',
      _params: z.object({
        id: z.string()
      })
    }
  }, convertQuotationToJob);
}