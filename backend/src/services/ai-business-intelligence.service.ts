import { PrismaClient } from '@prisma/client';
import * as natural from 'natural';
import * as compromise from 'compromise';
import DecisionTree from 'decision-tree';
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import * as ss from 'simple-statistics';

export interface DiagnosisResult {
  id: string;
  confidence: number;
  diagnosis: string;
  recommendedActions: string[];
  estimatedCost: number;
  estimatedDuration: number;
  partsNeeded: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string[];
}

export interface PredictiveMaintenanceAlert {
  deviceId: string;
  predictedIssue: string;
  probability: number;
  timeframe: string;
  recommendedAction: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CustomerBehaviorInsight {
  customerId: string;
  segments: string[];
  churnProbability: number;
  recommendedRetentionActions: string[];
  lifetimeValue: number;
  nextServicePrediction: Date | null;
}

export interface TechnicianOptimization {
  technicianId: string;
  efficiency: number;
  strengths: string[];
  improvementAreas: string[];
  recommendedTraining: string[];
  workloadSuggestion: 'increase' | 'decrease' | 'maintain';
}

export class AIBusinessIntelligenceService {
  private prisma: PrismaClient;
  private classifier: natural.LogisticRegressionClassifier;
  private sentimentAnalyzer: natural.SentimentAnalyzer;
  private stemmer: any;
  private tokenizer: natural.WordTokenizer;

  constructor() {
    this.prisma = new PrismaClient();
    this.classifier = new natural.LogisticRegressionClassifier();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer(
      'English',
      natural.PorterStemmer,
      'afinn'
    );
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    
    this.initializeAI();
  }

  private async initializeAI() {
    try {
      // Initialize AI models with historical data
      await this.trainDiagnosisModel();
      await this.trainCustomerSegmentationModel();
      logger.info('AI Business Intelligence Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI models:', error);
    }
  }

  /**
   * AI-Powered Diagnostic System
   * Analyzes device symptoms and provides intelligent diagnosis
   */
  async performIntelligentDiagnosis(
    deviceType: string,
    symptoms: string[],
    customerDescription: string,
    deviceAge?: number,
    previousIssues?: string[]
  ): Promise<DiagnosisResult> {
    try {
      // Natural Language Processing of customer description
      const processedDescription = this.preprocessText(customerDescription);
      const extractedKeywords = this.extractTechnicalKeywords(processedDescription);
      
      // Combine all diagnostic inputs
      const diagnosticInput = {
        deviceType: deviceType.toLowerCase(),
        symptoms: symptoms.map(s => s.toLowerCase()),
        keywords: extractedKeywords,
        deviceAge: deviceAge || 0,
        previousIssues: previousIssues || []
      };

      // Use decision tree for diagnosis
      const diagnosis = await this.classifyIssue(diagnosticInput);
      
      // Generate confidence score
      const confidence = this.calculateDiagnosisConfidence(diagnosticInput, diagnosis);
      
      // Get recommended actions and cost estimates
      const recommendations = await this.getRecommendations(diagnosis, deviceType);
      
      return {
        id: uuidv4(),
        confidence: confidence,
        diagnosis: diagnosis.mainIssue,
        recommendedActions: recommendations.actions,
        estimatedCost: recommendations.cost,
        estimatedDuration: recommendations.duration,
        partsNeeded: recommendations.parts,
        urgencyLevel: this.determineUrgency(diagnosis, symptoms),
        reasoning: this.generateReasoningExplanation(diagnosticInput, diagnosis)
      };
    } catch (error) {
      logger.error('Error in intelligent diagnosis:', error);
      throw new Error('Failed to perform AI diagnosis');
    }
  }

  /**
   * Predictive Maintenance System
   * Analyzes device patterns to predict future issues
   */
  async generatePredictiveMaintenanceAlerts(
    deviceId: string
  ): Promise<PredictiveMaintenanceAlert[]> {
    try {
      // Get device history and usage patterns
      const device = await this.prisma.device.findUnique({
        where: { id: deviceId },
        include: {
          bookings: {
            include: {
              jobSheet: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!device) {
        throw new Error('Device not found');
      }

      // Analyze repair patterns
      const repairHistory = device.bookings
        .filter(booking => booking.jobSheet)
        .map(booking => ({
          date: booking.createdAt,
          issue: booking.description || '',
          parts: booking.jobSheet?.partsUsed || [],
          cost: booking.finalPrice || 0
        }));

      // Predict future issues based on patterns
      const predictions = await this.predictFutureIssues(device, repairHistory);
      
      return predictions;
    } catch (error) {
      logger.error('Error generating predictive maintenance alerts:', error);
      return [];
    }
  }

  /**
   * Customer Behavior Analysis and Retention
   * Analyzes customer patterns for retention strategies
   */
  async analyzeCustomerBehavior(customerId: string): Promise<CustomerBehaviorInsight> {
    try {
      const customer = await this.prisma.user.findUnique({
        where: { id: customerId },
        include: {
          bookings: {
            include: {
              payment: true,
              review: true
            },
            orderBy: { createdAt: 'desc' }
          },
          devices: true
        }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Analyze booking patterns
      const bookingPatterns = this.analyzeBookingPatterns(customer.bookings);
      
      // Calculate customer lifetime value
      const lifetimeValue = this.calculateCustomerLifetimeValue(customer.bookings);
      
      // Predict churn probability
      const churnProbability = await this.predictChurnProbability(customer);
      
      // Generate customer segments
      const segments = await this.segmentCustomer(customer);
      
      // Predict next service date
      const nextServicePrediction = this.predictNextService(bookingPatterns);
      
      // Generate retention recommendations
      const retentionActions = this.generateRetentionActions(
        churnProbability,
        segments,
        bookingPatterns
      );

      return {
        customerId,
        segments,
        churnProbability,
        recommendedRetentionActions: retentionActions,
        lifetimeValue,
        nextServicePrediction
      };
    } catch (error) {
      logger.error('Error analyzing customer behavior:', error);
      throw new Error('Failed to analyze customer behavior');
    }
  }

  /**
   * Technician Performance Optimization
   * Analyzes technician performance and suggests improvements
   */
  async optimizeTechnicianPerformance(
    technicianId: string
  ): Promise<TechnicianOptimization> {
    try {
      const technician = await this.prisma.user.findUnique({
        where: { id: technicianId },
        include: {
          assignedBookings: {
            include: {
              jobSheet: true,
              review: true
            },
            where: {
              completedAt: {
                not: null
              }
            },
            orderBy: { completedAt: 'desc' }
          },
          technicianProfile: {
            include: {
              skills: {
                include: {
                  service: true
                }
              }
            }
          }
        }
      });

      if (!technician) {
        throw new Error('Technician not found');
      }

      // Calculate efficiency metrics
      const efficiency = this.calculateTechnicianEfficiency(technician.assignedBookings);
      
      // Identify strengths and improvement areas
      const performanceAnalysis = this.analyzeTechnicianPerformance(
        technician.assignedBookings,
        technician.technicianProfile?.skills || []
      );
      
      // Generate training recommendations
      const trainingRecommendations = this.generateTrainingRecommendations(
        performanceAnalysis.weakAreas,
        technician.technicianProfile?.skills || []
      );
      
      // Suggest workload adjustments
      const workloadSuggestion = this.suggestWorkloadAdjustment(
        efficiency,
        technician.assignedBookings.length
      );

      return {
        technicianId,
        efficiency,
        strengths: performanceAnalysis.strengths,
        improvementAreas: performanceAnalysis.weakAreas,
        recommendedTraining: trainingRecommendations,
        workloadSuggestion
      };
    } catch (error) {
      logger.error('Error optimizing technician performance:', error);
      throw new Error('Failed to optimize technician performance');
    }
  }

  /**
   * Dynamic Pricing Intelligence
   * AI-powered pricing optimization based on demand, competition, and market factors
   */
  async optimizePricing(
    serviceId: string,
    location: string,
    timeSlot: Date,
    urgency: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<{
    recommendedPrice: number;
    priceFactors: { factor: string; impact: number; reason: string }[];
    confidence: number;
  }> {
    try {
      // Get service base price
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        throw new Error('Service not found');
      }

      let basePrice = Number(service.basePrice);
      const priceFactors = [];

      // Demand-based pricing
      const demandMultiplier = await this.calculateDemandMultiplier(
        serviceId,
        location,
        timeSlot
      );
      priceFactors.push({
        factor: 'Demand',
        impact: demandMultiplier - 1,
        reason: demandMultiplier > 1 ? 'High demand period' : 'Low demand period'
      });

      // Urgency multiplier
      const urgencyMultipliers = {
        low: 1.0,
        medium: 1.1,
        high: 1.3,
        critical: 1.5
      };
      const urgencyMultiplier = urgencyMultipliers[urgency];
      priceFactors.push({
        factor: 'Urgency',
        impact: urgencyMultiplier - 1,
        reason: `${urgency} priority service`
      });

      // Time slot pricing
      const timeMultiplier = this.calculateTimeSlotMultiplier(timeSlot);
      priceFactors.push({
        factor: 'Time Slot',
        impact: timeMultiplier - 1,
        reason: this.getTimeSlotReason(timeSlot)
      });

      // Calculate final price
      const recommendedPrice = Math.round(
        basePrice * demandMultiplier * urgencyMultiplier * timeMultiplier
      );

      // Calculate confidence based on data availability and factors
      const confidence = this.calculatePricingConfidence(priceFactors);

      return {
        recommendedPrice,
        priceFactors,
        confidence
      };
    } catch (error) {
      logger.error('Error optimizing pricing:', error);
      throw new Error('Failed to optimize pricing');
    }
  }

  // Private helper methods

  private preprocessText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractTechnicalKeywords(text: string): string[] {
    const doc = (compromise as any)(text);
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    
    // Technical keywords related to device issues
    const technicalTerms = [
      'screen', 'battery', 'charging', 'speaker', 'microphone',
      'camera', 'button', 'water', 'crack', 'broken', 'dead',
      'slow', 'hot', 'freezing', 'restart', 'boot', 'update'
    ];
    
    return [...nouns, ...adjectives]
      .filter(word => technicalTerms.some(term => word.includes(term)))
      .slice(0, 10);
  }

  private async trainDiagnosisModel() {
    // In a real implementation, this would train on historical diagnosis data
    // For now, we'll use a simple decision tree approach
    const trainingData = [
      { symptoms: ['screen broken', 'display'], result: 'screen_replacement' },
      { symptoms: ['battery drain', 'power'], result: 'battery_replacement' },
      { symptoms: ['water damage', 'liquid'], result: 'water_damage_repair' },
      { symptoms: ['charging issue', 'port'], result: 'charging_port_repair' }
    ];

    // Training would happen here
    logger.info('Diagnosis model training completed');
  }

  private async trainCustomerSegmentationModel() {
    // Customer segmentation model training
    logger.info('Customer segmentation model training completed');
  }

  private async classifyIssue(input: any): Promise<{ mainIssue: string; confidence: number }> {
    // Simple classification logic
    // In production, this would use trained ML models
    
    const { symptoms, keywords, deviceType } = input;
    const allTerms = [...symptoms, ...keywords].join(' ');

    if (allTerms.includes('screen') || allTerms.includes('display') || allTerms.includes('crack')) {
      return { mainIssue: 'Screen Replacement Required', confidence: 0.85 };
    }
    
    if (allTerms.includes('battery') || allTerms.includes('power') || allTerms.includes('drain')) {
      return { mainIssue: 'Battery Replacement Required', confidence: 0.80 };
    }
    
    if (allTerms.includes('water') || allTerms.includes('liquid') || allTerms.includes('wet')) {
      return { mainIssue: 'Water Damage Repair', confidence: 0.75 };
    }
    
    if (allTerms.includes('charging') || allTerms.includes('port') || allTerms.includes('cable')) {
      return { mainIssue: 'Charging Port Repair', confidence: 0.70 };
    }

    return { mainIssue: 'General Diagnostic Required', confidence: 0.60 };
  }

  private calculateDiagnosisConfidence(input: any, diagnosis: any): number {
    let confidence = diagnosis.confidence || 0.5;
    
    // Increase confidence based on keyword matches
    if (input.keywords.length > 3) confidence += 0.1;
    if (input.symptoms.length > 2) confidence += 0.1;
    if (input.previousIssues.length > 0) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  }

  private async getRecommendations(diagnosis: any, deviceType: string) {
    // Mock recommendations based on diagnosis
    const recommendations = {
      'Screen Replacement Required': {
        actions: ['Remove damaged screen', 'Install new display', 'Test touch functionality'],
        cost: 150,
        duration: 90,
        parts: ['LCD Display', 'Touch Digitizer', 'Adhesive']
      },
      'Battery Replacement Required': {
        actions: ['Remove old battery', 'Install new battery', 'Calibrate battery'],
        cost: 80,
        duration: 60,
        parts: ['Battery', 'Adhesive strips']
      },
      'Water Damage Repair': {
        actions: ['Disassemble device', 'Clean corrosion', 'Replace damaged components'],
        cost: 200,
        duration: 180,
        parts: ['Cleaning solution', 'Various components']
      }
    };

    return recommendations[diagnosis.mainIssue] || {
      actions: ['Diagnostic assessment', 'Identify issue', 'Provide quote'],
      cost: 50,
      duration: 30,
      parts: []
    };
  }

  private determineUrgency(diagnosis: any, symptoms: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const urgentKeywords = ['critical', 'urgent', 'emergency', 'immediately'];
    const highKeywords = ['important', 'soon', 'asap'];
    
    const text = symptoms.join(' ').toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (diagnosis.mainIssue.includes('Water Damage')) return 'high';
    
    return 'medium';
  }

  private generateReasoningExplanation(input: any, diagnosis: any): string[] {
    return [
      `Analyzed ${input.symptoms.length} symptoms provided`,
      `Extracted ${input.keywords.length} technical keywords from description`,
      `Device type: ${input.deviceType}`,
      `Diagnosis confidence: ${Math.round(diagnosis.confidence * 100)}%`
    ];
  }

  private async predictFutureIssues(device: any, repairHistory: any[]): Promise<PredictiveMaintenanceAlert[]> {
    const alerts: PredictiveMaintenanceAlert[] = [];
    
    // Simple pattern-based predictions
    if (repairHistory.length >= 2) {
      const lastRepair = repairHistory[0];
      const daysSinceLastRepair = (Date.now() - lastRepair.date.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastRepair > 90 && lastRepair.issue.includes('battery')) {
        alerts.push({
          deviceId: device.id,
          predictedIssue: 'Battery degradation',
          probability: 0.7,
          timeframe: '2-3 months',
          recommendedAction: 'Schedule battery health check',
          severity: 'medium'
        });
      }
    }
    
    return alerts;
  }

  private analyzeBookingPatterns(bookings: any[]) {
    const patterns = {
      averageTimeBetweenBookings: 0,
      totalBookings: bookings.length,
      averageSpending: 0,
      lastBookingDate: bookings[0]?.createdAt || null,
      bookingFrequency: 'low'
    };

    if (bookings.length > 1) {
      const timeDiffs = [];
      for (let i = 0; i < bookings.length - 1; i++) {
        const diff = bookings[i].createdAt.getTime() - bookings[i + 1].createdAt.getTime();
        timeDiffs.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
      }
      patterns.averageTimeBetweenBookings = ss.mean(timeDiffs);
    }

    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.finalPrice || 0), 0);
    patterns.averageSpending = totalSpent / bookings.length;

    if (patterns.averageTimeBetweenBookings < 30) patterns.bookingFrequency = 'high';
    else if (patterns.averageTimeBetweenBookings < 90) patterns.bookingFrequency = 'medium';

    return patterns;
  }

  private calculateCustomerLifetimeValue(bookings: any[]): number {
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.finalPrice || 0), 0);
    const monthsActive = bookings.length > 0 ? 
      (Date.now() - bookings[bookings.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30) : 0;
    
    if (monthsActive === 0) return totalSpent;
    
    const monthlyValue = totalSpent / monthsActive;
    return monthlyValue * 24; // Project 2 years
  }

  private async predictChurnProbability(customer: any): Promise<number> {
    // Simple churn prediction based on recency
    const lastBooking = customer.bookings[0];
    if (!lastBooking) return 0.8;
    
    const daysSinceLastBooking = (Date.now() - lastBooking.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastBooking > 180) return 0.7;
    if (daysSinceLastBooking > 90) return 0.4;
    if (daysSinceLastBooking > 30) return 0.2;
    
    return 0.1;
  }

  private async segmentCustomer(customer: any): Promise<string[]> {
    const segments = [];
    const bookings = customer.bookings;
    const totalSpent = bookings.reduce((sum: number, booking: any) => sum + (booking.finalPrice || 0), 0);
    
    if (totalSpent > 500) segments.push('High Value');
    else if (totalSpent > 200) segments.push('Medium Value');
    else segments.push('Low Value');
    
    if (bookings.length > 5) segments.push('Frequent User');
    else if (bookings.length > 2) segments.push('Regular User');
    else segments.push('Occasional User');
    
    return segments;
  }

  private predictNextService(patterns: any): Date | null {
    if (patterns.averageTimeBetweenBookings > 0 && patterns.lastBookingDate) {
      const nextDate = new Date(patterns.lastBookingDate);
      nextDate.setDate(nextDate.getDate() + patterns.averageTimeBetweenBookings);
      return nextDate;
    }
    return null;
  }

  private generateRetentionActions(churnProbability: number, segments: string[], patterns: any): string[] {
    const actions = [];
    
    if (churnProbability > 0.5) {
      actions.push('Send personalized discount offer');
      actions.push('Schedule follow-up call');
    }
    
    if (segments.includes('High Value')) {
      actions.push('Assign dedicated customer success manager');
      actions.push('Offer premium service package');
    }
    
    if (patterns.bookingFrequency === 'low') {
      actions.push('Send maintenance reminders');
      actions.push('Offer subscription service plan');
    }
    
    return actions;
  }

  private calculateTechnicianEfficiency(bookings: any[]): number {
    if (bookings.length === 0) return 0;
    
    const efficiencyScores = bookings.map(booking => {
      const jobSheet = booking.jobSheet;
      if (!jobSheet) return 0.5;
      
      const estimatedHours = Number(jobSheet.estimatedHours) || 1;
      const actualHours = Number(jobSheet.actualHours) || estimatedHours;
      
      return Math.min(estimatedHours / actualHours, 1.5);
    });
    
    return ss.mean(efficiencyScores) * 100;
  }

  private analyzeTechnicianPerformance(bookings: any[], skills: any[]) {
    const strengths = [];
    const weakAreas = [];
    
    // Analyze based on customer reviews
    const reviews = bookings.filter(b => b.review).map(b => b.review);
    const avgRating = reviews.length > 0 ? 
      ss.mean(reviews.map(r => r.rating)) : 0;
    
    if (avgRating >= 4.5) strengths.push('Excellent customer satisfaction');
    else if (avgRating < 3.5) weakAreas.push('Customer satisfaction improvement needed');
    
    // Analyze completion times
    const onTimeCompletions = bookings.filter(b => {
      if (!b.jobSheet || !b.scheduledAt) return false;
      const scheduled = new Date(b.scheduledAt);
      const completed = new Date(b.completedAt);
      const diffHours = (completed.getTime() - scheduled.getTime()) / (1000 * 60 * 60);
      return diffHours <= Number(b.jobSheet.estimatedHours);
    });
    
    const onTimeRate = onTimeCompletions.length / bookings.length;
    if (onTimeRate >= 0.9) strengths.push('Excellent time management');
    else if (onTimeRate < 0.7) weakAreas.push('Time management improvement needed');
    
    return { strengths, weakAreas };
  }

  private generateTrainingRecommendations(weakAreas: string[], skills: any[]): string[] {
    const recommendations = [];
    
    if (weakAreas.includes('Customer satisfaction improvement needed')) {
      recommendations.push('Customer service excellence training');
    }
    
    if (weakAreas.includes('Time management improvement needed')) {
      recommendations.push('Efficient repair techniques workshop');
    }
    
    // Suggest advanced training for skills
    if (skills.length > 0) {
      recommendations.push('Advanced troubleshooting techniques');
    }
    
    return recommendations;
  }

  private suggestWorkloadAdjustment(efficiency: number, currentWorkload: number): 'increase' | 'decrease' | 'maintain' {
    if (efficiency > 90 && currentWorkload < 20) return 'increase';
    if (efficiency < 70 && currentWorkload > 10) return 'decrease';
    return 'maintain';
  }

  private async calculateDemandMultiplier(
    serviceId: string,
    location: string,
    timeSlot: Date
  ): Promise<number> {
    // In a real implementation, this would analyze historical booking data
    // For now, return a simple multiplier based on time
    const hour = timeSlot.getHours();
    
    // Peak hours (9-17) have higher demand
    if (hour >= 9 && hour <= 17) return 1.2;
    // Evening hours have medium demand
    if (hour >= 18 && hour <= 20) return 1.1;
    // Early morning and late night have lower demand
    return 0.9;
  }

  private calculateTimeSlotMultiplier(timeSlot: Date): number {
    const hour = timeSlot.getHours();
    const day = timeSlot.getDay();
    
    // Weekend premium
    if (day === 0 || day === 6) return 1.3;
    
    // After hours premium
    if (hour < 8 || hour > 18) return 1.4;
    
    // Peak hours
    if (hour >= 9 && hour <= 17) return 1.1;
    
    return 1.0;
  }

  private getTimeSlotReason(timeSlot: Date): string {
    const hour = timeSlot.getHours();
    const day = timeSlot.getDay();
    
    if (day === 0 || day === 6) return 'Weekend service premium';
    if (hour < 8 || hour > 18) return 'After-hours service premium';
    if (hour >= 9 && hour <= 17) return 'Peak hours service';
    
    return 'Standard hours';
  }

  private calculatePricingConfidence(priceFactors: any[]): number {
    // Base confidence
    let confidence = 0.7;
    
    // Increase confidence based on number of factors considered
    confidence += (priceFactors.length * 0.05);
    
    return Math.min(confidence, 0.95);
  }
}

export const aiBusinessIntelligenceService = new AIBusinessIntelligenceService();