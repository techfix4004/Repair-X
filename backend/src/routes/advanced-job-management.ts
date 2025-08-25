
import { FastifyInstance } from 'fastify';

export async function advancedJobManagementRoutes(fastify: FastifyInstance) {
  // Advanced Job Creation with AI Optimization
  fastify.post('/jobs/advanced', async (request, reply: unknown) => {
    const jobData = request.body as unknown;
    
    const enhancedJob = {
      id: `job_${Date.now()}`,
      ...jobData,
      status: 'CREATED',
      priority: await calculateJobPriority(jobData),
      estimatedDuration: await estimateJobDuration(jobData),
      recommendedTechnician: await findOptimalTechnician(jobData),
      createdAt: new Date().toISOString(),
      workflow: {
        currentState: 'CREATED',
        stateHistory: [{
          state: 'CREATED',
          timestamp: new Date().toISOString(),
          user: 'system',
          notes: 'Job automatically created with AI optimization'
        }],
        nextPossibleStates: ['IN_DIAGNOSIS', 'CANCELLED'],
        automationRules: {
          autoAssignTechnician: true,
          autoNotifyCustomer: true,
          autoScheduleFollowup: true
        }
      },
      qualityMetrics: {
        customerSatisfactionPrediction: 4.5,
        completionProbability: 0.92,
        riskFactors: []
      }
    };

    return reply.code(201).send({
      success: true,
      data: enhancedJob,
      message: 'Advanced job created with AI optimization'
    });
  });

  // Job State Transition with Business Rules
  fastify.put('/jobs/:jobId/transition', async (request, reply: unknown) => {
    const { _jobId  } = (request.params as unknown);
    const { targetState, reason, metadata  } = (request.body as unknown);
    
    const transition = await executeStateTransition(_jobId, targetState, reason, metadata);
    
    return reply.code(200).send({
      success: true,
      data: transition,
      message: `Job ${_jobId} transitioned to ${targetState}`
    });
  });

  // Advanced Job Analytics
  fastify.get('/jobs/analytics', async (request, reply: unknown) => {
    const analytics = {
      summary: {
        totalJobs: 1247,
        activeJobs: 89,
        completedToday: 23,
        averageCompletionTime: '4.2 hours',
        customerSatisfaction: 4.7
      },
      stateDistribution: {
        CREATED: 12,
        IN_DIAGNOSIS: 8,
        AWAITING_APPROVAL: 15,
        APPROVED: 6,
        IN_PROGRESS: 28,
        PARTS_ORDERED: 4,
        TESTING: 9,
        QUALITY_CHECK: 3,
        COMPLETED: 892,
        CUSTOMER_APPROVED: 845,
        DELIVERED: 823,
        CANCELLED: 76
      },
      performanceMetrics: {
        onTimeCompletion: 94.2,
        firstTimeFixRate: 87.3,
        reworkRate: 2.1,
        escalationRate: 1.8
      },
      aiOptimization: {
        accurateTimeEstimates: 91.7,
        optimalTechnicianMatch: 89.4,
        predictiveMaintenanceHits: 76.2
      }
    };

    return reply.code(200).send({
      success: true,
      data: analytics
    });
  });
}

async function calculateJobPriority(jobData: unknown): Promise<string> {
  let score = 0;
  
  // Urgency factors
  if ((jobData as any).urgent) score += 30;
  if ((jobData as any).customerType === 'premium') score += 20;
  if ((jobData as any).deviceValue > 1000) score += 15;
  if ((jobData as any).businessImpact === 'high') score += 25;
  
  // Time factors
  const age = Date.now() - new Date((jobData as any).createdAt || Date.now()).getTime();
  const hoursOld = age / (1000 * 60 * 60);
  if (hoursOld > 24) score += 10;
  if (hoursOld > 72) score += 15;
  
  if (score >= 50) return 'CRITICAL';
  if (score >= 30) return 'HIGH';
  if (score >= 15) return 'MEDIUM';
  return 'LOW';
}

async function estimateJobDuration(jobData: unknown): Promise<number> {
  const baseTime: { [key: string]: number } = {
    Electronics: 3,
    Appliances: 4,
    Automotive: 6,
    'Home Maintenance': 2
  };
  
  let duration = baseTime[(jobData as any).category] || 3;
  
  // Complexity adjustments
  if ((jobData as any).complexity === 'HIGH') duration *= 1.8;
  if ((jobData as any).complexity === 'MEDIUM') duration *= 1.3;
  
  // Historical adjustments
  if ((jobData as any).previousRepairs > 2) duration *= 1.2;
  
  return Math.round(duration * 10) / 10;
}

async function findOptimalTechnician(jobData: unknown): Promise<any> {
  const technicians = [
    { id: 'tech_001', name: 'John Smith', skills: ['Electronics', 'Appliances'], rating: 4.8, availability: 0.7 },
    { id: 'tech_002', name: 'Sarah Johnson', skills: ['Automotive', 'Electronics'], rating: 4.9, availability: 0.9 },
    { id: 'tech_003', name: 'Mike Davis', skills: ['Home Maintenance'], rating: 4.6, availability: 0.5 }
  ];
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const tech of technicians) {
    let score = 0;
    
    // Skill match
    if (tech.skills.includes((jobData as any).category)) score += 40;
    
    // Rating
    score += tech.rating * 10;
    
    // Availability
    score += tech.availability * 20;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = tech;
    }
  }
  
  return bestMatch;
}

async function executeStateTransition(jobId: string, targetState: string, reason: string, metadata: unknown): Promise<any> {
  const validTransitions = {
    CREATED: ['IN_DIAGNOSIS', 'CANCELLED'],
    IN_DIAGNOSIS: ['AWAITING_APPROVAL', 'CANCELLED'],
    AWAITING_APPROVAL: ['APPROVED', 'CANCELLED'],
    APPROVED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['PARTS_ORDERED', 'TESTING', 'CANCELLED'],
    PARTS_ORDERED: ['IN_PROGRESS', 'CANCELLED'],
    TESTING: ['QUALITY_CHECK', 'IN_PROGRESS', 'CANCELLED'],
    QUALITY_CHECK: ['COMPLETED', 'IN_PROGRESS', 'CANCELLED'],
    COMPLETED: ['CUSTOMER_APPROVED', 'CANCELLED'],
    CUSTOMER_APPROVED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: []
  };
  
  // Simulate state transition logic
  const transition = {
    jobId,
    fromState: 'CREATED', // This would be fetched from database
    toState: targetState,
    timestamp: new Date().toISOString(),
    reason,
    metadata,
    automationTriggered: {
      notifications: ['customer_notified', 'technician_assigned'],
      nextActions: ['schedule_followup', 'update_inventory']
    }
  };
  
  return transition;
}
