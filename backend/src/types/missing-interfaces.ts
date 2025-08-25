
// Missing interface definitions for RepairX platform
export interface CustomerIntervention {
  id: string;
  customerId: string;
  category: string;
  trigger: string;
  description: string;
  dueDate: Date;
  outcome: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  type: 'technical' | 'billing' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assignedTo: string;
  escalated: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SatisfactionSurvey {
  id: string;
  customerId: string;
  type: string;
  trigger: string;
  questions: Array<{
    id: string;
    question: string;
    type: 'rating' | 'text' | 'choice';
    answer?: unknown;
  }>;
  score: number;
  feedback: string;
  completedAt: Date;
  createdAt: Date;
}

export interface AppStoreOptimization {
  appName: string;
  platform: 'ios' | 'android' | 'both';
  title: string;
  description: string;
  keywords: string[];
  screenshots: string[];
  icon: string;
  category: string;
  targetAudience: string[];
  localization?: Record<string, unknown>;
}

export interface ABTest {
  id: string;
  name: string;
  type: 'icon' | 'screenshot' | 'description' | 'keyword';
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: Array<{
    name: string;
    assets: Record<string, string>;
    metrics: {
      impressions: number;
      clicks: number;
      installs: number;
      conversionRate: number;
    };
  }>;
  duration: number;
  confidence: number;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}
