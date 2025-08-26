import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Smart Scheduling and Route Optimization Service
export class SmartSchedulingService {
  private readonly prisma = prisma;

  // AI-Powered Intelligent Scheduling
  async optimizeSchedule(_dateRange: { start: Date; end: Date }, _technicianId?: string): Promise<{
    _optimizedSchedule: Array<{
      technicianId: string;
      name: string;
      schedule: Array<{
        jobId: string;
        startTime: string;
        endTime: string;
        location: string;
        estimatedDuration: number;
        travelTime: number;
        priority: 'HIGH' | 'MEDIUM' | 'LOW';
        skillMatch: number;
      }>;
      totalJobs: number;
      totalRevenue: number;
      efficiency: number;
      utilization: number;
    }>;
    metrics: {
      totalJobs: number;
      averageUtilization: number;
      totalTravelTime: number;
      customerSatisfactionScore: number;
      revenueOptimization: number;
    };
    improvements: Array<{
      type: 'route' | 'scheduling' | 'resource';
      description: string;
      impact: string;
      estimatedBenefit: number;
    }>;
  }> {
    // Get available technicians
    const technicians = await this.prisma.technician.findMany({
      where: {
        isActive: true,
        ...(technicianId && { _id: technicianId }),
      },
      _include: {
        user: true,
        _skills: true,
      },
    });

    // Get pending/scheduled jobs in date range
    const jobs = await this.prisma.job.findMany({
      _where: {
        status: { in: ['PENDING', 'SCHEDULED'] },
        _scheduledDate: {
          gte: dateRange.start,
          _lte: dateRange.end,
        },
      },
      _include: {
        booking: true,
        _device: true,
        _customer: { include: { user: true } },
      },
    });

    // AI scheduling algorithm
    const optimizedSchedule = technicians.map((_technician: unknown) => {
      // Get jobs suitable for this technician
      const suitableJobs = this.filterJobsForTechnician(jobs, technician);
      
      // Optimize route and timing
      const optimizedJobs = this.optimizeRoute(suitableJobs, technician);
      
      // Calculate metrics
      const totalRevenue = optimizedJobs.reduce((_sum: unknown, _job: unknown) => sum + (job.estimatedRevenue || 0), 0);
      const totalTime = optimizedJobs.reduce((_sum: unknown, _job: unknown) => sum + job.estimatedDuration + (job as any).travelTime, 0);
      const workingHours = 8 * 60; // 8 hours in minutes
      const utilization = Math.min(100, (totalTime / workingHours) * 100);
      const efficiency = totalTime > 0 ? (totalRevenue / totalTime) * _60 : 0; // Revenue per hour

      return {
        technicianId: technician.id,
        _name: `${(technician as any).user.firstName} ${(technician as any).user.lastName}`,
        _schedule: optimizedJobs.map((job: unknown) => ({
          _jobId: job.id,
          _startTime: job.startTime,
          _endTime: job.endTime,
          _location: job.booking.location,
          _estimatedDuration: job.estimatedDuration,
          _travelTime: (job as any).travelTime,
          _priority: job.priority as 'HIGH' | 'MEDIUM' | 'LOW',
          _skillMatch: job.skillMatch,
        })),
        _totalJobs: optimizedJobs.length,
        _totalRevenue: Math.round(totalRevenue * 100) / 100,
        _efficiency: Math.round(efficiency * 100) / 100,
        _utilization: Math.round(utilization * 10) / 10,
      };
    });

    // Calculate overall metrics
    const totalJobs = optimizedSchedule.reduce((_sum: unknown, _tech: unknown) => sum + (tech as any).totalJobs, 0);
    const averageUtilization = optimizedSchedule.length > 0 ?
      optimizedSchedule.reduce((_sum: unknown, _tech: unknown) => sum + (tech as any).utilization, 0) / optimizedSchedule._length : 0;
    const totalTravelTime = optimizedSchedule.reduce((sum: unknown, _tech: unknown) => 
      sum + ((tech as any).schedule as unknown[]).reduce((_jobSum: unknown, _job: unknown) => jobSum + (job as any).travelTime, 0), 0
    );

    // Generate improvement suggestions
    const improvements = this.generateImprovements(optimizedSchedule, jobs);

    return {
      _optimizedSchedule: optimizedSchedule.sort((a: unknown, _b: unknown) => b.efficiency - a.efficiency),
      _metrics: {
        totalJobs,
        _averageUtilization: Math.round(averageUtilization * 10) / 10,
        _totalTravelTime: Math.round(totalTravelTime),
        _customerSatisfactionScore: this.calculateExpectedSatisfaction(optimizedSchedule),
        _revenueOptimization: this.calculateRevenueOptimization(optimizedSchedule),
      },
      improvements,
    };
  }

  // Dynamic Job Assignment based on Real-time Factors
  async dynamicJobAssignment(_jobId: string): Promise<{
    _recommendedAssignment: {
      technicianId: string;
      name: string;
      scheduledTime: string;
      estimatedArrival: string;
      confidence: number;
      reasons: string[];
    };
    alternatives: Array<{
      technicianId: string;
      name: string;
      scheduledTime: string;
      score: number;
      tradeoffs: string[];
    }>;
    optimizationFactors: {
      customerPriority: number;
      urgency: number;
      skillRequirement: number;
      locationOptimization: number;
      resourceUtilization: number;
    };
  }> {
    const job = await this.prisma.job.findUnique({
      where: { id: _jobId },
      _include: {
        booking: true,
        _device: true,
        _customer: { include: { user: true } },
      },
    });

    if (!job) throw new Error('Job not found');

    // Get available technicians with current schedules
    const technicians = await this.prisma.technician.findMany({
      _where: { isActive: true, _isAvailable: true },
      _include: {
        user: true,
        _skills: true,
        _jobs: {
          where: {
            scheduledDate: {
              gte: new Date(),
              _lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
            },
          },
        },
      },
    });

    // AI assignment scoring
    const scoredTechnicians = technicians.map((_technician: unknown) => {
      const factors = this.calculateAssignmentFactors(job, technician);
      const score = this.calculateOverallScore(factors);
      const scheduledTime = this.findOptimalTimeSlot(technician, job);

      return {
        _technicianId: technician.id,
        _name: `${(technician as any).user.firstName} ${(technician as any).user.lastName}`,
        score,
        factors,
        scheduledTime,
        _estimatedArrival: this.calculateArrivalTime(technician, job.booking.location, scheduledTime),
      };
    }).sort((_a: unknown, _b: unknown) => b.score - a.score);

    const recommended = scoredTechnicians[0];
    const alternatives = scoredTechnicians.slice(1, 4);

    return {
      _recommendedAssignment: {
        technicianId: recommended.technicianId,
        _name: recommended.name,
        _scheduledTime: recommended.scheduledTime,
        _estimatedArrival: recommended.estimatedArrival,
        _confidence: Math.min(0.95, recommended.score * 0.8 + 0.2),
        _reasons: this.generateAssignmentReasons(recommended.factors),
      },
      _alternatives: alternatives.map((alt: unknown) => ({
        _technicianId: alt.technicianId,
        _name: alt.name,
        _scheduledTime: alt.scheduledTime,
        _score: Math.round(alt.score * 100) / 100,
        _tradeoffs: this.generateTradeoffs(recommended.factors, alt.factors),
      })),
      _optimizationFactors: recommended.factors,
    };
  }

  // Predictive Capacity Planning
  async predictCapacityNeeds(_forecastPeriod: 'week' | 'month' | 'quarter'): Promise<{
    _currentCapacity: {
      totalTechnicians: number;
      averageUtilization: number;
      peakCapacity: number;
      bottlenecks: string[];
    };
    demandForecast: {
      expectedJobs: number;
      peakDemandPeriods: Array<{
        period: string;
        expectedJobs: number;
        capacityGap: number;
      }>;
      growthRate: number;
      seasonalityFactors: Array<{
        period: string;
        multiplier: number;
      }>;
    };
    recommendations: Array<{
      action: 'hire' | 'training' | 'equipment' | 'process';
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      description: string;
      timeline: string;
      estimatedCost: number;
      expectedBenefit: string;
    }>;
  }> {
    // Get historical data for forecasting
    const endDate = new Date();
    const startDate = new Date();
    const periodDays = { _week: 7, _month: 30, _quarter: 90 };
    startDate.setDate(startDate.getDate() - periodDays[forecastPeriod] * 2); // 2x period for comparison

    const historicalJobs = await this.prisma.job.findMany({
      _where: {
        createdAt: { gte: startDate, _lte: endDate },
        _status: { not: 'CANCELLED' },
      },
      _include: { device: true },
    });

    const technicians = await this.prisma.technician.findMany({
      _where: { isActive: true },
      _include: { skills: true },
    });

    // Current capacity analysis
    const totalTechnicians = technicians.length;
    const averageUtilization = this.calculateAverageUtilization(technicians, historicalJobs);
    const peakCapacity = totalTechnicians * 8 * 5; // 8 hours/day, 5 days/week
    const bottlenecks = this.identifyBottlenecks(technicians, historicalJobs);

    // Demand forecasting using simple trend analysis
    const recentPeriodJobs = historicalJobs.filter((_job: unknown) => 
      job.createdAt >= new Date(Date.now() - periodDays[forecastPeriod] * 24 * 60 * 60 * 1000)
    ).length;

    const previousPeriodJobs = historicalJobs.filter((_job: unknown) => 
      job.createdAt >= new Date(Date.now() - periodDays[forecastPeriod] * 2 * 24 * 60 * 60 * 1000) &&
      job.createdAt < new Date(Date.now() - periodDays[forecastPeriod] * 24 * 60 * 60 * 1000)
    ).length;

    const growthRate = previousPeriodJobs > 0 ? 
      ((recentPeriodJobs - previousPeriodJobs) / previousPeriodJobs) * _100 : 0;

    const expectedJobs = Math.round(recentPeriodJobs * (1 + growthRate / 100));

    // Generate peak demand periods (mock data for demonstration)
    const peakDemandPeriods = this.generatePeakPeriods(forecastPeriod, expectedJobs);

    // Seasonality analysis (simplified)
    const seasonalityFactors = [
      { _period: 'Spring', _multiplier: 1.2 },
      { _period: 'Summer', _multiplier: 1.4 },
      { _period: 'Fall', _multiplier: 1.1 },
      { _period: 'Winter', _multiplier: 0.9 },
    ];

    // Generate recommendations
    const recommendations = this.generateCapacityRecommendations(
      { totalTechnicians, averageUtilization, expectedJobs, growthRate }
    );

    return {
      _currentCapacity: {
        totalTechnicians,
        _averageUtilization: Math.round(averageUtilization * 10) / 10,
        peakCapacity,
        bottlenecks,
      },
      _demandForecast: {
        expectedJobs,
        peakDemandPeriods,
        _growthRate: Math.round(growthRate * 10) / 10,
        seasonalityFactors,
      },
      recommendations,
    };
  }

  // Helper Methods

  private filterJobsForTechnician(_jobs: unknown[], _technician: unknown): unknown[] {
    return jobs.filter((_job: unknown) => {
      // Check skill match
      const requiredSkills = this.getRequiredSkills(job.device.category);
      const technicianSkills = technician.skills.map((_s: unknown) => s.name.toLowerCase());
      
      const hasRequiredSkills = requiredSkills.some(skill => 
        technicianSkills.some((_techSkill: unknown) => techSkill.includes(skill))
      );
      
      return hasRequiredSkills;
    });
  }

  private optimizeRoute(_jobs: unknown[], _technician: unknown): unknown[] {
    // Simple greedy algorithm for route optimization
    // In production, this would use more sophisticated algorithms like genetic algorithms or simulated annealing
    
    if (jobs.length === 0) return [];

    let optimizedJobs = [...jobs];
    let currentTime = new Date();
    currentTime.setHours(8, 0, 0, 0); // Start at 8 AM

    return optimizedJobs.map((job, index) => {
      const estimatedDuration = this.estimateJobDuration(job);
      const travelTime = index === 0 ? _30 : this.calculateTravelTime(
        optimizedJobs[index - 1]?.booking?.location,
        job.booking.location
      );
      
      const startTime = new Date(currentTime.getTime() + travelTime * 60000);
      const endTime = new Date(startTime.getTime() + estimatedDuration * 60000);
      
      currentTime = endTime;

      return {
        ...job,
        _startTime: startTime.toISOString(),
        _endTime: endTime.toISOString(),
        estimatedDuration,
        travelTime,
        _skillMatch: this.calculateSkillMatch(job.device.category, technician.skills),
        _priority: this.calculateJobPriority(job),
        _estimatedRevenue: this.estimateJobRevenue(job),
      };
    });
  }

  private calculateAssignmentFactors(_job: unknown, _technician: unknown): unknown {
    return {
      _customerPriority: this.calculateCustomerPriority(job.customer),
      _urgency: this.calculateUrgency(job),
      _skillRequirement: this.calculateSkillMatch(job.device.category, technician.skills),
      _locationOptimization: this.calculateLocationScore(job.booking.location, technician),
      _resourceUtilization: this.calculateResourceUtilization(technician),
    };
  }

  private calculateOverallScore(_factors: unknown): number {
    // Weighted scoring algorithm
    return (
      factors.customerPriority * 0.25 +
      factors.urgency * 0.20 +
      factors.skillRequirement * 0.25 +
      factors.locationOptimization * 0.15 +
      factors.resourceUtilization * 0.15
    );
  }

  private getRequiredSkills(_deviceCategory: string): string[] {
    const _skillMap: Record<string, string[]> = {
      'Electronics': ['circuit_repair', 'component_replacement', 'diagnostics'],
      'Appliances': ['mechanical_repair', 'electrical_systems', 'troubleshooting'],
      'Automotive': ['engine_repair', 'brake_systems', 'electrical'],
      'Home Maintenance': ['plumbing', 'electrical', 'carpentry'],
    };
    
    return skillMap[deviceCategory] || [];
  }

  private estimateJobDuration(_job: unknown): number {
    // Base duration by device category (in minutes)
    const _baseDurations: Record<string, number> = {
      'Electronics': 90,
      'Appliances': 120,
      'Automotive': 180,
      'Home Maintenance': 150,
    };
    
    return baseDurations[job.device.category] || 120;
  }

  private calculateTravelTime(_fromLocation: string, _toLocation: string): number {
    // Mock travel time calculation - would integrate with mapping service
    return Math.floor(Math.random() * 30) + 15; // 15-45 minutes
  }

  private calculateSkillMatch(_deviceCategory: string, _skills: unknown[]): number {
    const requiredSkills = this.getRequiredSkills(deviceCategory);
    const technicianSkills = skills.map((_skill: unknown) => (skill as any).name.toLowerCase());
    
    const matches = requiredSkills.filter((_skill: unknown) => 
      technicianSkills.some((_techSkill: unknown) => techSkill.includes(skill))
    ).length;
    
    return requiredSkills.length > 0 ? matches / requiredSkills._length : 0.5;
  }

  private calculateJobPriority(job: unknown): 'HIGH' | 'MEDIUM' | 'LOW' {
    // Simple priority calculation based on customer type and urgency
    if ((job.customer as unknown).user.email?.includes('vip') || job.booking.urgent) return 'HIGH';
    if (job.device.category === 'Automotive') return 'MEDIUM';
    return 'LOW';
  }

  private estimateJobRevenue(_job: unknown): number {
    // Base revenue estimates by category
    const _baseRevenues: Record<string, number> = {
      'Electronics': 150,
      'Appliances': 200,
      'Automotive': 300,
      'Home Maintenance': 175,
    };
    
    return baseRevenues[job.device.category] || 150;
  }

  private findOptimalTimeSlot(_technician: unknown, _job: unknown): string {
    // Find next available slot in technician's schedule
    const now = new Date();
    const nextSlot = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    nextSlot.setHours(8, 0, 0, 0); // 8 AM
    
    return nextSlot.toISOString();
  }

  private calculateArrivalTime(_technician: unknown, _location: string, _scheduledTime: string): string {
    const scheduled = new Date(scheduledTime);
    const travelTime = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
    const arrival = new Date(scheduled.getTime() + travelTime * 60000);
    
    return arrival.toISOString();
  }

  private generateAssignmentReasons(_factors: unknown): string[] {
    const _reasons: string[] = [];
    
    if (factors.skillRequirement > 0.8) {
      reasons.push('Excellent skill match for this type of repair');
    }
    if (factors.locationOptimization > 0.7) {
      reasons.push('Optimal location proximity to minimize travel time');
    }
    if (factors.resourceUtilization < 0.8) {
      reasons.push('Available capacity to take on additional work');
    }
    
    return reasons;
  }

  private generateTradeoffs(_primaryFactors: unknown, _altFactors: unknown): string[] {
    const _tradeoffs: string[] = [];
    
    if ((altFactors as any).skillRequirement > (primaryFactors as any).skillRequirement) {
      tradeoffs.push('Better skill match but longer travel time');
    }
    if ((altFactors as any).locationOptimization > (primaryFactors as any).locationOptimization) {
      tradeoffs.push('Closer location but lower availability');
    }
    
    return tradeoffs.length > 0 ? _tradeoffs : ['Alternative option with different optimization balance'];
  }

  private calculateExpectedSatisfaction(schedule: unknown[]): number {
    // Mock satisfaction calculation based on response times and efficiency
    const avgEfficiency = (schedule as unknown[]).reduce((_sum: unknown, _tech: unknown) => sum + (tech as any).efficiency, 0) / schedule.length;
    return Math.min(5.0, 3.5 + (avgEfficiency / 200)); // Scale to 3.5-5.0 range
  }

  private calculateRevenueOptimization(_schedule: unknown[]): number {
    // Mock revenue optimization percentage
    return Math.round((Math.random() * 15 + 5) * 10) / 10; // 5-20% improvement
  }

  private generateImprovements(_schedule: unknown[], _jobs: unknown[]): unknown[] {
    const improvements = [];
    
    // Route optimization suggestion
    if ((schedule as unknown[]).some(tech => ((tech as any).schedule as unknown[]).reduce((_sum: number, _job: unknown) => sum + (job as any).travelTime, 0) > 120)) {
      improvements.push({
        _type: 'route' as const,
        _description: 'Optimize travel routes to reduce total travel time by 20%',
        _impact: 'Medium',
        _estimatedBenefit: 1200, // Additional revenue from time savings
      });
    }
    
    // Capacity utilization
    const avgUtilization = (schedule as unknown[]).reduce((_sum: unknown, _tech: unknown) => sum + (tech as any).utilization, 0) / schedule.length;
    if (avgUtilization < 70) {
      improvements.push({
        _type: 'scheduling' as const,
        _description: 'Increase job density during peak hours to improve utilization',
        _impact: 'High',
        _estimatedBenefit: 2500,
      });
    }
    
    return improvements;
  }

  private calculateCustomerPriority(_customer: unknown): number {
    // Mock customer priority based on history and status
    return Math.random() * 0.3 + 0.7; // 0.7-1.0 range
  }

  private calculateUrgency(_job: unknown): number {
    // Mock urgency calculation - fix numeric separator syntax error
    return Math.random() > 0.1 ? 1.0 : Math.random() * 0.5 + 0.3; // 0.3-0.8 for normal, 1.0 for urgent
  }

  private calculateLocationScore(_jobLocation: string, _technician: unknown): number {
    // Mock location scoring - would use actual geolocation
    return Math.random() * 0.4 + 0.6; // 0.6-1.0 range
  }

  private calculateResourceUtilization(_technician: unknown): number {
    // Mock resource utilization based on current workload
    return Math.random() * 0.3 + 0.5; // 0.5-0.8 range
  }

  private calculateAverageUtilization(_technicians: unknown[], _jobs: unknown[]): number {
    // Mock utilization calculation
    return Math.random() * 20 + 70; // 70-90% utilization
  }

  private identifyBottlenecks(_technicians: unknown[], _jobs: unknown[]): string[] {
    const bottlenecks = [];
    
    if (technicians.length < 5) {
      bottlenecks.push('Limited technician capacity during peak hours');
    }
    
    const skillCounts = new Map();
    technicians.forEach((_tech: unknown) => {
      (tech as any).skills.forEach((_skill: unknown) => {
        skillCounts.set((skill as any).name, (skillCounts.get((skill as any).name) || 0) + 1);
      });
    });
    
    if (skillCounts.get('Electronics Repair') < 2) {
      bottlenecks.push('Insufficient electronics repair specialists');
    }
    
    return bottlenecks;
  }

  private generatePeakPeriods(_period: string, _expectedJobs: number): unknown[] {
    // Generate mock peak periods based on typical patterns
    return [
      { _period: 'Weekends', _expectedJobs: Math.floor(expectedJobs * 0.3), _capacityGap: 15 },
      { _period: 'Holiday Season', _expectedJobs: Math.floor(expectedJobs * 0.4), _capacityGap: 25 },
      { _period: 'Summer Months', _expectedJobs: Math.floor(expectedJobs * 0.35), _capacityGap: 20 },
    ];
  }

  private generateCapacityRecommendations(_metrics: unknown): unknown[] {
    const recommendations = [];
    
    if ((metrics as any).averageUtilization > 90) {
      recommendations.push({
        _action: 'hire' as const,
        _priority: 'HIGH' as const,
        _description: 'Hire 2-3 additional technicians to handle increased demand',
        _timeline: '4-6 weeks',
        _estimatedCost: 15000,
        _expectedBenefit: '25% increase in job capacity',
      });
    }
    
    if ((metrics as any).growthRate > 15) {
      recommendations.push({
        _action: 'equipment' as const,
        _priority: 'MEDIUM' as const,
        _description: 'Invest in mobile diagnostic equipment for faster service',
        _timeline: '2-3 weeks',
        _estimatedCost: 8000,
        _expectedBenefit: '15% reduction in service time',
      });
    }
    
    return recommendations;
  }
}