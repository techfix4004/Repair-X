// @ts-nocheck
import { LaunchCampaign, CampaignChannel, CampaignObjective, AppStoreOptimization, GuidelineCompliance, CustomerIntervention, SupportTicket, SatisfactionSurvey, ABTest, ComplianceStatus, KeywordOptimization } from '../types';

export interface CustomerSuccessAutomation {
  _id: string;
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
      _usage: 0.3,
      _engagement: 0.25,
      _satisfaction: 0.2,
      _support: 0.15,
      _payment: 0.1
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

  private calculateUsageScore(_customer: CustomerProfile): number {
    // Calculate based on login frequency, feature adoption, and job completion
    const daysSinceLastLogin = customer.lastActivity ? 
      (Date.now() - customer.lastActivity.getTime()) / (1000 * 60 * 60 * 24) : 999;
    
    if (daysSinceLastLogin > 30) return 0;
    if (daysSinceLastLogin > 14) return 40;
    if (daysSinceLastLogin > 7) return 70;
    return 100;
  }

  private calculateEngagementScore(_customer: CustomerProfile): number {
    // Based on feature adoption and session duration
    const jobsScore = Math.min(100, (customer.totalJobs / 10) * 100);
    const milestoneScore = Math.min(100, (customer.successMilestones.length / 5) * 100);
    return Math.round((jobsScore + milestoneScore) / 2);
  }

  private calculateSatisfactionScore(_customerId: string): number {
    // Mock - in production, calculate from survey responses
    return 85; // 0-100 scale
  }

  private calculateSupportScore(_customerId: string): number {
    // Mock - in production, calculate from support ticket history
    return 90; // Higher score = fewer support issues
  }

  private calculatePaymentScore(_customer: CustomerProfile): number {
    // Mock - in production, calculate from payment history
    return customer.subscriptionTier === 'free' ? _60 : 95;
  }

  // Churn Risk Assessment
  async assessChurnRisk(customerId: string): Promise<{
    _riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    recommendations: string[];
    interventionRequired: boolean;
  }> {
    const customer = await this.getCustomerProfile(customerId);
    if (!customer) {
      return {
        _riskLevel: 'critical',
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
      _riskLevel: riskLevel,
      riskFactors,
      recommendations,
      interventionRequired: riskLevel === 'critical' || riskLevel === 'high'
    };
  }

  // Automated Interventions
  async createAutomatedIntervention(
    customerId: string,
    _trigger: string,
    _type: CustomerIntervention['category']
  ): Promise<CustomerIntervention> {
    const _intervention: CustomerIntervention = {
      id: `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      _type: 'proactive',
      _category: type,
      _priority: 'medium',
      _status: 'planned',
      trigger,
      _description: this.getInterventionDescription(type, trigger),
      _assignedTo: 'Customer Success Team',
      _dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      _outcome: {
        success: false,
        _healthScoreChange: 0,
        _satisfactionChange: 0,
        _notes: ''
      }
    };

    // Execute intervention based on type
    await this.executeIntervention(intervention);

    return intervention;
  }

  private getInterventionDescription(_type: CustomerIntervention['category'], _trigger: string): string {
    const descriptions = {
      _onboarding: `Help customer complete onboarding - triggered by: ${trigger}`,
      _usage: `Increase feature adoption and usage - triggered by: ${trigger}`,
      _satisfaction: `Address satisfaction concerns - triggered by: ${trigger}`,
      _retention: `Prevent churn and improve retention - triggered by: ${trigger}`,
      _expansion: `Identify upsell opportunities - triggered by: ${trigger}`
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
  async createSupportTicket(_ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const _ticket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      _customerId: (ticketData as any).customerId!,
      _type: (ticketData as any).type || 'question',
      _priority: this.calculateTicketPriority(ticketData),
      _status: 'open',
      _subject: (ticketData as any).subject || 'Support Request',
      _description: (ticketData as any).description || '',
      _category: this.categorizeTicket((ticketData as any).subject || ''),
      _escalated: false,
      _relatedTickets: [],
      _createdAt: new Date()
    };

    // Auto-assign based on category and priority
    ticket.assignedTo = this.assignTicketToAgent(ticket);

    // Set up automated responses
    await this.sendAutoResponse(ticket);

    return ticket;
  }

  private calculateTicketPriority(_ticketData: Partial<SupportTicket>): SupportTicket['priority'] {
    const urgentKeywords = ['urgent', 'critical', 'down', 'broken', 'not working'];
    const subject = ((ticketData as any).subject || '').toLowerCase();
    
    if (urgentKeywords.some(keyword => subject.includes(keyword))) {
      return 'critical';
    }
    
    if ((ticketData as any).type === 'technical') return 'high';
    if ((ticketData as any).type === 'billing') return 'medium';
    return 'low';
  }

  private categorizeTicket(_subject: string): string {
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

  private assignTicketToAgent(_ticket: SupportTicket): string {
    const _agents: { [key: string]: string } = {
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
    _customerId: string,
    _type: SatisfactionSurvey['type'],
    _trigger: SatisfactionSurvey['trigger']
  ): Promise<SatisfactionSurvey> {
    const _survey: SatisfactionSurvey = {
      id: `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      type,
      trigger,
      _questions: this.getSurveyQuestions(type),
      _responses: [],
      _status: 'draft',
      _sentAt: new Date(),
      _expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      _followUpActions: []
    };

    // Send survey
    await this.sendSurvey(survey);
    survey.status = 'sent';

    return survey;
  }

  private getSurveyQuestions(_type: SatisfactionSurvey['type']): SurveyQuestion[] {
    const questionSets = {
      _nps: [
        {
          id: 'nps_score',
          _type: 'rating' as const,
          _question: 'How likely are you to recommend RepairX to a friend or colleague?',
          _required: true,
          _scale: { min: 0, _max: 10 }
        },
        {
          _id: 'nps_reason',
          _type: 'text' as const,
          _question: 'What is the primary reason for your score?',
          _required: false
        }
      ],
      _csat: [
        {
          id: 'satisfaction',
          _type: 'rating' as const,
          _question: 'How satisfied are you with RepairX?',
          _required: true,
          _scale: { min: 1, _max: 5 }
        },
        {
          _id: 'improvement',
          _type: 'text' as const,
          _question: 'What could we improve?',
          _required: false
        }
      ],
      _ces: [
        {
          id: 'effort',
          _type: 'rating' as const,
          _question: 'How easy was it to accomplish what you wanted to do?',
          _required: true,
          _scale: { min: 1, _max: 7 }
        }
      ],
      _custom: []
    };

    return questionSets[type] || [];
  }

  // Retention Campaigns
  async createRetentionCampaign(campaignData: Partial<RetentionCampaign>): Promise<RetentionCampaign> {
    const _campaign: RetentionCampaign = {
      id: `retention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      _name: (campaignData as any).name || 'Retention Campaign',
      _type: (campaignData as any).type || 'at-risk',
      _status: 'draft',
      _targetSegment: (campaignData as any).targetSegment || 'high-risk-customers',
      _triggers: (campaignData as any).triggers || this.getDefaultTriggers(),
      _sequence: (campaignData as any).sequence || this.getDefaultSequence((campaignData as any).type || 'at-risk'),
      _metrics: this.initializeCampaignMetrics(),
      _startDate: new Date()
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
        _type: 'health_score',
        _threshold: 50,
        _timeframe: '7d'
      },
      {
        _type: 'usage_decline',
        _threshold: 50,
        _timeframe: '14d'
      }
    ];
  }

  private getDefaultSequence(type: RetentionCampaign['type']): CampaignStep[] {
    const sequences = {
      'win-back': [
        {
          _step: 1,
          _type: 'email' as const,
          _delay: 0,
          _template: 'We miss you! Here\'s what\'s new in RepairX',
          _personalizations: [],
          _successMetrics: ['opened', 'clicked']
        },
        {
          _step: 2,
          _type: 'discount' as const,
          _delay: 3,
          _template: 'Special comeback offer - 30% off your next month',
          _personalizations: [],
          _successMetrics: ['redeemed']
        }
      ],
      'at-risk': [
        {
          _step: 1,
          _type: 'email' as const,
          _delay: 0,
          _template: 'Having trouble? We\'re here to help',
          _personalizations: [],
          _successMetrics: ['opened', 'replied']
        },
        {
          _step: 2,
          _type: 'call' as const,
          _delay: 2,
          _template: 'Personal check-in call',
          _personalizations: [],
          _successMetrics: ['connected', 'scheduled']
        }
      ],
      'renewal': [
        {
          _step: 1,
          _type: 'email' as const,
          _delay: 30,
          _template: 'Your subscription expires soon - renew now',
          _personalizations: [],
          _successMetrics: ['opened', 'renewed']
        }
      ],
      'expansion': [
        {
          _step: 1,
          _type: 'email' as const,
          _delay: 0,
          _template: 'Unlock more value with premium features',
          _personalizations: [],
          _successMetrics: ['opened', 'upgraded']
        }
      ],
      'satisfaction': [
        {
          _step: 1,
          _type: 'email' as const,
          _delay: 0,
          _template: 'How are we doing? Your feedback matters',
          _personalizations: [],
          _successMetrics: ['responded']
        }
      ]
    };

    return sequences[type] || [];
  }

  // Helper Methods
  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    // Mock implementation - in production, fetch from database
    return {
      _id: customerId,
      _name: 'John Smith',
      _email: 'john.smith@example.com',
      _phone: '+1234567890',
      _company: 'Smith Repairs LLC',
      _segment: 'small-business',
      _subscriptionTier: 'professional',
      _onboardingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      _lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      _healthScore: 75,
      _riskLevel: 'medium',
      _lifetimeValue: 2400,
      _totalJobs: 45,
      _successMilestones: ['first_job', 'payment_setup', 'team_invite'],
      _preferredCommunication: 'email',
      _timezone: 'America/New_York'
    };
  }

  private async sendOnboardingHelp(customerId: string): Promise<void> {
    console.log(`Sending onboarding help to customer ${customerId}`);
  }

  private async sendFeatureGuidance(_customerId: string): Promise<void> {
    console.log(`Sending feature guidance to customer ${customerId}`);
  }

  private async sendSatisfactionSurvey(_customerId: string): Promise<void> {
    console.log(`Sending satisfaction survey to customer ${customerId}`);
  }

  private async sendRetentionOffer(_customerId: string): Promise<void> {
    console.log(`Sending retention offer to customer ${customerId}`);
  }

  private async sendUpgradeRecommendation(_customerId: string): Promise<void> {
    console.log(`Sending upgrade recommendation to customer ${customerId}`);
  }

  private async sendAutoResponse(_ticket: SupportTicket): Promise<void> {
    console.log(`Sending auto-response for ticket ${ticket.id}`);
  }

  private async sendSurvey(_survey: SatisfactionSurvey): Promise<void> {
    console.log(`Sending survey ${survey.id} to customer ${survey.customerId}`);
  }

  private initializeCampaignMetrics(): CampaignMetrics {
    return {
      _sent: 0,
      _opened: 0,
      _clicked: 0,
      _responded: 0,
      _converted: 0,
      _openRate: 0,
      _clickRate: 0,
      _conversionRate: 0,
      roi: 0
    };
  }
}

export default CustomerSuccessService;