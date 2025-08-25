
export interface User {
  id: string;
  email: string;
  _password?: string;
  name: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LaunchCampaign {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  channels: CampaignChannel[];
  objectives: CampaignObjective[];
}

export interface CampaignChannel {
  id: string;
  type: 'email' | 'sms' | 'social-media' | 'paid-ads' | 'pr' | 'content' | 'partnerships' | 'events';
  status: string;
}

export interface CampaignObjective {
  id: string;
  type: 'awareness' | 'acquisition' | 'conversion' | 'retention' | 'revenue';
  target: number;
  metrics: unknown;
}

export interface AppStoreOptimization {
  id: string;
  status: 'draft' | 'optimizing' | 'testing' | 'submitted' | 'live' | 'rejected';
  metadata: unknown;
}

export interface GuidelineCompliance {
  id: string;
  guideline: string;
  details: string;
  compliant: boolean;
}

export interface CustomerIntervention {
  id: string;
  customerId: string;
  type: string;
  status: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  type: 'technical' | 'billing' | 'general';
  status: string;
}

export interface SatisfactionSurvey {
  id: string;
  customerId: string;
  questions: SurveyQuestion[];
  responses: unknown[];
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: string;
}
