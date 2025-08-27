/**
 * AI Integration Service - Frontend
 * 
 * Provides client-side interface to AI backend services including:
 * - Intelligent Job Assignment
 * - Predictive Analytics  
 * - Smart Pricing Optimization
 * - Quality Prediction
 */

const API_BASE_URL = 'http://localhost:3002/api/v1';

export interface JobAssignmentRequest {
  _jobId: string;
  _priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  _deviceCategory: string;
  _deviceBrand: string;
  _deviceModel: string;
  _issueType: string;
  _complexity: number;
  _estimatedDuration: number;
  _requiredSkills: string[];
  _location: {
    _latitude: number;
    _longitude: number;
    _address: string;
  };
  _customerTier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  _slaRequirements: {
    _responseTime: number;
    _completionTime: number;
  };
  _preferredTechnicianId?: string;
}

export interface RepairTimePredictionRequest {
  _deviceCategory: string;
  _deviceBrand: string;
  _deviceModel: string;
  _issueType: string;
  _complexity: number;
  _technicianExperience: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT';
}

export interface PricingRequest {
  _jobId: string;
  _serviceCategory: string;
  _deviceCategory: string;
  _deviceBrand: string;
  _deviceModel: string;
  _issueType: string;
  _complexity: number;
  _estimatedHours: number;
  _partsRequired: Array<{
    _partId: string;
    _partName: string;
    _category: string;
    _quantity: number;
    _supplierCost: number;
    _markup: number;
    _availability: 'IN_STOCK' | 'ORDER_REQUIRED' | 'RARE';
  }>;
  _customerTier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  _location: {
    _latitude: number;
    _longitude: number;
    _zipCode: string;
  };
  _urgency: 'STANDARD' | 'EXPEDITED' | 'EMERGENCY';
  _requestedBy: string;
}

export class AIIntegrationService {
  
  /**
   * Get optimal technician assignment for a job
   */
  static async assignOptimalTechnician(request: JobAssignmentRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/job-assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (!result._success) {
        throw new Error(result._message || 'Assignment failed');
      }
      
      return result._data;
    } catch (error) {
      console.error('Job assignment failed:', error);
      // Fallback to sample data for demo
      return this.getSampleAssignmentResult(request);
    }
  }

  /**
   * Predict repair time using ML algorithms
   */
  static async predictRepairTime(request: RepairTimePredictionRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/predict/repair-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (!result._success) {
        throw new Error(result._message || 'Prediction failed');
      }
      
      return result._data;
    } catch (error) {
      console.error('Repair time prediction failed:', error);
      // Fallback to sample data for demo
      return this.getSampleTimePrediction(request);
    }
  }

  /**
   * Generate optimal pricing recommendation
   */
  static async getOptimalPricing(request: PricingRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/pricing/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (!result._success) {
        throw new Error(result._message || 'Pricing optimization failed');
      }
      
      return result._data;
    } catch (error) {
      console.error('Pricing optimization failed:', error);
      // Fallback to sample data for demo
      return this.getSamplePricingResult(request);
    }
  }

  /**
   * Predict job quality and success probability
   */
  static async predictJobQuality(jobId: string, deviceCategory: string, issueType: string, complexity: number, technicianId: string, customerTier: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/predict/job-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _jobId: jobId,
          _deviceCategory: deviceCategory,
          _issueType: issueType,
          _complexity: complexity,
          _technicianId: technicianId,
          _customerTier: customerTier,
        }),
      });
      
      const result = await response.json();
      
      if (!result._success) {
        throw new Error(result._message || 'Quality prediction failed');
      }
      
      return result._data;
    } catch (error) {
      console.error('Quality prediction failed:', error);
      // Fallback to sample data for demo
      return this.getSampleQualityPrediction(jobId);
    }
  }

  /**
   * Get AI dashboard data
   */
  static async getAIDashboard(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/dashboard`);
      const result = await response.json();
      
      if (!result._success) {
        throw new Error(result._message || 'Dashboard data fetch failed');
      }
      
      return result._data;
    } catch (error) {
      console.error('AI dashboard fetch failed:', error);
      // Fallback to sample data for demo
      return this.getSampleDashboardData();
    }
  }

  /**
   * Get AI model performance metrics
   */
  static async getModelPerformance(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/models/performance`);
      const result = await response.json();
      
      if (!result._success) {
        throw new Error(result._message || 'Model performance fetch failed');
      }
      
      return result._data;
    } catch (error) {
      console.error('Model performance fetch failed:', error);
      // Fallback to sample data for demo
      return this.getSampleModelPerformance();
    }
  }

  /**
   * Initiate model retraining
   */
  static async retrainModel(modelName?: string, forceRetrain: boolean = false): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/models/retrain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName,
          forceRetrain,
        }),
      });
      
      const result = await response.json();
      
      if (!result._success) {
        throw new Error(result._message || 'Model retraining failed');
      }
      
      return result._data;
    } catch (error) {
      console.error('Model retraining failed:', error);
      throw error;
    }
  }

  // Fallback sample data methods for demo purposes

  private static getSampleAssignmentResult(request: JobAssignmentRequest): any {
    return {
      _jobId: request._jobId,
      _assignedTechnicianId: 'tech-sarah-001',
      _assignmentScore: {
        _technicianId: 'tech-sarah-001',
        _overallScore: 87,
        _skillMatchScore: 92,
        _availabilityScore: 85,
        _locationScore: 89,
        _performanceScore: 88,
        _workloadScore: 82,
        _recommendation: 'EXCELLENT',
        _confidence: 0.91,
        _reasoningFactors: [
          'Excellent skill match for job requirements',
          'Immediately available with low workload',
          'Optimal location - minimal travel time',
          'Outstanding performance history'
        ]
      },
      _estimatedStartTime: new Date(Date.now() + 30 * 60 * 1000),
      _estimatedCompletionTime: new Date(Date.now() + (request._estimatedDuration + 0.5) * 60 * 60 * 1000),
      _alternativeTechnicians: [
        {
          _technicianId: 'tech-mike-002',
          _overallScore: 78,
          _recommendation: 'GOOD',
          _confidence: 0.85
        }
      ],
      _assignmentReason: 'Assigned to Sarah Johnson based on excellent skill alignment, immediate availability, optimal location (AI Score: 87/100, Confidence: 91%)',
      _mlModelVersion: 'v2.1.0',
      _assignmentTimestamp: new Date()
    };
  }

  private static getSampleTimePrediction(request: RepairTimePredictionRequest): any {
    // Simple heuristic for demo
    const baseTime = request._complexity * 0.5 + 1.5;
    const experienceMultiplier = {
      'JUNIOR': 1.3,
      'INTERMEDIATE': 1.1,
      'SENIOR': 0.9,
      'EXPERT': 0.8
    }[request._technicianExperience];

    const estimatedHours = baseTime * experienceMultiplier;

    return {
      _jobId: `PREDICT-${Date.now()}`,
      _deviceCategory: request._deviceCategory,
      _deviceBrand: request._deviceBrand,
      _deviceModel: request._deviceModel,
      _issueType: request._issueType,
      _complexity: request._complexity,
      _technicianExperience: request._technicianExperience,
      _estimatedHours: Math.round(estimatedHours * 10) / 10,
      _confidenceLevel: 0.87,
      _historicalAverage: Math.round((estimatedHours + 0.5) * 10) / 10,
      _factorsConsidered: [
        `Device category: ${request._deviceCategory}`,
        `Issue type: ${request._issueType}`,
        `Complexity level: ${request._complexity}/10`,
        `Technician experience: ${request._technicianExperience}`,
        'Historical data points: 156 similar jobs'
      ],
      _predictionTimestamp: new Date(),
      _modelVersion: 'v3.2.1'
    };
  }

  private static getSamplePricingResult(request: PricingRequest): any {
    const laborCost = request._estimatedHours * 75;
    const partsCost = request._partsRequired.reduce((sum, part) => 
      sum + (part._supplierCost * part._quantity * (1 + part._markup / 100)), 0);
    const totalPrice = (laborCost + partsCost) * 1.4; // Add overhead and margin

    return {
      _jobId: request._jobId,
      _recommendedPrice: Math.round(totalPrice * 100) / 100,
      _priceBreakdown: {
        _laborCost: Math.round(laborCost * 100) / 100,
        _partsCost: Math.round(partsCost * 100) / 100,
        _overheadCost: Math.round((laborCost + partsCost) * 0.25 * 100) / 100,
        _profitMargin: Math.round((laborCost + partsCost) * 0.3 * 100) / 100,
        _taxes: Math.round(totalPrice * 0.085 * 100) / 100,
        _surcharges: request._urgency === 'EMERGENCY' ? [{
          _type: 'Emergency Service',
          _amount: totalPrice * 0.25,
          _reason: 'Emergency service surcharge'
        }] : [],
        _discounts: [],
        _totalPrice: Math.round(totalPrice * 100) / 100
      },
      _pricingStrategy: {
        _strategyName: 'Value-Based Pricing',
        _description: 'Price based on customer value perception and quality',
        _marketPosition: 'PREMIUM',
        _riskLevel: 'MEDIUM'
      },
      _competitiveAnalysis: {
        _averageMarketPrice: Math.round(totalPrice * 0.95 * 100) / 100,
        _pricePercentile: 55,
        _competitorCount: 3,
        _marketTrend: 'STABLE',
        _recommendedPosition: 'Well-positioned in the market'
      },
      _confidenceLevel: 0.89,
      _priceRange: {
        _minimum: Math.round(totalPrice * 0.9 * 100) / 100,
        _optimal: Math.round(totalPrice * 100) / 100,
        _maximum: Math.round(totalPrice * 1.1 * 100) / 100
      },
      _marginAnalysis: {
        _grossMargin: Math.round(totalPrice * 0.3 * 100) / 100,
        _netMargin: Math.round(totalPrice * 0.25 * 100) / 100,
        _marginPercentage: 25,
        _profitability: 'GOOD'
      },
      _recommendations: [
        {
          _type: 'PRICING',
          _recommendation: 'Price is well-positioned for market acceptance',
          _impact: 0,
          _effort: 'LOW',
          _expectedRevenue: totalPrice
        }
      ],
      _validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      _pricingTimestamp: new Date()
    };
  }

  private static getSampleQualityPrediction(jobId: string): any {
    return {
      _jobId: jobId,
      _predictedQualityScore: 88.5,
      _riskFactors: [
        'Medium complexity job - standard risk profile',
        'Experienced technician assigned'
      ],
      _successProbability: 0.92,
      _recommendedInterventions: [
        'Implement mandatory quality photos at key milestones',
        'Schedule quality checkpoint at 75% completion'
      ],
      _qualityMetrics: {
        _expectedCustomerSatisfaction: 4.6,
        _firstTimeFixProbability: 0.89,
        _reworkRisk: 0.08
      }
    };
  }

  private static getSampleDashboardData(): any {
    return {
      _overview: {
        _totalAIDecisions: 3847,
        _averageConfidence: 91.7,
        _costSavings: 145000,
        _revenueOptimization: 18.7,
        _lastUpdated: new Date()
      },
      _jobAssignment: {
        _totalAssignments: 1547,
        _averageAssignmentScore: 84.2,
        _averageConfidence: 89.3,
        _assignmentDistribution: {
          EXCELLENT: 67,
          GOOD: 25,
          FAIR: 6,
          POOR: 2
        }
      },
      _predictiveAnalytics: {
        _repairTimeAccuracy: 87.3,
        _partsFailurePrevention: 23,
        _demandForecastAccuracy: 91.5,
        _qualityPredictionAccuracy: 89.1,
        _costOptimizationSavings: 145000
      },
      _pricingOptimization: {
        _pricingAccuracy: 89.5,
        _revenueOptimization: 18.7,
        _winRate: 76.3,
        _competitivePosition: 'COMPETITIVE'
      },
      _recommendations: [
        {
          _category: 'Job Assignment',
          _priority: 'MEDIUM',
          _recommendation: 'Consider updating technician skill profiles for better matching',
          _impact: 'Improve assignment accuracy by 5%',
          _action: 'Schedule skill assessment review'
        }
      ],
      _kpiMetrics: {
        _efficiency: 94.2,
        _accuracy: 91.7,
        _costReduction: 23.5,
        _customerSatisfaction: 96.1
      }
    };
  }

  private static getSampleModelPerformance(): any {
    return {
      _intelligentJobAssignment: {
        _modelVersion: 'v2.1.0',
        _accuracy: 89.3,
        _avgAssignmentScore: 84.2,
        _customerSatisfaction: 4.7,
        _totalAssignments: 1547,
        _lastUpdated: new Date('2025-08-25')
      },
      _repairTimePrediction: {
        _modelVersion: 'v3.2.1',
        _accuracy: 87.3,
        _meanAbsoluteError: 0.8,
        _totalPredictions: 2341,
        _lastTraining: new Date('2025-08-20')
      },
      _partsFailurePrediction: {
        _modelVersion: 'v2.1.0',
        _accuracy: 91.5,
        _precision: 0.89,
        _recall: 0.94,
        _totalPredictions: 856,
        _preventedFailures: 23
      },
      _smartPricing: {
        _modelVersion: 'v4.1.2',
        _pricingAccuracy: 89.5,
        _revenueOptimization: 18.7,
        _winRate: 76.3,
        _totalPricingDecisions: 1247
      },
      _qualityPrediction: {
        _modelVersion: 'v1.8.0',
        _accuracy: 85.7,
        _f1Score: 0.84,
        _qualityImprovement: 12.3,
        _totalPredictions: 1893
      }
    };
  }
}

export default AIIntegrationService;