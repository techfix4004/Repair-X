
export interface User {
  _id: string;
  email: string;
  password?: string;
  name: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LaunchCampaign {
  id: string;
  name: string;
  type: 'product-launch' | 'feature-launch' | 'market-expansion' | 'seasonal' | 'promotional';
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: Date;
  endDate: Date;
  budget: number;
  channels: CampaignChannel[];
  objectives: CampaignObjective[];
  metrics: CampaignMetrics;
  timeline: CampaignMilestone[];
  mediaOutreach: MediaOutreachConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignChannel {
  id: string;
  type: 'email' | 'sms' | 'social-media' | 'paid-ads' | 'pr' | 'content' | 'partnerships' | 'events';
  platform?: string;
  status: string;
  budget: number;
  _budget: number;
  targetAudience: string;
  content: CampaignContent;
  schedule: CampaignSchedule;
  performance: ChannelPerformance;
  config: unknown;
}

export interface CampaignObjective {
  id: string;
  type: 'awareness' | 'acquisition' | 'conversion' | 'retention' | 'revenue';
  target: number;
  current?: number;
  unit?: string;
  metrics: unknown;
}

export interface AppStoreOptimization {
  id: string;
  title?: string;
  platform?: string;
  appName?: string;
  status: 'draft' | 'optimizing' | 'testing' | 'submitted' | 'live' | 'rejected';
  metadata: AppStoreMetadata;
  screenshots: AppStoreScreenshot[];
  optimization?: any;
  performance?: any;
  compliance?: any;
}

export interface AppStoreMetadata {
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
}

export interface AppStoreScreenshot {
  id: string;
  url: string;
  deviceType: string;
  order: number;
}

export interface GuidelineCompliance {
  id: string;
  guideline: string;
  details: string;
  compliant: boolean;
  lastChecked: Date;
}

export interface CustomerIntervention {
  id: string;
  customerId: string;
  category?: string;
  trigger?: string;
  type: string;
  status: string;
  dueDate?: Date;
  outcome?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  interventionRequired: boolean;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  category?: string;
  assignedTo?: string;
  escalated?: boolean;
  subject: string;
  description: string;
  type: 'technical' | 'billing' | 'general';
  status: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface SatisfactionSurvey {
  id: string;
  customerId: string;
  type?: string;
  trigger?: string;
  status?: string;
  sentAt?: Date;
  expiresAt?: Date;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  completedAt?: Date;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple-choice';
  required?: boolean;
  scale?: { min: number; max: number };
  options?: string[];
}

export interface SurveyResponse {
  questionId: string;
  answer: unknown;
}

export interface BusinessIntelligence {
  jobRecommendations: JobRecommendation[];
  timeEstimation: TimeEstimation;
  performanceAnalytics: PerformanceAnalytics;
  realTimeDashboard: RealTimeDashboard;
}

export interface JobRecommendation {
  technicianId: string;
  score: number;
  factors: RecommendationFactors;
  estimatedArrival: string;
  confidence: number;
}

export interface RecommendationFactors {
  skillMatch: number;
  availability: number;
  location: number;
  performance: number;
  customerRating: number;
}

export interface TimeEstimation {
  estimatedHours: number;
  confidenceInterval: {
    min: number;
    max: number;
  };
  factors: string[];
  historicalData: HistoricalData;
}

export interface HistoricalData {
  averageTime: number;
  completionRate: number;
  sampleSize: number;
}

export interface PerformanceAnalytics {
  revenueByDay: RevenueByDay[];
  serviceCategories: ServiceCategory[];
  technicianPerformance: TechnicianPerformance[];
  predictions: BusinessPredictions;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  jobs: number;
}

export interface ServiceCategory {
  category: string;
  count: number;
  revenue: number;
}

export interface TechnicianPerformance {
  technicianId: string;
  name: string;
  completedJobs: number;
  avgRating: number;
  revenue: number;
}

export interface BusinessPredictions {
  nextMonthRevenue: number;
  growthRate: number;
  recommendedActions: string[];
}

export interface RealTimeDashboard {
  liveStats: LiveStats;
  recentActivity: RecentActivity[];
  topPerformers: TopPerformer[];
  alerts: SystemAlert[];
  systemHealth: SystemHealth;
}

export interface LiveStats {
  activeJobs: number;
  onlineTechnicians: number;
  todayRevenue: number;
  todayJobs: number;
  avgResponseTime: number;
}

export interface RecentActivity {
  date: string;
  revenue: number;
  jobs: number;
}

export interface TopPerformer {
  technicianId: string;
  name: string;
  score: number;
}

export interface SystemAlert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SystemHealth {
  status: string;
  uptime: number;
}

export interface TaxSettings {
  gstin: string;
  vatNumber: string;
  taxRates: TaxRates;
  jurisdiction: string;
}

export interface TaxRates {
  gst: number;
  vat: number;
}

export interface Device {
  id: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  serialNumber: string;
  customerId?: string;
}

export interface KeywordOptimization {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  competitorKeywords: string[];
  keywordDensity: Record<string, number>;
  _searchVolumeTargets: Record<string, number>;
}

export interface ABTest {
  id: string;
  name: string;
  type: string;
  status: string;
  variants: ABTestVariant[];
  startDate: string;
  endDate?: string;
  confidence: number;
  significanceLevel: number;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  traffic: number;
  isControl?: boolean;
  conversionRate?: number;
}

export interface ABTestResults {
  winner: string;
  confidence: number;
  improvement: number;
}

export interface ComplianceStatus {
  status: 'compliant' | 'non-compliant' | 'pending';
  lastCheck: string;
  issues: string[];
  guidelines: GuidelineCompliance[];
}

// Additional interfaces for LaunchCampaign
export interface CampaignMetrics {
  reach: number;
  impressions: number;
  totalImpressions: number;
  clicks: number;
  totalClicks: number;
  conversions: number;
  totalConversions: number;
  cost: number;
  roi: number;
  returnOnInvestment: number;
  costPerConversion: number;
  brandAwarenessLift: number;
  customerAcquisitionCost: number;
  engagementRate: number;
}

export interface CampaignMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignee: string;
}

export interface MediaOutreachConfig {
  pressReleases: PressRelease[];
  mediaContacts: MediaContact[];
  socialMediaPlan: SocialMediaPlan;
}

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  releaseDate: Date;
  status: 'draft' | 'scheduled' | 'published';
}

export interface MediaContact {
  id: string;
  name: string;
  outlet: string;
  email: string;
  phone: string;
  beat: string;
}

export interface SocialMediaPlan {
  platforms: string[];
  schedule: SocialMediaPost[];
  hashtags: string[];
  influencers: string[];
}

export interface SocialMediaPost {
  id: string;
  platform: string;
  content: string;
  scheduledTime: Date;
  status: 'draft' | 'scheduled' | 'published';
}

export interface CampaignContent {
  headlines: string[];
  descriptions: string[];
  images: string[];
  videos: string[];
  callToActions: string[];
  landingPages: string[];
}

export interface CampaignSchedule {
  startDate: Date;
  endDate: Date;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  timing: string;
  timezone: string;
}

export interface ChannelPerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  roas: number;
  engagementRate: number;
}
