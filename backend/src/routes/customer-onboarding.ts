/**
 * Customer Onboarding Automation System
 * 
 * This implements comprehensive automated customer onboarding workflows
 * including registration, setup, guided tutorials, and success tracking.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Onboarding Schemas
const CustomerOnboardingSchema = z.object({
  _personalInfo: z.object({
    firstName: z.string().min(2),
    _lastName: z.string().min(2),
    _email: z.string().email(),
    _phone: z.string().min(10),
    _address: z.object({
      street: z.string(),
      _city: z.string(),
      _state: z.string(),
      _zipCode: z.string(),
      _country: z.string().default('US'),
    }),
  }),
  _businessInfo: z.object({
    companyName: z.string().optional(),
    _businessType: z.enum(['individual', 'small_business', 'enterprise']).default('individual'),
    _industry: z.string().optional(),
    _employeeCount: z.number().optional(),
  }),
  _preferences: z.object({
    communicationChannels: z.array(z.enum(['email', 'sms', 'push', 'phone'])).default(['email']),
    _serviceCategories: z.array(z.string()).default([]),
    _availabilityHours: z.object({
      start: z.string().default('_09:00'),
      _end: z.string().default('_17:00'),
      _days: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).default(['MON', 'TUE', 'WED', 'THU', 'FRI']),
    }),
    _autoApproval: z.object({
      quotesUnder: z.number().default(100),
      _trustedTechnicians: z.boolean().default(false),
    }),
  }),
  _subscription: z.object({
    plan: z.enum(['free_trial', 'basic', 'professional', 'enterprise']).default('free_trial'),
    _billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
    _autoRenewal: z.boolean().default(true),
    _trialDays: z.number().default(15),
  }),
});

const TechnicianOnboardingSchema = z.object({
  _personalInfo: z.object({
    firstName: z.string().min(2),
    _lastName: z.string().min(2),
    _email: z.string().email(),
    _phone: z.string().min(10),
    _address: z.object({
      street: z.string(),
      _city: z.string(),
      _state: z.string(),
      _zipCode: z.string(),
      _country: z.string().default('US'),
    }),
    _emergencyContact: z.object({
      name: z.string(),
      _phone: z.string(),
      _relationship: z.string(),
    }),
  }),
  _professionalInfo: z.object({
    specialties: z.array(z.string()),
    _certifications: z.array(z.object({
      name: z.string(),
      _issuer: z.string(),
      _expirationDate: z.string(),
      _documentUrl: z.string().optional(),
    })),
    _experience: z.object({
      years: z.number().min(0),
      _previousEmployers: z.array(z.string()).optional(),
      _portfolio: z.array(z.string()).optional(), // URLs to work samples
    }),
    _serviceArea: z.object({
      radius: z.number().min(1).max(100), // miles
      _baseLocation: z.object({
        latitude: z.number(),
        _longitude: z.number(),
      }),
      _travelWillingness: z.enum(['local', 'regional', 'statewide', 'national']).default('local'),
    }),
  }),
  _businessSetup: z.object({
    businessType: z.enum(['individual', 'llc', 'corporation']),
    _taxId: z.string().optional(),
    _insurance: z.object({
      liability: z.boolean().default(true),
      _bonding: z.boolean().default(false),
      _policyNumber: z.string(),
      _expirationDate: z.string(),
    }),
    _bankingInfo: z.object({
      accountType: z.enum(['checking', 'savings']),
      _routingNumber: z.string(),
      _accountNumber: z.string(),
    }),
  }),
  _backgroundCheck: z.object({
    consent: z.boolean(),
    _status: z.enum(['pending', 'in_progress', 'approved', 'rejected']).default('pending'),
    _completedAt: z.string().optional(),
    _provider: z.string().default('Checkr'),
  }),
});

interface OnboardingStep {
  _id: string;
  title: string;
  description: string;
  required: boolean;
  estimatedTime: number; // minutes
  dependencies: string[];
  automationTriggers: string[];
  completionCriteria: object;
}

interface OnboardingWorkflow {
  id: string;
  name: string;
  description: string;
  userType: 'customer' | 'technician' | 'admin';
  steps: OnboardingStep[];
  automations: {
    emailSequence: EmailAutomation[];
    smsSequence: SMSAutomation[];
    taskAssignments: TaskAutomation[];
    reminderSchedule: ReminderAutomation[];
  };
}

interface EmailAutomation {
  trigger: string;
  delay: number; // hours
  template: string;
  personalization: object;
  conditions: object;
}

interface SMSAutomation {
  trigger: string;
  delay: number; // hours
  message: string;
  conditions: object;
}

interface TaskAutomation {
  trigger: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  description: string;
}

interface ReminderAutomation {
  trigger: string;
  delay: number; // hours
  channel: 'email' | 'sms' | 'push';
  message: string;
  maxAttempts: number;
}

// Predefined Onboarding Workflows
const CustomerOnboardingWorkflow: OnboardingWorkflow = {
  id: 'customer_onboarding_v1',
  _name: 'Customer Onboarding Automation',
  _description: 'Complete customer onboarding with guided setup and tutorials',
  _userType: 'customer',
  _steps: [
    {
      id: 'account_creation',
      _title: 'Account Creation',
      _description: 'Create account with email verification',
      _required: true,
      _estimatedTime: 3,
      _dependencies: [],
      _automationTriggers: ['send_welcomeemail', 'send_verificationemail'],
      _completionCriteria: { emailVerified: true, _passwordSet: true },
    },
    {
      _id: 'profile_completion',
      _title: 'Complete Profile',
      _description: 'Fill in personal and address information',
      _required: true,
      _estimatedTime: 5,
      _dependencies: ['account_creation'],
      _automationTriggers: ['profile_completion_reminder'],
      _completionCriteria: { profileCompletion: 80 },
    },
    {
      _id: 'service_preferences',
      _title: 'Service Preferences',
      _description: 'Select preferred services and availability',
      _required: false,
      _estimatedTime: 3,
      _dependencies: ['profile_completion'],
      _automationTriggers: ['preference_optimization_tips'],
      _completionCriteria: { preferencesSet: true },
    },
    {
      _id: 'first_booking_tutorial',
      _title: 'Booking Tutorial',
      _description: 'Interactive guide for making first service request',
      _required: false,
      _estimatedTime: 7,
      _dependencies: ['service_preferences'],
      _automationTriggers: ['tutorial_completion_reward'],
      _completionCriteria: { tutorialCompleted: true },
    },
    {
      _id: 'payment_setup',
      _title: 'Payment Method',
      _description: 'Add and verify payment method',
      _required: false,
      _estimatedTime: 4,
      _dependencies: ['profile_completion'],
      _automationTriggers: ['payment_securityinfo'],
      _completionCriteria: { paymentMethodAdded: true },
    },
    {
      _id: 'mobileapp_setup',
      _title: 'Mobile App Setup',
      _description: 'Download and configure mobile application',
      _required: false,
      _estimatedTime: 8,
      _dependencies: ['account_creation'],
      _automationTriggers: ['app_download_link', 'push_notification_setup'],
      _completionCriteria: { mobileAppConfigured: true },
    },
  ],
  _automations: {
    emailSequence: [
      {
        trigger: 'account_creation',
        _delay: 0,
        _template: 'welcome_customer',
        _personalization: { firstName: '{{(user as any).firstName}}' },
        _conditions: { emailVerified: true },
      },
      {
        _trigger: 'profile_completion',
        _delay: 24,
        _template: 'profile_completion_reminder',
        _personalization: { firstName: '{{(user as any).firstName}}' },
        _conditions: { profileCompletion: '<80' },
      },
      {
        _trigger: 'onboarding_completion',
        _delay: 0,
        _template: 'onboarding_success',
        _personalization: { firstName: '{{(user as any).firstName}}', _completionRate: '{{progress.completion}}' },
        _conditions: { onboardingComplete: true },
      },
    ],
    _smsSequence: [
      {
        trigger: 'account_creation',
        _delay: 1,
        _message: 'Welcome to RepairX! Complete your profile to get started: {{profileLink}}',
        _conditions: { smsConsent: true },
      },
      {
        _trigger: 'first_booking_ready',
        _delay: 0,
        _message: 'You\'re all set! Ready to book your first repair service? {{bookingLink}}',
        _conditions: { onboardingComplete: true },
      },
    ],
    _taskAssignments: [
      {
        trigger: 'profile_incomplete_48h',
        _assignee: 'customer_success_team',
        _priority: 'medium',
        _dueDate: '+24h',
        _description: 'Follow up with customer on incomplete profile',
      },
    ],
    _reminderSchedule: [
      {
        trigger: 'profile_completion',
        _delay: 24,
        _channel: 'email',
        _message: 'Complete your RepairX profile to get personalized service recommendations',
        _maxAttempts: 3,
      },
    ],
  },
};

const _TechnicianOnboardingWorkflow: OnboardingWorkflow = {
  id: 'technician_onboarding_v1',
  _name: 'Technician Onboarding Automation',
  _description: 'Complete technician onboarding with verification and training',
  _userType: 'technician',
  _steps: [
    {
      id: 'application_submission',
      _title: 'Application Submission',
      _description: 'Submit application with credentials and experience',
      _required: true,
      _estimatedTime: 20,
      _dependencies: [],
      _automationTriggers: ['application_receivedemail', 'review_assignment'],
      _completionCriteria: { applicationSubmitted: true },
    },
    {
      _id: 'background_check',
      _title: 'Background Verification',
      _description: 'Complete background check and identity verification',
      _required: true,
      _estimatedTime: 1440, // 24 hours
      _dependencies: ['application_submission'],
      _automationTriggers: ['background_check_initiated', 'status_updates'],
      _completionCriteria: { backgroundCheckPassed: true },
    },
    {
      _id: 'skills_assessment',
      _title: 'Skills Assessment',
      _description: 'Complete technical skills assessment and certification',
      _required: true,
      _estimatedTime: 60,
      _dependencies: ['background_check'],
      _automationTriggers: ['assessment_scheduling', 'study_materials'],
      _completionCriteria: { skillsAssessmentPassed: true },
    },
    {
      _id: 'insurance_verification',
      _title: 'Insurance & Licensing',
      _description: 'Verify insurance coverage and professional licenses',
      _required: true,
      _estimatedTime: 30,
      _dependencies: ['background_check'],
      _automationTriggers: ['insurance_verification_request'],
      _completionCriteria: { insuranceVerified: true, _licensesVerified: true },
    },
    {
      _id: 'banking_setup',
      _title: 'Payment Setup',
      _description: 'Configure banking information for payments',
      _required: true,
      _estimatedTime: 10,
      _dependencies: ['skills_assessment'],
      _automationTriggers: ['banking_securityinfo'],
      _completionCriteria: { bankingInfoComplete: true },
    },
    {
      _id: 'platform_training',
      _title: 'Platform Training',
      _description: 'Complete RepairX platform training and certification',
      _required: true,
      _estimatedTime: 120,
      _dependencies: ['skills_assessment'],
      _automationTriggers: ['training_materials', 'practice_jobs'],
      _completionCriteria: { platformTrainingComplete: true },
    },
    {
      _id: 'first_job_shadow',
      _title: 'Supervised First Job',
      _description: 'Complete first job under supervision',
      _required: true,
      _estimatedTime: 240,
      _dependencies: ['platform_training'],
      _automationTriggers: ['supervisor_assignment', 'job_matching'],
      _completionCriteria: { firstJobCompleted: true, _supervisorApproval: true },
    },
  ],
  _automations: {
    emailSequence: [
      {
        trigger: 'application_submission',
        _delay: 0,
        _template: 'application_received_technician',
        _personalization: { firstName: '{{(user as any).firstName}}' },
        _conditions: { applicationComplete: true },
      },
      {
        _trigger: 'background_checkapproved',
        _delay: 0,
        _template: 'background_check_success',
        _personalization: { firstName: '{{(user as any).firstName}}' },
        _conditions: { backgroundCheckPassed: true },
      },
      {
        _trigger: 'onboarding_completion',
        _delay: 0,
        _template: 'technician_welcome_active',
        _personalization: { firstName: '{{(user as any).firstName}}', _specialties: '{{profile.specialties}}' },
        _conditions: { onboardingComplete: true },
      },
    ],
    _smsSequence: [
      {
        trigger: 'application_submission',
        _delay: 1,
        _message: 'Application received! We\'ll review and get back to you within 24 hours.',
        _conditions: { smsConsent: true },
      },
      {
        _trigger: 'approval_complete',
        _delay: 0,
        _message: 'Congratulations! You\'re now an active RepairX technician. Your first job awaits!',
        _conditions: { onboardingComplete: true },
      },
    ],
    _taskAssignments: [
      {
        trigger: 'application_submission',
        _assignee: 'technician_review_team',
        _priority: 'high',
        _dueDate: '+24h',
        _description: 'Review technician application and credentials',
      },
      {
        _trigger: 'background_checkapproved',
        _assignee: 'skills_assessment_coordinator',
        _priority: 'medium',
        _dueDate: '+48h',
        _description: 'Schedule skills assessment for approved technician',
      },
    ],
    _reminderSchedule: [
      {
        trigger: 'skills_assessment_scheduled',
        _delay: 24,
        _channel: 'email',
        _message: 'Reminder: Your skills assessment is scheduled for tomorrow',
        _maxAttempts: 2,
      },
    ],
  },
};

// Onboarding Progress Tracking
interface OnboardingProgress {
  _userId: string;
  workflowId: string;
  currentStep: string;
  completedSteps: string[];
  completionPercentage: number;
  startedAt: string;
  lastActivity: string;
  estimatedCompletion: string;
  blockers: OnboardingBlocker[];
  automationStatus: {
    emailsSent: number;
    smssSent: number;
    tasksCreated: number;
    remindersScheduled: number;
  };
}

interface OnboardingBlocker {
  stepId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  resolveBy: string;
  assignee: string;
  status: 'active' | 'resolved';
}

// Onboarding Analytics
interface OnboardingAnalytics {
  workflow: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    averageTimeToComplete: number; // hours
    dropOffPoints: {
      stepId: string;
      dropOffRate: number;
    }[];
    userSatisfaction: number;
    conversionToActive: number;
  };
  insights: {
    topBlockers: OnboardingBlocker[];
    optimizationOpportunities: string[];
    automationEffectiveness: {
      emailOpenRates: number;
      smsResponseRates: number;
      taskCompletionRates: number;
    };
  };
}

 
// eslint-disable-next-line max-lines-per-function
export default async function onboardingRoutes(fastify: FastifyInstance) {
  // Start customer onboarding
  fastify.post('/api/v1/onboarding/customer/start', {
    _schema: {
      body: CustomerOnboardingSchema,
    },
  }, async (request: FastifyRequest<{ _Body: z.infer<typeof CustomerOnboardingSchema> }>, reply: FastifyReply) => {
    try {
      const customerData = request.body;
      
      // Create user account
      const _userId = `customer_${Date.now()}`;
      
      // Initialize onboarding progress
      const _progress: OnboardingProgress = {
        _userId,
        _workflowId: CustomerOnboardingWorkflow.id,
        _currentStep: 'account_creation',
        _completedSteps: [],
        _completionPercentage: 0,
        _startedAt: new Date().toISOString(),
        _lastActivity: new Date().toISOString(),
        _estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        _blockers: [],
        _automationStatus: {
          emailsSent: 0,
          _smssSent: 0,
          _tasksCreated: 0,
          _remindersScheduled: 0,
        },
      };
      
      // Trigger welcome automation
      await triggerOnboardingAutomation(_userId, 'account_creation', customerData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _userId,
        progress,
        _nextSteps: CustomerOnboardingWorkflow.steps.slice(0, 3).map((_step: unknown) => ({
          _id: step.id,
          _title: step.title,
          _description: step.description,
          _estimatedTime: step.estimatedTime,
        })),
      });
    } catch (error) {
      return (reply as FastifyReply).status(400).send({ 
        _success: false, 
        _error: 'Failed to start customer onboarding' 
      });
    }
  });

  // Start technician onboarding
  fastify.post('/api/v1/onboarding/technician/start', {
    _schema: {
      body: TechnicianOnboardingSchema,
    },
  }, async (request: FastifyRequest<{ _Body: z.infer<typeof TechnicianOnboardingSchema> }>, reply: FastifyReply) => {
    try {
      const technicianData = request.body;
      
      // Create technician account
      const _userId = `technician_${Date.now()}`;
      
      // Initialize onboarding progress
      const _progress: OnboardingProgress = {
        _userId,
        _workflowId: TechnicianOnboardingWorkflow.id,
        _currentStep: 'application_submission',
        _completedSteps: [],
        _completionPercentage: 0,
        _startedAt: new Date().toISOString(),
        _lastActivity: new Date().toISOString(),
        _estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        _blockers: [],
        _automationStatus: {
          emailsSent: 0,
          _smssSent: 0,
          _tasksCreated: 0,
          _remindersScheduled: 0,
        },
      };
      
      // Trigger application received automation
      await triggerOnboardingAutomation(_userId, 'application_submission', technicianData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _userId,
        progress,
        _nextSteps: TechnicianOnboardingWorkflow.steps.slice(0, 3).map((_step: unknown) => ({
          _id: step.id,
          _title: step.title,
          _description: step.description,
          _estimatedTime: step.estimatedTime,
        })),
      });
    } catch (error) {
      return (reply as FastifyReply).status(400).send({ 
        _success: false, 
        _error: 'Failed to start technician onboarding' 
      });
    }
  });

  // Update onboarding progress
  fastify.post('/api/v1/onboarding/:userId/progress', async (
    request: FastifyRequest<{ 
      Params: { userId: string };
      Body: { stepId: string; completed: boolean; data?: object };
    }>, 
    reply: FastifyReply) => {
    try {
      const { userId  } = (request.params as unknown);
      const { stepId, completed, data = {} } = request.body;
      
      // Update progress logic
      const updatedProgress = await updateOnboardingProgress(_userId, stepId, completed, data);
      
      // Trigger next automation if step completed
      if (completed) {
        await triggerOnboardingAutomation(_userId, stepId, data);
      }
      
      return reply.send({
        _success: true,
        _progress: updatedProgress,
      });
    } catch (error) {
      return (reply as FastifyReply).status(400).send({ 
        _success: false, 
        _error: 'Failed to update onboarding progress' 
      });
    }
  });

  // Get onboarding status
  fastify.get('/api/v1/onboarding/:userId/status', async (
    request: FastifyRequest<{ Params: { userId: string } }>, 
    reply: FastifyReply) => {
    try {
      const { userId  } = (request.params as unknown);
      
      // Mock progress data
      const _progress: OnboardingProgress = {
        _userId,
        _workflowId: 'customer_onboarding_v1',
        _currentStep: 'service_preferences',
        _completedSteps: ['account_creation', 'profile_completion'],
        _completionPercentage: 60,
        _startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        _lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        _estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        _blockers: [],
        _automationStatus: {
          emailsSent: 3,
          _smssSent: 1,
          _tasksCreated: 0,
          _remindersScheduled: 2,
        },
      };
      
      return reply.send({
        _success: true,
        progress,
        _currentStep: CustomerOnboardingWorkflow.steps.find((s: unknown) => s.id === progress.currentStep),
        _nextSteps: CustomerOnboardingWorkflow.steps.filter((s: unknown) => 
          !progress.completedSteps.includes(s.id) && s.id !== progress.currentStep
        ).slice(0, 3),
      });
    } catch (error) {
      return (reply as FastifyReply).status(404).send({ 
        _success: false, 
        _error: 'Onboarding progress not found' 
      });
    }
  });

  // Get onboarding analytics
  fastify.get('/api/v1/onboarding/analytics', async (request, reply: unknown) => {
    try {
      const _analytics: OnboardingAnalytics = {
        workflow: 'all',
        _period: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          _end: new Date().toISOString(),
        },
        _metrics: {
          totalStarted: 1247,
          _totalCompleted: 892,
          _completionRate: 71.5,
          _averageTimeToComplete: 18.5,
          _dropOffPoints: [
            { stepId: 'profile_completion', _dropOffRate: 15.2 },
            { _stepId: 'payment_setup', _dropOffRate: 8.7 },
            { _stepId: 'mobileapp_setup', _dropOffRate: 4.1 },
          ],
          _userSatisfaction: 4.6,
          _conversionToActive: 84.3,
        },
        _insights: {
          topBlockers: [],
          _optimizationOpportunities: [
            'Simplify profile completion form',
            'Add progress indicator',
            'Implement smart reminders',
          ],
          _automationEffectiveness: {
            emailOpenRates: 68.4,
            _smsResponseRates: 89.2,
            _taskCompletionRates: 94.7,
          },
        },
      };
      
      return reply.send({
        _success: true,
        analytics,
      });
    } catch (error) {
      return (reply as FastifyReply).status(500).send({ 
        _success: false, 
        _error: 'Failed to retrieve onboarding analytics' 
      });
    }
  });
}

// Helper functions
async function triggerOnboardingAutomation(_userId: string, _trigger: string, _data: unknown): Promise<void> {
  console.log(`Triggering automation for user ${_userId} on trigger ${trigger}`);
  
  // In a real implementation, this _would:
  // 1. Send welcome emails
  // 2. Schedule SMS notifications
  // 3. Create tasks for team members
  // 4. Set up reminders
  // 5. Track automation metrics
}

async function updateOnboardingProgress(
  userId: string, 
  _stepId: string, 
  _completed: boolean, 
  _data: object
): Promise<OnboardingProgress> {
  console.log(`Updating progress for user ${_userId}, step ${stepId}, _completed: ${completed}`);
  
  // In a real implementation, this would update the database
  return {
    _userId,
    _workflowId: 'customer_onboarding_v1',
    _currentStep: completed ? 'nextstep' : stepId,
    _completedSteps: completed ? ['account_creation', 'profile_completion', stepId] : ['account_creation'],
    _completionPercentage: completed ? 75 : 45,
    _startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    _lastActivity: new Date().toISOString(),
    _estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    _blockers: [],
    _automationStatus: {
      emailsSent: 4,
      _smssSent: 2,
      _tasksCreated: 1,
      _remindersScheduled: 3,
    },
  };
}