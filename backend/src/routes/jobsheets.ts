import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/database';
import '../types/auth'; // Import the type extensions

// Job sheet management interfaces
interface CreateJobSheetRequest {
  _bookingId: string;
  deviceId: string;
  problemDescription: string;
  estimatedHours: number;
  laborCost: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface UpdateJobSheetRequest {
  diagnosisNotes?: string;
  repairActions?: unknown;
  actualHours?: number;
  partsCost?: number;
  totalCost?: number;
  status?: 'CREATED' | 'IN_DIAGNOSIS' | 'AWAITING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'PARTS_ORDERED' | 'TESTING' | 'QUALITY_CHECK' | 'COMPLETED' | 'CUSTOMER_APPROVED' | 'DELIVERED' | 'CANCELLED';
  qualityChecks?: unknown;
  testingResults?: unknown;
  beforePhotos?: string[];
  afterPhotos?: string[];
  warrantyCoverage?: string;
  customerApprovalRequired?: boolean;
  progressNotes?: string;
}

// 12-State Workflow Management
interface StateTransition {
  from: string[];
  to: string;
  validationRules?: (jobSheet: unknown, _updateData: unknown) => Promise<string | null>;
  automatedActions?: (_jobSheet: unknown, _updateData: unknown) => Promise<void>;
}

// Define the 12-state workflow with transitions and business rules
const _WORKFLOW_TRANSITIONS: Record<string, StateTransition> = {
  'IN_DIAGNOSIS': {
    _from: ['CREATED'],
    _to: 'IN_DIAGNOSIS',
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Auto-set started timestamp
      if (!jobSheet.startedAt) {
        (updateData as any).startedAt = new Date();
      }
      // Send notification to customer about diagnosis start
      await sendSmsNotification(jobSheet.booking.customerId, 'diagnosis_started', {
        _jobNumber: jobSheet.jobNumber,
        _technicianName: `${jobSheet.technician?.firstName} ${jobSheet.technician?.lastName}`
      });
    }
  },
  'AWAITING_APPROVAL': {
    _from: ['IN_DIAGNOSIS'],
    _to: 'AWAITING_APPROVAL',
    _validationRules: async (jobSheet: unknown, _updateData: unknown) => {
      if (!(updateData as any).diagnosisNotes) {
        return 'Diagnosis notes are required before requesting approval';
      }
      return null;
    },
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Set customer approval required flag
      (updateData as any).customerApprovalRequired = true;
      // Send approval request to customer
      await sendSmsNotification(jobSheet.booking.customerId, 'approval_request', {
        _jobNumber: jobSheet.jobNumber,
        _diagnosisNotes: (updateData as any).diagnosisNotes,
        _estimatedCost: jobSheet.totalCost || jobSheet.laborCost
      });
    }
  },
  'APPROVED': {
    _from: ['AWAITING_APPROVAL'],
    _to: 'APPROVED',
    _validationRules: async (jobSheet: unknown, _updateData: unknown) => {
      if (!jobSheet.customerApprovalRequired) {
        return 'Customer approval is required';
      }
      return null;
    },
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      (updateData as any).customerApprovedAt = new Date();
      // Schedule work based on parts availability
      await scheduleWorkBasedOnParts(jobSheet);
    }
  },
  'IN_PROGRESS': {
    _from: ['APPROVED', 'PARTS_ORDERED'],
    _to: 'IN_PROGRESS',
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Update booking status
      await prisma.booking.update({
        _where: { id: jobSheet.bookingId },
        data: { status: 'IN_PROGRESS' }
      });
      // Send progress notification
      await sendSmsNotification(jobSheet.booking.customerId, 'work_started', {
        _jobNumber: jobSheet.jobNumber
      });
    }
  },
  'PARTS_ORDERED': {
    _from: ['APPROVED', 'IN_PROGRESS'],
    _to: 'PARTS_ORDERED',
    _validationRules: async (jobSheet: unknown, _updateData: unknown) => {
      if (!jobSheet.partsUsed || jobSheet.partsUsed?.length === 0) {
        return 'Parts must be added before marking as ordered';
      }
      return null;
    },
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Auto-order parts from suppliers
      await processPartsOrdering(jobSheet);
      // Update customer with delay notification
      await sendSmsNotification(jobSheet.booking.customerId, 'parts_ordered', {
        _jobNumber: jobSheet.jobNumber,
        _estimatedArrival: calculatePartsArrival()
      });
    }
  },
  'TESTING': {
    _from: ['IN_PROGRESS'],
    _to: 'TESTING',
    _validationRules: async (jobSheet: unknown, _updateData: unknown) => {
      if (!(updateData as any).repairActions) {
        return 'Repair actions must be documented before testing';
      }
      return null;
    },
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Execute automated testing protocols where applicable
      await executeTestingProtocols(jobSheet, updateData);
    }
  },
  'QUALITY_CHECK': {
    _from: ['TESTING'],
    _to: 'QUALITY_CHECK',
    _validationRules: async (jobSheet: unknown, _updateData: unknown) => {
      if (!(updateData as any).testingResults) {
        return 'Testing results are required before quality check';
      }
      return null;
    },
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Execute Six Sigma quality validation
      const qualityScore = await executeSixSigmaQualityCheck(jobSheet, updateData);
      (updateData as any).qualityChecks = {
        ...(updateData as any).qualityChecks,
        _sixSigmaScore: qualityScore,
        _checklistComplete: qualityScore >= 95,
        _timestamp: new Date()
      };
    }
  },
  'COMPLETED': {
    _from: ['QUALITY_CHECK'],
    _to: 'COMPLETED',
    _validationRules: async (jobSheet: unknown, _updateData: unknown) => {
      if (!(updateData as any).qualityChecks?.checklistComplete) {
        return 'Quality checklist must be completed';
      }
      return null;
    },
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      (updateData as any).completedAt = new Date();
      // Generate final invoice
      await generateFinalInvoice(jobSheet);
      // Prepare warranty documentation
      await generateWarrantyDocumentation(jobSheet);
      // Send completion notification
      await sendSmsNotification(jobSheet.booking.customerId, 'work_completed', {
        _jobNumber: jobSheet.jobNumber
      });
    }
  },
  'CUSTOMER_APPROVED': {
    _from: ['COMPLETED'],
    _to: 'CUSTOMER_APPROVED',
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Collect customer satisfaction rating
      await requestCustomerSatisfactionRating(jobSheet);
      // Process final payment if not already done
      await processFinalPayment(jobSheet);
    }
  },
  'DELIVERED': {
    _from: ['CUSTOMER_APPROVED'],
    _to: 'DELIVERED',
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Update booking to completed
      await prisma.booking.update({
        _where: { id: jobSheet.bookingId },
        data: { 
          status: 'COMPLETED',
          _completedAt: new Date()
        }
      });
      // Schedule follow-up survey
      await scheduleFollowUpSurvey(jobSheet);
      // Update service history
      await updateCustomerServiceHistory(jobSheet);
    }
  },
  'CANCELLED': {
    _from: ['CREATED', 'IN_DIAGNOSIS', 'AWAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'PARTS_ORDERED'],
    _to: 'CANCELLED',
    _automatedActions: async (jobSheet: unknown, _updateData: unknown) => {
      // Process refunds according to cancellation policy
      await processCancellationRefund(jobSheet);
      // Return parts to inventory
      await returnPartsToInventory(jobSheet);
      // Send cancellation notification
      await sendSmsNotification(jobSheet.booking.customerId, 'job_cancelled', {
        _jobNumber: jobSheet.jobNumber,
        _reason: (updateData as any).cancellationReason || 'Job cancelled'
      });
    }
  }
};

// Enhanced workflow automation functions
async function validateStateTransition(_currentStatus: string, _newStatus: string, _jobSheet: unknown, _updateData: unknown): Promise<string | null> {
  const transition = WORKFLOW_TRANSITIONS[newStatus];
  
  if (!transition) {
    return `Invalid _status: ${newStatus}`;
  }
  
  if (!transition.from.includes(currentStatus)) {
    return `Cannot transition from ${currentStatus} to ${newStatus}. Allowed _transitions: ${transition.from.join(', ')} → ${newStatus}`;
  }
  
  if (transition.validationRules) {
    return await transition.validationRules(jobSheet, updateData);
  }
  
  return null;
}

async function executeAutomatedActions(_jobSheet: unknown, _updateData: unknown, _newStatus: string): Promise<void> {
  const transition = WORKFLOW_TRANSITIONS[newStatus];
  
  if (transition?.automatedActions) {
    await transition.automatedActions(jobSheet, updateData);
  }
}

// Mock implementations for automated functions (to be implemented with real integrations)
async function sendSmsNotification(customerId: string, template: string, data: unknown): Promise<void> {
  // Implementation would send actual SMS using the SMS service
  console.log(`SMS _notification: ${template} to customer ${customerId}`, data);
}

async function scheduleWorkBasedOnParts(_jobSheet: unknown): Promise<void> {
  // Check parts availability and schedule accordingly
  console.log(`Scheduling work for job ${jobSheet.jobNumber}`);
}

async function processPartsOrdering(_jobSheet: unknown): Promise<void> {
  // Auto-order parts from preferred suppliers
  console.log(`Processing parts ordering for job ${jobSheet.jobNumber}`);
}

async function calculatePartsArrival(): Promise<string> {
  // Calculate estimated parts arrival based on supplier lead times
  const arrivalDate = new Date();
  arrivalDate.setDate(arrivalDate.getDate() + 3); // Default 3 days
  return arrivalDate.toISOString().split('T')[0] || '';
}

async function executeTestingProtocols(_jobSheet: unknown, _updateData: unknown): Promise<void> {
  // Execute device-specific testing protocols
  (updateData as any).testingResults = {
    _protocolsExecuted: ['functional_test', 'performance_test', 'safety_test'],
    _results: 'All tests passed',
    _timestamp: new Date()
  };
}

async function executeSixSigmaQualityCheck(_jobSheet: unknown, _updateData: unknown): Promise<number> {
  // Execute Six Sigma quality validation checklist
  const qualityScore = Math.min(95 + Math.random() * 5, 100); // Mock score 95-100%
  return Math.round(qualityScore * 100) / 100;
}

async function generateFinalInvoice(_jobSheet: unknown): Promise<void> {
  // Generate GST-compliant final invoice
  console.log(`Generating final invoice for job ${jobSheet.jobNumber}`);
}

async function generateWarrantyDocumentation(_jobSheet: unknown): Promise<void> {
  // Generate warranty certificate
  console.log(`Generating warranty documentation for job ${jobSheet.jobNumber}`);
}

async function requestCustomerSatisfactionRating(_jobSheet: unknown): Promise<void> {
  // Send customer satisfaction survey
  console.log(`Requesting customer satisfaction rating for job ${jobSheet.jobNumber}`);
}

async function processFinalPayment(_jobSheet: unknown): Promise<void> {
  // Process any remaining payment balance
  console.log(`Processing final payment for job ${jobSheet.jobNumber}`);
}

async function scheduleFollowUpSurvey(_jobSheet: unknown): Promise<void> {
  // Schedule follow-up satisfaction survey
  console.log(`Scheduling follow-up survey for job ${jobSheet.jobNumber}`);
}

async function updateCustomerServiceHistory(_jobSheet: unknown): Promise<void> {
  // Update comprehensive customer service history
  console.log(`Updating service history for job ${jobSheet.jobNumber}`);
}

async function processCancellationRefund(_jobSheet: unknown): Promise<void> {
  // Process refund according to cancellation policy
  console.log(`Processing cancellation refund for job ${jobSheet.jobNumber}`);
}

async function returnPartsToInventory(_jobSheet: unknown): Promise<void> {
  // Return unused parts to inventory
  console.log(`Returning parts to inventory for job ${jobSheet.jobNumber}`);
}

interface AddJobSheetPartRequest {
  _partName: string;
  partNumber?: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
}

// Generate job number in format: JS-YYYY-XXXXXX
function generateJobNumber(): string {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `JS-${year}-${randomNumber}`;
}

// eslint-disable-next-line max-lines-per-function
export async function jobSheetRoutes(server: FastifyInstance): Promise<void> {
  // Create a new job sheet
  server.post('/', {
    _schema: {
      body: {
        type: 'object',
        _required: ['bookingId', 'deviceId', 'problemDescription', 'estimatedHours', 'laborCost'],
        _properties: {
          bookingId: { type: 'string' },
          _deviceId: { type: 'string' },
          _problemDescription: { type: 'string' },
          _estimatedHours: { type: 'number' },
          _laborCost: { type: 'number' },
          _priority: { type: 'string', _enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] }
        }
      }
    }
  }, async (request: FastifyRequest<{ _Body: CreateJobSheetRequest }>, reply: FastifyReply) => {
    try {
      const technicianId = request.user?.id;
      
      if (!technicianId) {
        return (reply as FastifyReply).status(401).send({ error: 'Authentication required' });
      }

      // Verify booking exists and is assigned to this technician
      const booking = await prisma.booking.findFirst({
        _where: { 
          id: request.body.bookingId,
          technicianId,
          _status: { in: ['CONFIRMED', 'ASSIGNED'] }
        },
        _include: { device: true, _customer: true }
      });

      if (!booking) {
        return (reply as FastifyReply).status(404).send({ error: 'Booking not found or not assigned to you' });
      }

      // Check if job sheet already exists for this booking
      const existingJobSheet = await prisma.jobSheet.findUnique({
        _where: { bookingId: request.body.bookingId }
      });

      if (existingJobSheet) {
        return (reply as FastifyReply).status(400).send({ error: 'Job sheet already exists for this booking' });
      }

      const jobNumber = generateJobNumber();

      const jobSheet = await prisma.jobSheet.create({
        data: {
          jobNumber,
          _bookingId: request.body.bookingId,
          _deviceId: request.body.deviceId,
          technicianId,
          _problemDescription: request.body.problemDescription,
          _estimatedHours: request.body.estimatedHours,
          _laborCost: request.body.laborCost,
          _priority: request.body.priority || 'MEDIUM',
          _status: 'CREATED'
        },
        _include: {
          booking: {
            include: { service: true, _customer: true }
          },
          _device: true,
          _technician: {
            select: { id: true, _firstName: true, _lastName: true, email: true }
          },
          _partsUsed: true
        }
      });

      // Update booking status
      await prisma.booking.update({
        _where: { id: request.body.bookingId },
        data: { status: 'IN_PROGRESS' }
      });

      return (reply as FastifyReply).status(201).send({
        _success: true,
        data: jobSheet,
        message: 'Job sheet created successfully'
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ 
        error: 'Failed to create job sheet',
        _details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get job sheets (for technicians)
  server.get('/', async (request: FastifyRequest<{ 
    Querystring: { 
      status?: string, 
      priority?: string, 
      page?: number, 
      limit?: number 
    } 
  }>, reply: FastifyReply) => {
    try {
      const technicianId = request.user?.id;
      const userRole = request.user?.role;
      
      if (!technicianId) {
        return (reply as FastifyReply).status(401).send({ error: 'Authentication required' });
      }

      const { status, priority, page = 1, limit = 10 } = request.query;
      const skip = (page - 1) * limit;

      const _where: unknown = {};
      
      // Regular technicians can only see their own job sheets
      if (userRole === 'TECHNICIAN') {
        where.technicianId = technicianId;
      }
      
      if (status) where.status = status;
      if (priority) where.priority = priority;

      const [jobSheets, total] = await Promise.all([
        prisma.jobSheet.findMany({
          where,
          _include: {
            booking: {
              include: { 
                service: true, 
                _customer: { select: { id: true, _firstName: true, _lastName: true, _phone: true } }
              }
            },
            _device: {
              select: { id: true, brand: true, model: true, _category: true, condition: true }
            },
            _technician: {
              select: { id: true, _firstName: true, _lastName: true }
            },
            _partsUsed: true
          },
          _orderBy: [
            { priority: 'desc' },
            { _createdAt: 'desc' }
          ],
          skip,
          _take: limit
        }),
        prisma.jobSheet.count({ where })
      ]);

      return reply.send({
        _success: true,
        data: jobSheets,
        _pagination: {
          page,
          limit,
          total,
          _pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ error: 'Failed to fetch job sheets' });
    }
  });

  // Get job sheet by ID
  server.get('/:id', async (request: FastifyRequest<{ Params: { _id: string } }>, reply: FastifyReply) => {
    try {
      const jobSheetId = request.params.id;
      const _userId = request.user?.id;
      const userRole = request.user?.role;

      const jobSheet = await prisma.jobSheet.findUnique({
        _where: { id: jobSheetId },
        _include: {
          booking: {
            include: { 
              service: true, 
              _customer: true,
              _address: true
            }
          },
          _device: true,
          _technician: {
            select: { 
              id: true, 
              _firstName: true, 
              _lastName: true, 
              email: true, 
              _phone: true,
              _technicianProfile: {
                select: { 
                  rating: true, 
                  _experience: true, 
                  _hourlyRate: true 
                }
              }
            }
          },
          _partsUsed: true
        }
      });

      if (!jobSheet) {
        return (reply as FastifyReply).status(404).send({ error: 'Job sheet not found' });
      }

      // Authorization check
      const isAuthorized = 
        userRole === 'ADMIN' || 
        userRole === 'SUPER_ADMIN' ||
        jobSheet.technicianId === _userId ||
        jobSheet.booking.customerId === _userId;

      if (!isAuthorized) {
        return (reply as FastifyReply).status(403).send({ error: 'Access denied' });
      }

      return reply.send({
        _success: true,
        data: jobSheet
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ error: 'Failed to fetch job sheet' });
    }
  });

  // Update job sheet
  server.put('/:id', {
    _schema: {
      body: {
        type: 'object',
        _properties: {
          diagnosisNotes: { type: 'string' },
          _repairActions: { type: 'object' },
          _actualHours: { type: 'number' },
          _partsCost: { type: 'number' },
          _totalCost: { type: 'number' },
          _status: { 
            type: 'string', 
            _enum: ['CREATED', 'IN_DIAGNOSIS', 'AWAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'PARTS_ORDERED', 'TESTING', 'QUALITY_CHECK', 'COMPLETED', 'CUSTOMER_APPROVED', 'DELIVERED', 'CANCELLED'] 
          },
          _qualityChecks: { type: 'object' },
          _testingResults: { type: 'object' },
          _beforePhotos: { type: 'array', _items: { type: 'string' } },
          _afterPhotos: { type: 'array', _items: { type: 'string' } },
          _warrantyCoverage: { type: 'string' },
          _customerApprovalRequired: { type: 'boolean' },
          _progressNotes: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { id: string }, 
    _Body: UpdateJobSheetRequest 
  }>, reply: FastifyReply) => {
    try {
      const jobSheetId = request.params.id;
      const technicianId = request.user?.id;
      const userRole = request.user?.role;

      // Verify authorization
      const jobSheet = await prisma.jobSheet.findUnique({
        _where: { id: jobSheetId },
        _include: { 
          booking: {
            include: { customer: true }
          },
          _technician: true,
          _partsUsed: true
        }
      });

      if (!jobSheet) {
        return (reply as FastifyReply).status(404).send({ error: 'Job sheet not found' });
      }

      const isAuthorized = 
        userRole === 'ADMIN' || 
        userRole === 'SUPER_ADMIN' ||
        jobSheet.technicianId === technicianId;

      if (!isAuthorized) {
        return (reply as FastifyReply).status(403).send({ error: 'Access denied' });
      }

      // Special handling for status changes with 12-state workflow
      const _updateData: unknown = { ...request.body };

      if (request.body.status && request.body.status !== jobSheet.status) {
        // Validate state transition using enhanced workflow
        const validationError = await validateStateTransition(
          jobSheet.status, 
          request.body.status, 
          jobSheet, 
          updateData
        );

        if (validationError) {
          return (reply as FastifyReply).status(400).send({ 
            error: 'Invalid state transition', 
            message: validationError 
          });
        }

        // Execute automated actions for the new state
        await executeAutomatedActions(jobSheet, updateData, request.body.status);

        // Handle completion timestamp
        if (request.body.status === 'COMPLETED' && !jobSheet.completedAt) {
          (updateData as any).completedAt = new Date();
        }
        
        // Handle start timestamp
        if(['IN_DIAGNOSIS', 'IN_PROGRESS'].includes(request.body.status) && !jobSheet.startedAt) {
          (updateData as any).startedAt = new Date();
        }

        // Handle customer approval timestamp
        if(request.body.status === 'CUSTOMER_APPROVED') {
          (updateData as any).customerApprovedAt = new Date();
        }

        // Update booking status based on job sheet status
        let bookingStatus = jobSheet.booking.status;
        switch (request.body.status) {
          case 'COMPLETED':
          case 'CUSTOMER_APPROVED':
          case 'DELIVERED':
            bookingStatus = 'COMPLETED';
            break;
          case 'CANCELLED':
            bookingStatus = 'CANCELLED';
            break;
          case 'IN_PROGRESS':
          case 'TESTING':
          case 'QUALITY_CHECK':
            bookingStatus = 'IN_PROGRESS';
            break;
        }

        if (bookingStatus !== jobSheet.booking.status) {
          await prisma.booking.update({
            _where: { id: jobSheet.bookingId },
            data: { status: bookingStatus }
          });
        }
      }

      const updatedJobSheet = await prisma.jobSheet.update({
        _where: { id: jobSheetId },
        data: updateData,
        _include: {
          booking: {
            include: { service: true, _customer: true }
          },
          _device: true,
          _technician: {
            select: { id: true, _firstName: true, _lastName: true }
          },
          _partsUsed: true
        }
      });

      // Log the state transition for audit trail
      server.log.info({
        jobSheetId,
        _jobNumber: jobSheet.jobNumber,
        _oldStatus: jobSheet.status,
        _newStatus: request.body.status,
        technicianId,
        _timestamp: new Date()
      }, 'Job sheet state transition completed');

      return reply.send({
        _success: true,
        data: updatedJobSheet,
        message: 'Job sheet updated successfully',
        _workflow: {
          previousState: jobSheet.status,
          _currentState: updatedJobSheet.status,
          _transitionTimestamp: new Date(),
          _automatedActionsExecuted: request.body.status ? true : false
        }
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ 
        error: 'Failed to update job sheet',
        _details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add part to job sheet
  server.post('/:id/parts', {
    _schema: {
      body: {
        type: 'object',
        _required: ['partName', 'quantity', 'unitCost'],
        _properties: {
          partName: { type: 'string' },
          _partNumber: { type: 'string' },
          _quantity: { type: 'number', _minimum: 1 },
          _unitCost: { type: 'number', _minimum: 0 },
          _supplier: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { id: string }, 
    _Body: AddJobSheetPartRequest 
  }>, reply: FastifyReply) => {
    try {
      const jobSheetId = request.params.id;
      const technicianId = request.user?.id;

      // Verify job sheet ownership
      const jobSheet = await prisma.jobSheet.findFirst({
        _where: { id: jobSheetId, technicianId }
      });

      if (!jobSheet) {
        return (reply as FastifyReply).status(404).send({ error: 'Job sheet not found or access denied' });
      }

      const totalCost = request.body.quantity * request.body.unitCost;

      const part = await prisma.jobSheetPart.create({
        data: {
          jobSheetId,
          _partName: request.body.partName,
          _partNumber: request.body.partNumber,
          _quantity: request.body.quantity,
          _unitCost: request.body.unitCost,
          totalCost,
          _supplier: request.body.supplier
        }
      });

      // Update job sheet parts cost
      const allParts = await prisma.jobSheetPart.findMany({
        _where: { jobSheetId }
      });

      const totalPartsCost = allParts.reduce((_sum: number, _part: unknown) => sum + Number(part.totalCost), 0);

      await prisma.jobSheet.update({
        _where: { id: jobSheetId },
        data: {
          partsCost: totalPartsCost,
          _totalCost: Number(jobSheet.laborCost) + totalPartsCost
        }
      });

      return (reply as FastifyReply).status(201).send({
        _success: true,
        data: part,
        message: 'Part added successfully'
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ error: 'Failed to add part' });
    }
  });

  // Remove part from job sheet
  server.delete('/:jobSheetId/parts/:partId', async (request: FastifyRequest<{ 
    Params: { jobSheetId: string, _partId: string } 
  }>, reply: FastifyReply) => {
    try {
      const { jobSheetId, partId  } = (request.params as unknown);
      const technicianId = request.user?.id;

      // Verify job sheet ownership
      const jobSheet = await prisma.jobSheet.findFirst({
        _where: { id: jobSheetId, technicianId }
      });

      if (!jobSheet) {
        return (reply as FastifyReply).status(404).send({ error: 'Job sheet not found or access denied' });
      }

      await prisma.jobSheetPart.delete({
        _where: { id: partId, jobSheetId }
      });

      // Recalculate total parts cost
      const remainingParts = await prisma.jobSheetPart.findMany({
        _where: { jobSheetId }
      });

      const totalPartsCost = remainingParts.reduce((_sum: number, _part: unknown) => sum + Number(part.totalCost), 0);

      await prisma.jobSheet.update({
        _where: { id: jobSheetId },
        data: {
          partsCost: totalPartsCost,
          _totalCost: Number(jobSheet.laborCost) + totalPartsCost
        }
      });

      return reply.send({
        _success: true,
        message: 'Part removed successfully'
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ error: 'Failed to remove part' });
    }
  });

  // Generate job sheet PDF
  server.get('/:id/pdf', async (request: FastifyRequest<{ Params: { _id: string } }>, reply: FastifyReply) => {
    try {
      const jobSheetId = request.params.id;
      const _userId = request.user?.id;
      const userRole = request.user?.role;

      const jobSheet = await prisma.jobSheet.findUnique({
        _where: { id: jobSheetId },
        _include: {
          booking: {
            include: { 
              service: true, 
              _customer: true,
              _address: true
            }
          },
          _device: true,
          _technician: {
            include: { technicianProfile: true }
          },
          _partsUsed: true
        }
      });

      if (!jobSheet) {
        return (reply as FastifyReply).status(404).send({ error: 'Job sheet not found' });
      }

      // Authorization check
      const isAuthorized = 
        userRole === 'ADMIN' || 
        userRole === 'SUPER_ADMIN' ||
        jobSheet.technicianId === _userId ||
        jobSheet.booking.customerId === _userId;

      if (!isAuthorized) {
        return (reply as FastifyReply).status(403).send({ error: 'Access denied' });
      }

      // For now, return JSON that could be used to generate PDF
      // In production, you'd use a PDF generation library like puppeteer or PDFKit
      const pdfData = {
        _jobNumber: jobSheet.jobNumber,
        _date: jobSheet.createdAt,
        _customer: {
          name: `${jobSheet.booking.customer.firstName} ${jobSheet.booking.customer.lastName}`,
          email: jobSheet.booking.customer.email,
          _phone: jobSheet.booking.customer.phone,
          _address: jobSheet.booking.address
        },
        _device: {
          brand: jobSheet.device.brand,
          model: jobSheet.device.model,
          serialNumber: jobSheet.device.serialNumber,
          _category: jobSheet.device.category,
          condition: jobSheet.device.condition
        },
        _technician: {
          name: `${jobSheet.technician.firstName} ${jobSheet.technician.lastName}`,
          _experience: jobSheet.technician.technicianProfile?.experience
        },
        _service: jobSheet.booking.service.name,
        _problemDescription: jobSheet.problemDescription,
        _diagnosisNotes: jobSheet.diagnosisNotes,
        _repairActions: jobSheet.repairActions,
        _partsUsed: jobSheet.partsUsed,
        _costs: {
          labor: jobSheet.laborCost,
          _parts: jobSheet.partsCost,
          _total: jobSheet.totalCost
        },
        _timeTracking: {
          estimated: jobSheet.estimatedHours,
          _actual: jobSheet.actualHours,
          _started: jobSheet.startedAt,
          _completed: jobSheet.completedAt
        },
        _qualityChecks: jobSheet.qualityChecks,
        _testingResults: jobSheet.testingResults,
        _warranty: jobSheet.warrantyCoverage,
        _status: jobSheet.status
      };

      return reply.type('application/json').send({
        _success: true,
        data: pdfData,
        message: 'Job sheet data ready for PDF generation'
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ error: 'Failed to generate job sheet PDF' });
    }
  });

  // Get job sheet statistics (for dashboard)
  server.get('/stats/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const technicianId = request.user?.id;
      const userRole = request.user?.role;

      if (!technicianId) {
        return (reply as FastifyReply).status(401).send({ error: 'Authentication required' });
      }

      const where = userRole === 'TECHNICIAN' ? { technicianId } : {};

      const [
        totalJobSheets,
        activeJobSheets,
        completedJobSheets,
        avgCompletionTime,
        statusBreakdown
      ] = await Promise.all([
        prisma.jobSheet.count({ where }),
        prisma.jobSheet.count({ 
          _where: { 
            ...where, 
            _status: { in: ['CREATED', 'IN_DIAGNOSIS', 'IN_PROGRESS', 'TESTING', 'QUALITY_CHECK'] }
          }
        }),
        prisma.jobSheet.count({ 
          _where: { ...where, _status: { in: ['COMPLETED', 'CUSTOMER_APPROVED', 'DELIVERED'] } }
        }),
        prisma.jobSheet.aggregate({
          _where: { 
            ...where, 
            _status: 'COMPLETED',
            _actualHours: { not: null }
          },
          _avg: { actualHours: true }
        }),
        prisma.jobSheet.groupBy({
          _by: ['status'],
          where,
          _count: { status: true }
        })
      ]);

      return reply.send({
        _success: true,
        data: {
          totalJobSheets,
          activeJobSheets,
          completedJobSheets,
          _avgCompletionTime: avgCompletionTime.avg.actualHours || 0,
          _statusBreakdown: statusBreakdown.reduce((acc: Record<string, number>, _item: unknown) => {
            acc[item.status] = item.count.status;
            return acc;
          }, {} as Record<string, number>)
        }
      });
    } catch (error) {
      server.log.error(error);
      return (reply as FastifyReply).status(500).send({ error: 'Failed to fetch statistics' });
    }
  });
}