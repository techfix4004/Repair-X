// @ts-nocheck
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../utils/database';
import { prisma } from '../utils/database';
import '../types/auth'; // Import the type extensions

// Job sheet management interfaces
interface CreateJobSheetRequest {
  bookingId: string;
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
  validationRules?: (jobSheet: unknown, updateData: unknown) => Promise<string | null>;
  automatedActions?: (jobSheet: unknown, updateData: unknown) => Promise<void>;
}

// Define the 12-state workflow with transitions and business rules
const WORKFLOW_TRANSITIONS: Record<string, StateTransition> = {
  'IN_DIAGNOSIS': {
    from: ['CREATED'],
    to: 'IN_DIAGNOSIS',
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Auto-set started timestamp
      if (!jobSheet.startedAt) {
        updateData.startedAt = new Date();
      }
      // Send notification to customer about diagnosis start
      await sendSmsNotification(jobSheet.booking.customerId, 'diagnosis_started', {
        jobNumber: jobSheet.jobNumber,
        technicianName: `${jobSheet.technician?.firstName} ${jobSheet.technician?.lastName}`
      });
    }
  },
  'AWAITING_APPROVAL': {
    from: ['IN_DIAGNOSIS'],
    to: 'AWAITING_APPROVAL',
    validationRules: async (_jobSheet: any, updateData: any) => {
      if (!updateData.diagnosisNotes) {
        return 'Diagnosis notes are required before requesting approval';
      }
      return null;
    },
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Set customer approval required flag
      updateData.customerApprovalRequired = true;
      // Send approval request to customer
      await sendSmsNotification(jobSheet.booking.customerId, 'approval_request', {
        jobNumber: jobSheet.jobNumber,
        diagnosisNotes: updateData.diagnosisNotes,
        estimatedCost: jobSheet.totalCost || jobSheet.laborCost
      });
    }
  },
  'APPROVED': {
    from: ['AWAITING_APPROVAL'],
    to: 'APPROVED',
    validationRules: async (jobSheet: any, _updateData: any) => {
      if (!jobSheet.customerApprovalRequired) {
        return 'Customer approval is required';
      }
      return null;
    },
    automatedActions: async (jobSheet: any, updateData: any) => {
      updateData.customerApprovedAt = new Date();
      // Schedule work based on parts availability
      await scheduleWorkBasedOnParts(jobSheet);
    }
  },
  'IN_PROGRESS': {
    from: ['APPROVED', 'PARTS_ORDERED'],
    to: 'IN_PROGRESS',
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Update booking status
      await prisma.booking.update({
        where: { id: jobSheet.bookingId },
        data: { status: 'IN_PROGRESS' }
      });
      // Send progress notification
      await sendSmsNotification(jobSheet.booking.customerId, 'work_started', {
        jobNumber: jobSheet.jobNumber
      });
    }
  },
  'PARTS_ORDERED': {
    from: ['APPROVED', 'IN_PROGRESS'],
    to: 'PARTS_ORDERED',
    validationRules: async (jobSheet: any, _updateData: any) => {
      if (!jobSheet.partsUsed || jobSheet.partsUsed?.length === 0) {
        return 'Parts must be added before marking as ordered';
      }
      return null;
    },
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Auto-order parts from suppliers
      await processPartsOrdering(jobSheet);
      // Update customer with delay notification
      await sendSmsNotification(jobSheet.booking.customerId, 'parts_ordered', {
        jobNumber: jobSheet.jobNumber,
        estimatedArrival: await calculatePartsArrival()
      });
    }
  },
  'TESTING': {
    from: ['IN_PROGRESS'],
    to: 'TESTING',
    validationRules: async (_jobSheet: any, updateData: any) => {
      if (!updateData.repairActions) {
        return 'Repair actions must be documented before testing';
      }
      return null;
    },
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Execute automated testing protocols where applicable
      await executeTestingProtocols(jobSheet, updateData);
    }
  },
  'QUALITY_CHECK': {
    from: ['TESTING'],
    to: 'QUALITY_CHECK',
    validationRules: async (_jobSheet: any, updateData: any) => {
      if (!updateData.testingResults) {
        return 'Testing results are required before quality check';
      }
      return null;
    },
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Execute Six Sigma quality validation
      const qualityScore = await executeSixSigmaQualityCheck(jobSheet, updateData);
      updateData.qualityChecks = {
        ...updateData.qualityChecks,
        sixSigmaScore: qualityScore,
        checklistComplete: qualityScore >= 95,
        timestamp: new Date()
      };
    }
  },
  'COMPLETED': {
    from: ['QUALITY_CHECK'],
    to: 'COMPLETED',
    validationRules: async (_jobSheet: any, updateData: any) => {
      if (!updateData.qualityChecks?.checklistComplete) {
        return 'Quality checklist must be completed';
      }
      return null;
    },
    automatedActions: async (jobSheet: any, updateData: any) => {
      updateData.completedAt = new Date();
      // Generate final invoice
      await generateFinalInvoice(jobSheet);
      // Prepare warranty documentation
      await generateWarrantyDocumentation(jobSheet);
      // Send completion notification
      await sendSmsNotification(jobSheet.booking.customerId, 'work_completed', {
        jobNumber: jobSheet.jobNumber
      });
    }
  },
  'CUSTOMER_APPROVED': {
    from: ['COMPLETED'],
    to: 'CUSTOMER_APPROVED',
    automatedActions: async (jobSheet: any, _updateData: any) => {
      // Collect customer satisfaction rating
      await requestCustomerSatisfactionRating(jobSheet);
      // Process final payment if not already done
      await processFinalPayment(jobSheet);
    }
  },
  'DELIVERED': {
    from: ['CUSTOMER_APPROVED'],
    to: 'DELIVERED',
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Update booking to completed
      await prisma.booking.update({
        where: { id: jobSheet.bookingId },
        data: { 
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
      // Schedule follow-up survey
      await scheduleFollowUpSurvey(jobSheet);
      // Update service history
      await updateCustomerServiceHistory(jobSheet);
    }
  },
  'CANCELLED': {
    from: ['CREATED', 'IN_DIAGNOSIS', 'AWAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'PARTS_ORDERED'],
    to: 'CANCELLED',
    automatedActions: async (jobSheet: any, updateData: any) => {
      // Process refunds according to cancellation policy
      await processCancellationRefund(jobSheet);
      // Return parts to inventory
      await returnPartsToInventory(jobSheet);
      // Send cancellation notification
      await sendSmsNotification(jobSheet.booking.customerId, 'job_cancelled', {
        jobNumber: jobSheet.jobNumber,
        reason: updateData.cancellationReason || 'Job cancelled'
      });
    }
  }
};

// Enhanced workflow automation functions
async function validateStateTransition(currentStatus: string, newStatus: string, jobSheet: any, updateData: any): Promise<string | null> {
  const transition = WORKFLOW_TRANSITIONS[newStatus];
  
  if (!transition) {
    return `Invalid status: ${newStatus}`;
  }
  
  if (!transition.from.includes(currentStatus)) {
    return `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${transition.from.join(', ')} → ${newStatus}`;
  }
  
  if (transition.validationRules) {
    return await transition.validationRules(jobSheet, updateData);
  }
  
  return null;
}

async function executeAutomatedActions(jobSheet: any, updateData: any, newStatus: string): Promise<void> {
  const transition = WORKFLOW_TRANSITIONS[newStatus];
  
  if (transition?.automatedActions) {
    await transition.automatedActions(jobSheet, updateData);
  }
}

// Mock implementations for automated functions (to be implemented with real integrations)
async function sendSmsNotification(customerId: string, template: string, data: any): Promise<void> {
  // Implementation would send actual SMS using the SMS service
  console.log(`SMS notification: ${template} to customer ${customerId}`, data);
}

async function scheduleWorkBasedOnParts(jobSheet: any): Promise<void> {
  // Check parts availability and schedule accordingly
  console.log(`Scheduling work for job ${jobSheet.jobNumber}`);
}

async function processPartsOrdering(jobSheet: any): Promise<void> {
  // Auto-order parts from preferred suppliers
  console.log(`Processing parts ordering for job ${jobSheet.jobNumber}`);
}

async function calculatePartsArrival(): Promise<string> {
  // Calculate estimated parts arrival based on supplier lead times
  const arrivalDate = new Date();
  arrivalDate.setDate(arrivalDate.getDate() + 3); // Default 3 days
  return arrivalDate.toISOString().split('T')[0] || '';
}

async function executeTestingProtocols(jobSheet: any, updateData: any): Promise<void> {
  // Execute device-specific testing protocols
  updateData.testingResults = {
    protocolsExecuted: ['functional_test', 'performance_test', 'safety_test'],
    results: 'All tests passed',
    timestamp: new Date()
  };
}

async function executeSixSigmaQualityCheck(jobSheet: any, updateData: any): Promise<number> {
  // Execute Six Sigma quality validation checklist
  const qualityScore = Math.min(95 + Math.random() * 5, 100); // Mock score 95-100%
  return Math.round(qualityScore * 100) / 100;
}

async function generateFinalInvoice(jobSheet: any): Promise<void> {
  // Generate GST-compliant final invoice
  console.log(`Generating final invoice for job ${jobSheet.jobNumber}`);
}

async function generateWarrantyDocumentation(jobSheet: any): Promise<void> {
  // Generate warranty certificate
  console.log(`Generating warranty documentation for job ${jobSheet.jobNumber}`);
}

async function requestCustomerSatisfactionRating(jobSheet: any): Promise<void> {
  // Send customer satisfaction survey
  console.log(`Requesting customer satisfaction rating for job ${jobSheet.jobNumber}`);
}

async function processFinalPayment(jobSheet: any): Promise<void> {
  // Process any remaining payment balance
  console.log(`Processing final payment for job ${jobSheet.jobNumber}`);
}

async function scheduleFollowUpSurvey(jobSheet: any): Promise<void> {
  // Schedule follow-up satisfaction survey
  console.log(`Scheduling follow-up survey for job ${jobSheet.jobNumber}`);
}

async function updateCustomerServiceHistory(jobSheet: any): Promise<void> {
  // Update comprehensive customer service history
  console.log(`Updating service history for job ${jobSheet.jobNumber}`);
}

async function processCancellationRefund(jobSheet: any): Promise<void> {
  // Process refund according to cancellation policy
  console.log(`Processing cancellation refund for job ${jobSheet.jobNumber}`);
}

async function returnPartsToInventory(jobSheet: any): Promise<void> {
  // Return unused parts to inventory
  console.log(`Returning parts to inventory for job ${jobSheet.jobNumber}`);
}

interface AddJobSheetPartRequest {
  partName: string;
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
export async function jobSheetRoutes(fastify: FastifyInstance): Promise<void> {
  // Create a new job sheet
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['bookingId', 'deviceId', 'problemDescription', 'estimatedHours', 'laborCost'],
        properties: {
          bookingId: { type: 'string' },
          deviceId: { type: 'string' },
          problemDescription: { type: 'string' },
          estimatedHours: { type: 'number' },
          laborCost: { type: 'number' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateJobSheetRequest }>, reply: FastifyReply) => {
    try {
      const technicianId = request.user?.id;
      if (!technicianId) {
        return reply.status(401).send({ error: 'Authentication required' });
      }

      // Verify booking exists and is assigned to this technician
      const booking = await prisma.booking.findFirst({
        where: { 
          id: (request as any).body.bookingId,
          technicianId,
          status: { in: ['CONFIRMED', 'ASSIGNED'] }
        },
        include: { device: true, customer: true }
      });

      if (!booking) {
        return reply.status(404).send({ error: 'Booking not found or not assigned to you' });
      }

      // Check if job sheet already exists for this booking
      const existingJobSheet = await prisma.jobSheet.findUnique({
        where: { bookingId: (request as any).body.bookingId }
      });

      if (existingJobSheet) {
        return reply.status(400).send({ error: 'Job sheet already exists for this booking' });
      }

      const jobNumber = generateJobNumber();

      const jobSheet = await prisma.jobSheet.create({
        data: {
          jobNumber,
          bookingId: (request as any).body.bookingId,
          deviceId: (request as any).body.deviceId,
          technicianId,
          problemDescription: (request as any).body.problemDescription,
          estimatedHours: (request as any).body.estimatedHours,
          laborCost: (request as any).body.laborCost,
          priority: (request as any).body.priority || 'MEDIUM',
          status: 'CREATED'
        },
        include: {
          booking: {
            include: { service: true, customer: true }
          },
          device: true,
          technician: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          partsUsed: true
        }
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: (request as any).body.bookingId },
        data: { status: 'IN_PROGRESS' }
      });

      return reply.status(201).send({
        success: true,
        data: jobSheet,
        message: 'Job sheet created successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to create job sheet',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get job sheets (for technicians)
  fastify.get('/', async (request: FastifyRequest<{ 
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
        return reply.status(401).send({ error: 'Authentication required' });
      }

      const { status, priority, page = 1, limit = 10 } = (request as any).query;
      const skip = (page - 1) * limit;

      const where: any = {};
      // Regular technicians can only see their own job sheets
      if (userRole === 'TECHNICIAN') {
        where.technicianId = technicianId;
      }
      if (status) where.status = status;
      if (priority) where.priority = priority;

      const [jobSheets, total] = await Promise.all([
        prisma.jobSheet.findMany({
          where,
          include: {
            booking: {
              include: { 
                service: true, 
                customer: { select: { id: true, firstName: true, lastName: true, phone: true } }
              }
            },
            device: {
              select: { id: true, brand: true, model: true, category: true, condition: true }
            },
            technician: {
              select: { id: true, firstName: true, lastName: true }
            },
            partsUsed: true
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.jobSheet.count({ where })
      ]);

      return reply.send({
        success: true,
        data: jobSheets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch job sheets' });
    }
  });

  // Get job sheet by ID
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const jobSheetId = (request as any).params.id;
      const userId = request.user?.id;
      const userRole = request.user?.role;

      const jobSheet = await prisma.jobSheet.findUnique({
        where: { id: jobSheetId },
        include: {
          booking: {
            include: { 
              service: true, 
              customer: true,
              address: true
            }
          },
          device: true,
          technician: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              email: true, 
              phone: true,
              technicianProfile: {
                select: { 
                  rating: true, 
                  experience: true, 
                  hourlyRate: true 
                }
              }
            }
          },
          partsUsed: true
        }
      });

      if (!jobSheet) {
        return reply.status(404).send({ error: 'Job sheet not found' });
      }

      // Authorization check
      const isAuthorized = 
        userRole === 'ADMIN' || 
        userRole === 'SUPER_ADMIN' ||
        jobSheet.technicianId === userId ||
        jobSheet.booking.customerId === userId;

      if (!isAuthorized) {
        return reply.status(403).send({ error: 'Access denied' });
      }

      return reply.send({
        success: true,
        data: jobSheet
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch job sheet' });
    }
  });

  // Update job sheet
  fastify.put('/:id', {
    schema: {
      body: {
        type: 'object',
        properties: {
          diagnosisNotes: { type: 'string' },
          repairActions: { type: 'object' },
          actualHours: { type: 'number' },
          partsCost: { type: 'number' },
          totalCost: { type: 'number' },
          status: { 
            type: 'string', 
            enum: ['CREATED', 'IN_DIAGNOSIS', 'AWAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'PARTS_ORDERED', 'TESTING', 'QUALITY_CHECK', 'COMPLETED', 'CUSTOMER_APPROVED', 'DELIVERED', 'CANCELLED'] 
          },
          qualityChecks: { type: 'object' },
          testingResults: { type: 'object' },
          beforePhotos: { type: 'array', items: { type: 'string' } },
          afterPhotos: { type: 'array', items: { type: 'string' } },
          warrantyCoverage: { type: 'string' },
          customerApprovalRequired: { type: 'boolean' },
          progressNotes: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { id: string }, 
    Body: UpdateJobSheetRequest 
  }>, reply: FastifyReply) => {
    try {
      const jobSheetId = (request as any).params.id;
      const technicianId = request.user?.id;
      const userRole = request.user?.role;

      // Verify authorization
      const jobSheet = await prisma.jobSheet.findUnique({
        where: { id: jobSheetId },
        include: { 
          booking: {
            include: { customer: true }
          },
          technician: true,
          partsUsed: true
        }
      });

      if (!jobSheet) {
        return reply.status(404).send({ error: 'Job sheet not found' });
      }

      const isAuthorized = 
        userRole === 'ADMIN' || 
        userRole === 'SUPER_ADMIN' ||
        jobSheet.technicianId === technicianId;

      if (!isAuthorized) {
        return reply.status(403).send({ error: 'Access denied' });
      }

      // Special handling for status changes with 12-state workflow
      const updateData: any = { ...(request as any).body };

      if ((request as any).body.status && (request as any).body.status !== jobSheet.status) {
        // Validate state transition using enhanced workflow
        const validationError = await validateStateTransition(
          jobSheet.status, 
          (request as any).body.status, 
          jobSheet, 
          updateData
        );

        if (validationError) {
          return reply.status(400).send({ 
            error: 'Invalid state transition', 
            message: validationError 
          });
        }

        // Execute automated actions for the new state
        await executeAutomatedActions(jobSheet, updateData, (request as any).body.status);

        // Handle completion timestamp
        if ((request as any).body.status === 'COMPLETED' && !jobSheet.completedAt) {
          updateData.completedAt = new Date();
        }
        
        // Handle start timestamp
        if(['IN_DIAGNOSIS', 'IN_PROGRESS'].includes((request as any).body.status) && !jobSheet.startedAt) {
          updateData.startedAt = new Date();
        }

        // Handle customer approval timestamp
        if((request as any).body.status === 'CUSTOMER_APPROVED') {
          updateData.customerApprovedAt = new Date();
        }

        // Update booking status based on job sheet status
        let bookingStatus = jobSheet.booking.status;
        switch ((request as any).body.status) {
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
            where: { id: jobSheet.bookingId },
            data: { status: bookingStatus }
          });
        }
      }

      const updatedJobSheet = await prisma.jobSheet.update({
        where: { id: jobSheetId },
        data: updateData,
        include: {
          booking: {
            include: { service: true, customer: true }
          },
          device: true,
          technician: {
            select: { id: true, firstName: true, lastName: true }
          },
          partsUsed: true
        }
      });

      // Log the state transition for audit trail
      fastify.log.info({
        jobSheetId,
        jobNumber: jobSheet.jobNumber,
        oldStatus: jobSheet.status,
        newStatus: (request as any).body.status,
        technicianId,
        timestamp: new Date()
      }, 'Job sheet state transition completed');

      return reply.send({
        success: true,
        data: updatedJobSheet,
        message: 'Job sheet updated successfully',
        workflow: {
          previousState: jobSheet.status,
          currentState: updatedJobSheet.status,
          transitionTimestamp: new Date(),
          automatedActionsExecuted: (request as any).body.status ? true : false
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to update job sheet',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add part to job sheet
  fastify.post('/:id/parts', {
    schema: {
      body: {
        type: 'object',
        required: ['partName', 'quantity', 'unitCost'],
        properties: {
          partName: { type: 'string' },
          partNumber: { type: 'string' },
          quantity: { type: 'number', minimum: 1 },
          unitCost: { type: 'number', minimum: 0 },
          supplier: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { id: string }, 
    Body: AddJobSheetPartRequest 
  }>, reply: FastifyReply) => {
    try {
      const jobSheetId = (request as any).params.id;
      const technicianId = request.user?.id;

      // Verify job sheet ownership
      const jobSheet = await prisma.jobSheet.findFirst({
        where: { id: jobSheetId, technicianId }
      });

      if (!jobSheet) {
        return reply.status(404).send({ error: 'Job sheet not found or access denied' });
      }

      const totalCost = (request as any).body.quantity * (request as any).body.unitCost;

      const part = await prisma.jobSheetPart.create({
        data: {
          jobSheetId,
          partName: (request as any).body.partName,
          partNumber: (request as any).body.partNumber,
          quantity: (request as any).body.quantity,
          unitCost: (request as any).body.unitCost,
          totalCost,
          supplier: (request as any).body.supplier
        }
      });

      // Update job sheet parts cost
      const allParts = await prisma.jobSheetPart.findMany({
        where: { jobSheetId }
      });

      const totalPartsCost = allParts.reduce((sum: number, part: any) => sum + Number(part.totalCost), 0);

      await prisma.jobSheet.update({
        where: { id: jobSheetId },
        data: {
          partsCost: totalPartsCost,
          totalCost: Number(jobSheet.laborCost) + totalPartsCost
        }
      });

      return reply.status(201).send({
        success: true,
        data: part,
        message: 'Part added successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to add part' });
    }
  });

  // Remove part from job sheet
  fastify.delete('/:jobSheetId/parts/:partId', async (request: FastifyRequest<{ 
    Params: { jobSheetId: string, partId: string } 
  }>, reply: FastifyReply) => {
    try {
      const { jobSheetId, partId  } = ((request as any).params as any);
      const technicianId = request.user?.id;

      // Verify job sheet ownership
      const jobSheet = await prisma.jobSheet.findFirst({
        where: { id: jobSheetId, technicianId }
      });

      if (!jobSheet) {
        return reply.status(404).send({ error: 'Job sheet not found or access denied' });
      }

      await prisma.jobSheetPart.delete({
        where: { id: partId, jobSheetId }
      });

      // Recalculate total parts cost
      const remainingParts = await prisma.jobSheetPart.findMany({
        where: { jobSheetId }
      });

      const totalPartsCost = remainingParts.reduce((sum: number, part: any) => sum + Number(part.totalCost), 0);

      await prisma.jobSheet.update({
        where: { id: jobSheetId },
        data: {
          partsCost: totalPartsCost,
          totalCost: Number(jobSheet.laborCost) + totalPartsCost
        }
      });

      return reply.send({
        success: true,
        message: 'Part removed successfully'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to remove part' });
    }
  });

  // Generate job sheet PDF
  fastify.get('/:id/pdf', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const jobSheetId = (request as any).params.id;
      const userId = request.user?.id;
      const userRole = request.user?.role;

      const jobSheet = await prisma.jobSheet.findUnique({
        where: { id: jobSheetId },
        include: {
          booking: {
            include: { 
              service: true, 
              customer: true,
              address: true
            }
          },
          device: true,
          technician: {
            include: { technicianProfile: true }
          },
          partsUsed: true
        }
      });

      if (!jobSheet) {
        return reply.status(404).send({ error: 'Job sheet not found' });
      }

      // Authorization check
      const isAuthorized = 
        userRole === 'ADMIN' || 
        userRole === 'SUPER_ADMIN' ||
        jobSheet.technicianId === userId ||
        jobSheet.booking.customerId === userId;

      if (!isAuthorized) {
        return reply.status(403).send({ error: 'Access denied' });
      }

      // For now, return JSON that could be used to generate PDF
      // In production, you'd use a PDF generation library like puppeteer or PDFKit
      const pdfData = {
        jobNumber: jobSheet.jobNumber,
        date: jobSheet.createdAt,
        customer: {
          name: `${jobSheet.booking.customer.firstName} ${jobSheet.booking.customer.lastName}`,
          email: jobSheet.booking.customer.email,
          phone: jobSheet.booking.customer.phone,
          address: jobSheet.booking.address
        },
        device: {
          brand: jobSheet.device.brand,
          model: jobSheet.device.model,
          serialNumber: jobSheet.device.serialNumber,
          category: jobSheet.device.category,
          condition: jobSheet.device.condition
        },
        technician: {
          name: `${jobSheet.technician.firstName} ${jobSheet.technician.lastName}`,
          experience: jobSheet.technician.technicianProfile?.experience
        },
        service: jobSheet.booking.service.name,
        problemDescription: jobSheet.problemDescription,
        diagnosisNotes: jobSheet.diagnosisNotes,
        repairActions: jobSheet.repairActions,
        partsUsed: jobSheet.partsUsed,
        costs: {
          labor: jobSheet.laborCost,
          parts: jobSheet.partsCost,
          total: jobSheet.totalCost
        },
        timeTracking: {
          estimated: jobSheet.estimatedHours,
          actual: jobSheet.actualHours,
          started: jobSheet.startedAt,
          completed: jobSheet.completedAt
        },
        qualityChecks: jobSheet.qualityChecks,
        testingResults: jobSheet.testingResults,
        warranty: jobSheet.warrantyCoverage,
        status: jobSheet.status
      };

      return reply.type('application/json').send({
        success: true,
        data: pdfData,
        message: 'Job sheet data ready for PDF generation'
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to generate job sheet PDF' });
    }
  });

  // Get job sheet statistics (for dashboard)
  fastify.get('/stats/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const technicianId = request.user?.id;
      const userRole = request.user?.role;

      if (!technicianId) {
        return reply.status(401).send({ error: 'Authentication required' });
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
          where: { 
            ...where, 
            status: { in: ['CREATED', 'IN_DIAGNOSIS', 'IN_PROGRESS', 'TESTING', 'QUALITY_CHECK'] }
          }
        }),
        prisma.jobSheet.count({ 
          where: { ...where, status: { in: ['COMPLETED', 'CUSTOMER_APPROVED', 'DELIVERED'] } }
        }),
        prisma.jobSheet.aggregate({
          where: { 
            ...where, 
            status: 'COMPLETED',
            actualHours: { not: null }
          },
          _avg: { actualHours: true }
        }),
        prisma.jobSheet.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        })
      ]);

      return reply.send({
        success: true,
        data: {
          totalJobSheets,
          activeJobSheets,
          completedJobSheets,
          avgCompletionTime: avgCompletionTime._avg.actualHours || 0,
          statusBreakdown: statusBreakdown.reduce((acc: Record<string, number>, item: any) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>)
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch statistics' });
    }
  });
}
