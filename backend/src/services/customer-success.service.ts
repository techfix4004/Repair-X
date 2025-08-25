import { LaunchCampaign, CampaignChannel, CampaignObjective, AppStoreOptimization, GuidelineCompliance, CustomerIntervention, SupportTicket, SatisfactionSurvey, ABTest, ComplianceStatus, KeywordOptimization } from '../types';

export interface CustomerSuccessAutomation {
  id: string;
  customerId: string;
  customerProfile: CustomerProfile;
  successMetrics: SuccessMetrics;
  automationRules: AutomationRule[];
  interventions: CustomerIntervention[];
  retentionCampaigns: RetentionCampaign[];
  supportTickets: SupportTicket[];
  satisfactionSurveys: SatisfactionSurvey[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  _company?: string;
  segment: 'enterprise' | 'small-business' | 'individual';
  subscriptionTier: 'free' | 'basic' | 'professional' | 'enterprise';
  onboardingDate: Date;
  lastActivity: Date;
  healthScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lifetimeValue: number;
  totalJobs: number;
  successMilestones: string[];
  preferredCommunication: 'email' | 'sms' | 'phone' | 'in-app';
  timezone: string;
}

export interface SuccessMetrics {
  healthScore: number;
  engagementScore: number;
  adoptionScore: number;
  satisfactionScore: number;
  retentionProbability: number;
  churnRisk: number;
  npsScore: number;
  usageMetrics: UsageMetrics;
  businessOutcomes: BusinessOutcome[];
}

export interface UsageMetrics {
  loginFrequency: number; // Logins per week
  featureAdoption: FeatureAdoption[];
  sessionDuration: number; // Average minutes
  jobsCompleted: number;
  revenue: number;
  supportTickets: number;
  lastLoginDate: Date;
}

export interface FeatureAdoption {
  feature: string;
  adopted: boolean;
  _adoptionDate?: Date;
  usageFrequency: number;
  _lastUsed?: Date;
}

export interface BusinessOutcome {
  metric: string;
  value: number;
  improvement: number; // Percentage improvement
  _baseline?: number;
  _target?: number;
  _achievedDate?: Date;
}

export interface AutomationRule {
  id: string;
  name: string;
  type: 'onboarding' | 'retention' | 'expansion' | 'support' | 'satisfaction';
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  priority: number;
  createdAt: Date;
  _lastExecuted?: Date;
  executionCount: number;
  successRate: number;
}

export interface AutomationTrigger {
  type: 'time-based' | 'event-based' | 'score-based' | 'behavior-based';
  _event?: string;
  _timeframe?: string;
  _threshold?: number;
  _condition?: string;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: unknown;
  _logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  type: 'sendemail' | 'send_sms' | 'create_task' | 'update_score' | 'trigger_call' | 'send_survey' | 'escalate';
  template?: string;
  _recipient?: string;
  _delay?: number; // Minutes
  _parameters?: unknown;
}

export interface CustomerIntervention {
  id: string;
  customerId: string;
  type: 'proactive' | 'reactive' | 'scheduled';
  category: 'onboarding' | 'usage' | 'satisfaction' | 'retention' | 'expansion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  trigger: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  _completedDate?: Date;
  outcome: InterventionOutcome;
  _followUp?: string;
}

export interface InterventionOutcome {
  success: boolean;
  healthScoreChange: number;
  satisfactionChange: number;
  notes: string;
  _nextAction?: string;
}

export interface RetentionCampaign {
  id: string;
  name: string;
  type: 'win-back' | 'at-risk' | 'renewal' | 'expansion' | 'satisfaction';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetSegment: string;
  triggers: CampaignTrigger[];
  sequence: CampaignStep[];
  metrics: CampaignMetrics;
  _budget?: number;
  startDate: Date;
  _endDate?: Date;
}

export interface CampaignTrigger {
  type: 'health_score' | 'usage_decline' | 'subscription_expiry' | 'support_ticket' | 'satisfaction_drop';
  threshold: number;
  timeframe: string;
}

export interface CampaignStep {
  step: number;
  type: 'email' | 'sms' | 'call' | 'in-app' | 'gift' | 'discount';
  delay: number; // Days
  template: string;
  personalizations: Personalization[];
  successMetrics: string[];
}

export interface Personalization {
  field: string;
  source: string;
  fallback: string;
}

export interface CampaignMetrics {
  sent: number;
  opened: number;
  clicked: number;
  responded: number;
  converted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  roi: number;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  type: 'technical' | 'billing' | 'feature_request' | 'complaint' | 'question';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  subject: string;
  description: string;
  category: string;
  _assignedTo?: string;
  _resolution?: string;
  _satisfactionRating?: number;
  createdAt: Date;
  _resolvedAt?: Date;
  _firstResponseTime?: number; // Minutes
  _resolutionTime?: number; // Minutes
  escalated: boolean;
  relatedTickets: string[];
}

export interface SatisfactionSurvey {
  id: string;
  customerId: string;
  type: 'nps' | 'csat' | 'ces' | 'custom';
  trigger: 'onboarding_complete' | 'support_resolution' | 'feature_use' | 'periodic' | 'churn_risk';
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  status: 'draft' | 'sent' | 'responded' | 'expired';
  sentAt: Date;
  _respondedAt?: Date;
  expiresAt: Date;
  followUpActions: string[];
}

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'multiple_choice' | 'text' | 'boolean';
  question: string;
  required: boolean;
  _options?: string[];
  _scale?: { min: number; max: number };
}

export interface SurveyResponse {
  questionId: string;
  answer: unknown;
  timestamp: Date;
}

class CustomerSuccessService {
  // Customer Health Scoring
  async calculateHealthScore(customerId: string): Promise<number> {
    const customer = await this.getCustomerProfile(customerId);
    if (!customer) return 0;

    // Health score calculation based on multiple factors
    const weights = {
      usage: 0.3,
      engagement: 0.25,
      satisfaction: 0.2,
      support: 0.15,
      payment: 0.1
    };

    const usageScore = this.calculateUsageScore(customer);
    const engagementScore = this.calculateEngagementScore(customer);
    const satisfactionScore = this.calculateSatisfactionScore(customerId);
    const supportScore = this.calculateSupportScore(customerId);
    const paymentScore = this.calculatePaymentScore(customer);

    const healthScore = Math.round(
      (usageScore * weights.usage) +
      (engagementScore * weights.engagement) +
      (satisfactionScore * weights.satisfaction) +
      (supportScore * weights.support) +
      (paymentScore * weights.payment)
    );

    return Math.min(100, Math.max(0, healthScore));
  }

  private calculateUsageScore(customer: CustomerProfile): number {
    // Calculate based on login frequency, feature adoption, and job completion
    const daysSinceLastLogin = customer.lastActivity ? 
      (Date.now() - customer.lastActivity.getTime()) / (1000 * 60 * 60 * 24) : 999;
    
    if (daysSinceLastLogin > 30) return 0;
    if (daysSinceLastLogin > 14) return 40;
    if (daysSinceLastLogin > 7) return 70;
    return 100;
  }

  private calculateEngagementScore(customer: CustomerProfile): number {
    // Based on feature adoption and session duration
    const jobsScore = Math.min(100, (customer.totalJobs / 10) * 100);
    const milestoneScore = Math.min(100, (customer.successMilestones.length / 5) * 100);
    return Math.round((jobsScore + milestoneScore) / 2);
  }

  private calculateSatisfactionScore(customerId: string): number {
    // Mock - in production, calculate from survey responses
    return 85; // 0-100 scale
  }

  private calculateSupportScore(customerId: string): number {
    // Mock - in production, calculate from support ticket history
    return 90; // Higher score = fewer support issues
  }

  private calculatePaymentScore(customer: CustomerProfile): number {
    // Mock - in production, calculate from payment history
    return customer.subscriptionTier === 'free' ? 60 : 95;
  }

  // Churn Risk Assessment
  async assessChurnRisk(customerId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    recommendations: string[];
    interventionRequired: boolean;
  }> {
    const customer = await this.getCustomerProfile(customerId);
    if (!customer) {
      return {
        riskLevel: 'critical',
        riskFactors: ['Customer not found'],
        recommendations: ['Investigate customer data'],
        interventionRequired: true
      };
    }

    const healthScore = await this.calculateHealthScore(customerId);
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Assess risk factors
    if (healthScore < 30) {
      riskFactors.push('Very low health score');
      recommendations.push('Immediate intervention required');
    } else if (healthScore < 50) {
      riskFactors.push('Low health score');
      recommendations.push('Proactive outreach recommended');
    }

    const daysSinceLastLogin = customer.lastActivity ? 
      (Date.now() - customer.lastActivity.getTime()) / (1000 * 60 * 60 * 24) : 999;

    if (daysSinceLastLogin > 14) {
      riskFactors.push('Inactive for over 2 weeks');
      recommendations.push('Send re-engagement campaign');
    }

    if (customer.totalJobs === 0) {
      riskFactors.push('No jobs completed');
      recommendations.push('Focus on onboarding and first success');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (healthScore < 30 || daysSinceLastLogin > 30) riskLevel = 'critical';
    else if (healthScore < 50 || daysSinceLastLogin > 14) riskLevel = 'high';
    else if (healthScore < 70 || daysSinceLastLogin > 7) riskLevel = 'medium';

    return {
      riskLevel,
      riskFactors,
      recommendations,
      interventionRequired: riskLevel === 'critical' || riskLevel === 'high'
    };
  }

  // Automated Interventions
  async createAutomatedIntervention(
    customerId: string,
    trigger: string,
    type: CustomerIntervention['category']
  ): Promise<CustomerIntervention> {
    const intervention: CustomerIntervention = {
      id: `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      type: 'proactive',
      category: type,
      priority: 'medium',
      status: 'planned',
      trigger,
      description: this.getInterventionDescription(type, trigger),
      assignedTo: 'Customer Success Team',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      outcome: {
        success: false,
        healthScoreChange: 0,
        satisfactionChange: 0,
        notes: ''
      }
    };

    // Execute intervention based on type
    await this.executeIntervention(intervention);

    return intervention;
  }

  private getInterventionDescription(type: CustomerIntervention['category'], trigger: string): string {
    const descriptions = {
      onboarding: `Help customer complete onboarding - triggered by: ${trigger}`,
      usage: `Increase feature adoption and usage - triggered by: ${trigger}`,
      satisfaction: `Address satisfaction concerns - triggered by: ${trigger}`,
      retention: `Prevent churn and improve retention - triggered by: ${trigger}`,
      expansion: `Identify upsell opportunities - triggered by: ${trigger}`
    };
    return descriptions[type];
  }

  private async executeIntervention(intervention: CustomerIntervention): Promise<void> {
    switch (intervention.category) {
      case 'onboarding':
        await this.sendOnboardingHelp(intervention.customerId);
        break;
      case 'usage':
        await this.sendFeatureGuidance(intervention.customerId);
        break;
      case 'satisfaction':
        await this.sendSatisfactionSurvey(intervention.customerId);
        break;
      case 'retention':
        await this.sendRetentionOffer(intervention.customerId);
        break;
      case 'expansion':
        await this.sendUpgradeRecommendation(intervention.customerId);
        break;
    }
  }

  // Support Ticket Management
  async createSupportTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: (ticketData as any).customerId!,
      type: (ticketData as any).type || 'question',
      priority: this.calculateTicketPriority(ticketData),
      status: 'open',
      subject: (ticketData as any).subject || 'Support Request',
      description: (ticketData as any).description || '',
      category: this.categorizeTicket((ticketData as any).subject || ''),
      escalated: false,
      relatedTickets: [],
      createdAt: new Date()
    };

    // Auto-assign based on category and priority
    ticket.assignedTo = this.assignTicketToAgent(ticket);

    // Set up automated responses
    await this.sendAutoResponse(ticket);

    return ticket;
  }

  private calculateTicketPriority(ticketData: Partial<SupportTicket>): SupportTicket['priority'] {
    const urgentKeywords = ['urgent', 'critical', 'down', 'broken', 'not working'];
    const subject = ((ticketData as any).subject || '').toLowerCase();
    
    if (urgentKeywords.some(keyword => subject.includes(keyword))) {
      return 'critical';
    }
    
    if ((ticketData as any).type === 'technical') return 'high';
    if ((ticketData as any).type === 'billing') return 'medium';
    return 'low';
  }

  private categorizeTicket(subject: string): string {
    const categories = {
      'login': 'Authentication',
      'payment': 'Billing',
      'feature': 'Feature Request',
      'bug': 'Technical Issue',
      'integration': 'Integration Support',
      'training': 'User Training'
    };

    const subjectLower = subject.toLowerCase();
    for (const [keyword, category] of Object.entries(categories)) {
      if (subjectLower.includes(keyword)) {
        return category;
      }
    }
    
    return 'General Support';
  }

  private assignTicketToAgent(ticket: SupportTicket): string {
    const agents: { [key: string]: string } = {
      'Technical Issue': 'Tech Support Team',
      'Billing': 'Billing Team',
      'Feature Request': 'Product Team',
      'Integration Support': 'Integration Specialists',
      'User Training': 'Customer Success Team',
      'General Support': 'General Support'
    };

    return agents[ticket.category] || 'General Support';
  }

  // Satisfaction Surveys
  async createSatisfactionSurvey(
    customerId: string,
    type: SatisfactionSurvey['type'],
    trigger: SatisfactionSurvey['trigger']
  ): Promise<SatisfactionSurvey> {
    const survey: SatisfactionSurvey = {
      id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      type,
      trigger,
      questions: this.getSurveyQuestions(type),
      responses: [],
      status: 'draft',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      followUpActions: []
    };

    // Send survey
    await this.sendSurvey(survey);
    survey.status = 'sent';

    return survey;
  }

  private getSurveyQuestions(type: SatisfactionSurvey['type']): SurveyQuestion[] {
    const questionSets = {
      nps: [
        {
          id: 'nps_score',
          type: 'rating' as const,
          question: 'How likely are you to recommend RepairX to a friend or colleague?',
          required: true,
          scale: { min: 0, max: 10 }
        },
        {
          id: 'nps_reason',
          type: 'text' as const,
          question: 'What is the primary reason for your score?',
          required: false
        }
      ],
      csat: [
        {
          id: 'satisfaction',
          type: 'rating' as const,
          question: 'How satisfied are you with RepairX?',
          required: true,
          scale: { min: 1, max: 5 }
        },
        {
          id: 'improvement',
          type: 'text' as const,
          question: 'What could we improve?',
          required: false
        }
      ],
      ces: [
        {
          id: 'effort',
          type: 'rating' as const,
          question: 'How easy was it to accomplish what you wanted to do?',
          required: true,
          scale: { min: 1, max: 7 }
        }
      ],
      custom: []
    };

    return questionSets[type] || [];
  }

  // Retention Campaigns
  async createRetentionCampaign(campaignData: Partial<RetentionCampaign>): Promise<RetentionCampaign> {
    const campaign: RetentionCampaign = {
      id: `retention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: (campaignData as any).name || 'Retention Campaign',
      type: (campaignData as any).type || 'at-risk',
      status: 'draft',
      targetSegment: (campaignData as any).targetSegment || 'high-risk-customers',
      triggers: (campaignData as any).triggers || this.getDefaultTriggers(),
      sequence: (campaignData as any).sequence || this.getDefaultSequence((campaignData as any).type || 'at-risk'),
      metrics: this.initializeCampaignMetrics(),
      startDate: new Date()
    };

    // Add budget if provided
    if ((campaignData as any).budget !== undefined) {
      (campaign as any).budget = (campaignData as any).budget;
    }

    return campaign;
  }

  private getDefaultTriggers(): CampaignTrigger[] {
    return [
      {
        type: 'health_score',
        threshold: 50,
        timeframe: '7d'
      },
      {
        type: 'usage_decline',
        threshold: 50,
        timeframe: '14d'
      }
    ];
  }

  private getDefaultSequence(type: RetentionCampaign['type']): CampaignStep[] {
    const sequences = {
      'win-back': [
        {
          step: 1,
          type: 'email' as const,
          delay: 0,
          template: 'We miss you! Here\'s what\'s new in RepairX',
          personalizations: [],
          successMetrics: ['opened', 'clicked']
        },
        {
          step: 2,
          type: 'discount' as const,
          delay: 3,
          template: 'Special comeback offer - 30% off your next month',
          personalizations: [],
          successMetrics: ['redeemed']
        }
      ],
      'at-risk': [
        {
          step: 1,
          type: 'email' as const,
          delay: 0,
          template: 'Having trouble? We\'re here to help',
          personalizations: [],
          successMetrics: ['opened', 'replied']
        },
        {
          step: 2,
          type: 'call' as const,
          delay: 2,
          template: 'Personal check-in call',
          personalizations: [],
          successMetrics: ['connected', 'scheduled']
        }
      ],
      'renewal': [
        {
          step: 1,
          type: 'email' as const,
          delay: 30,
          template: 'Your subscription expires soon - renew now',
          personalizations: [],
          successMetrics: ['opened', 'renewed']
        }
      ],
      'expansion': [
        {
          step: 1,
          type: 'email' as const,
          delay: 0,
          template: 'Unlock more value with premium features',
          personalizations: [],
          successMetrics: ['opened', 'upgraded']
        }
      ],
      'satisfaction': [
        {
          step: 1,
          type: 'email' as const,
          delay: 0,
          template: 'How are we doing? Your feedback matters',
          personalizations: [],
          successMetrics: ['responded']
        }
      ]
    };

    return sequences[type] || [];
  }

  // Helper Methods
  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    // Mock implementation - in production, fetch from database
    return {
      id: customerId,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      company: 'Smith Repairs LLC',
      segment: 'small-business',
      subscriptionTier: 'professional',
      onboardingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      healthScore: 75,
      riskLevel: 'medium',
      lifetimeValue: 2400,
      totalJobs: 45,
      successMilestones: ['first_job', 'payment_setup', 'team_invite'],
      preferredCommunication: 'email',
      timezone: 'America/New_York'
    };
  }

  private async sendOnboardingHelp(customerId: string): Promise<void> {
    console.log(`Sending onboarding help to customer ${customerId}`);
  }

  private async sendFeatureGuidance(customerId: string): Promise<void> {
    console.log(`Sending feature guidance to customer ${customerId}`);
  }

  private async sendSatisfactionSurvey(customerId: string): Promise<void> {
    console.log(`Sending satisfaction survey to customer ${customerId}`);
  }

  private async sendRetentionOffer(customerId: string): Promise<void> {
    console.log(`Sending retention offer to customer ${customerId}`);
  }

  private async sendUpgradeRecommendation(customerId: string): Promise<void> {
    console.log(`Sending upgrade recommendation to customer ${customerId}`);
  }

  private async sendAutoResponse(ticket: SupportTicket): Promise<void> {
    console.log(`Sending auto-response for ticket ${ticket.id}`);
  }

  private async sendSurvey(survey: SatisfactionSurvey): Promise<void> {
    console.log(`Sending survey ${survey.id} to customer ${survey.customerId}`);
  }

  private initializeCampaignMetrics(): CampaignMetrics {
    return {
      sent: 0,
      opened: 0,
      clicked: 0,
      responded: 0,
      converted: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      roi: 0
    };
  }
}

export default CustomerSuccessService;