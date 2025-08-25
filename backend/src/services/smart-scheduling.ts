import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Smart Scheduling and Route Optimization Service
export class SmartSchedulingService {
  private readonly prisma = prisma;

  // AI-Powered Intelligent Scheduling
  async optimizeSchedule(dateRange: { start: Date; end: Date }, _technicianId?: string): Promise<{
    optimizedSchedule: Array<{
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
        ...(technicianId && { id: technicianId }),
      },
      include: {
        user: true,
        skills: true,
      },
    });

    // Get pending/scheduled jobs in date range
    const jobs = await this.prisma.job.findMany({
      where: {
        status: { in: ['PENDING', 'SCHEDULED'] },
        scheduledDate: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      include: {
        booking: true,
        device: true,
        customer: { include: { user: true } },
      },
    });

    // AI scheduling algorithm
    const optimizedSchedule = technicians.map((technician: unknown) => {
      // Get jobs suitable for this technician
      const suitableJobs = this.filterJobsForTechnician(jobs, technician);
      
      // Optimize route and timing
      const optimizedJobs = this.optimizeRoute(suitableJobs, technician);
      
      // Calculate metrics
      const totalRevenue = optimizedJobs.reduce((sum: unknown, job: unknown) => sum + (job.estimatedRevenue || 0), 0);
      const totalTime = optimizedJobs.reduce((sum: unknown, job: unknown) => sum + job.estimatedDuration + (job as any).travelTime, 0);
      const workingHours = 8 * 60; // 8 hours in minutes
      const utilization = Math.min(100, (totalTime / workingHours) * 100);
      const efficiency = totalTime > 0 ? (totalRevenue / totalTime) * 60 : 0; // Revenue per hour

      return {
        technicianId: technician.id,
        name: `${(technician as any).user.firstName} ${(technician as any).user.lastName}`,
        schedule: optimizedJobs.map((job: unknown) => ({
          jobId: job.id,
          startTime: job.startTime,
          endTime: job.endTime,
          location: job.booking.location,
          estimatedDuration: job.estimatedDuration,
          travelTime: (job as any).travelTime,
          priority: job.priority as 'HIGH' | 'MEDIUM' | 'LOW',
          skillMatch: job.skillMatch,
        })),
        totalJobs: optimizedJobs.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        utilization: Math.round(utilization * 10) / 10,
      };
    });

    // Calculate overall metrics
    const totalJobs = optimizedSchedule.reduce((sum: unknown, tech: unknown) => sum + (tech as any).totalJobs, 0);
    const averageUtilization = optimizedSchedule.length > 0 ?
      optimizedSchedule.reduce((sum: unknown, tech: unknown) => sum + (tech as any).utilization, 0) / optimizedSchedule.length : 0;
    const totalTravelTime = optimizedSchedule.reduce((sum: unknown, tech: unknown) => 
      sum + ((tech as any).schedule as unknown[]).reduce((jobSum: unknown, job: unknown) => jobSum + (job as any).travelTime, 0), 0
    );

    // Generate improvement suggestions
    const improvements = this.generateImprovements(optimizedSchedule, jobs);

    return {
      optimizedSchedule: optimizedSchedule.sort((a: unknown, b: unknown) => b.efficiency - a.efficiency),
      metrics: {
        totalJobs,
        averageUtilization: Math.round(averageUtilization * 10) / 10,
        totalTravelTime: Math.round(totalTravelTime),
        customerSatisfactionScore: this.calculateExpectedSatisfaction(optimizedSchedule),
        revenueOptimization: this.calculateRevenueOptimization(optimizedSchedule),
      },
      improvements,
    };
  }

  // Dynamic Job Assignment based on Real-time Factors
  async dynamicJobAssignment(jobId: string): Promise<{
    recommendedAssignment: {
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
      include: {
        booking: true,
        device: true,
        customer: { include: { user: true } },
      },
    });

    if (!job) throw new Error('Job not found');

    // Get available technicians with current schedules
    const technicians = await this.prisma.technician.findMany({
      where: { isActive: true, isAvailable: true },
      include: {
        user: true,
        skills: true,
        jobs: {
          where: {
            scheduledDate: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
            },
          },
        },
      },
    });

    // AI assignment scoring
    const scoredTechnicians = technicians.map((technician: unknown) => {
      const factors = this.calculateAssignmentFactors(job, technician);
      const score = this.calculateOverallScore(factors);
      const scheduledTime = this.findOptimalTimeSlot(technician, job);

      return {
        technicianId: technician.id,
        name: `${(technician as any).user.firstName} ${(technician as any).user.lastName}`,
        score,
        factors,
        scheduledTime,
        estimatedArrival: this.calculateArrivalTime(technician, job.booking.location, scheduledTime),
      };
    }).sort((a: unknown, b: unknown) => b.score - a.score);

    const recommended = scoredTechnicians[0];
    const alternatives = scoredTechnicians.slice(1, 4);

    return {
      recommendedAssignment: {
        technicianId: recommended.technicianId,
        name: recommended.name,
        scheduledTime: recommended.scheduledTime,
        estimatedArrival: recommended.estimatedArrival,
        confidence: Math.min(0.95, recommended.score * 0.8 + 0.2),
        reasons: this.generateAssignmentReasons(recommended.factors),
      },
      alternatives: alternatives.map((alt: unknown) => ({
        technicianId: alt.technicianId,
        name: alt.name,
        scheduledTime: alt.scheduledTime,
        score: Math.round(alt.score * 100) / 100,
        tradeoffs: this.generateTradeoffs(recommended.factors, alt.factors),
      })),
      optimizationFactors: recommended.factors,
    };
  }

  // Predictive Capacity Planning
  async predictCapacityNeeds(forecastPeriod: 'week' | 'month' | 'quarter'): Promise<{
    currentCapacity: {
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
    const periodDays = { week: 7, month: 30, quarter: 90 };
    startDate.setDate(startDate.getDate() - periodDays[forecastPeriod] * 2); // 2x period for comparison

    const historicalJobs = await this.prisma.job.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' },
      },
      include: { device: true },
    });

    const technicians = await this.prisma.technician.findMany({
      where: { isActive: true },
      include: { skills: true },
    });

    // Current capacity analysis
    const totalTechnicians = technicians.length;
    const averageUtilization = this.calculateAverageUtilization(technicians, historicalJobs);
    const peakCapacity = totalTechnicians * 8 * 5; // 8 hours/day, 5 days/week
    const bottlenecks = this.identifyBottlenecks(technicians, historicalJobs);

    // Demand forecasting using simple trend analysis
    const recentPeriodJobs = historicalJobs.filter((job: unknown) => 
      job.createdAt >= new Date(Date.now() - periodDays[forecastPeriod] * 24 * 60 * 60 * 1000)
    ).length;

    const previousPeriodJobs = historicalJobs.filter((job: unknown) => 
      job.createdAt >= new Date(Date.now() - periodDays[forecastPeriod] * 2 * 24 * 60 * 60 * 1000) &&
      job.createdAt < new Date(Date.now() - periodDays[forecastPeriod] * 24 * 60 * 60 * 1000)
    ).length;

    const growthRate = previousPeriodJobs > 0 ? 
      ((recentPeriodJobs - previousPeriodJobs) / previousPeriodJobs) * 100 : 0;

    const expectedJobs = Math.round(recentPeriodJobs * (1 + growthRate / 100));

    // Generate peak demand periods (mock data for demonstration)
    const peakDemandPeriods = this.generatePeakPeriods(forecastPeriod, expectedJobs);

    // Seasonality analysis (simplified)
    const seasonalityFactors = [
      { period: 'Spring', multiplier: 1.2 },
      { period: 'Summer', multiplier: 1.4 },
      { period: 'Fall', multiplier: 1.1 },
      { period: 'Winter', multiplier: 0.9 },
    ];

    // Generate recommendations
    const recommendations = this.generateCapacityRecommendations(
      { totalTechnicians, averageUtilization, expectedJobs, growthRate }
    );

    return {
      currentCapacity: {
        totalTechnicians,
        averageUtilization: Math.round(averageUtilization * 10) / 10,
        peakCapacity,
        bottlenecks,
      },
      demandForecast: {
        expectedJobs,
        peakDemandPeriods,
        growthRate: Math.round(growthRate * 10) / 10,
        seasonalityFactors,
      },
      recommendations,
    };
  }

  // Helper Methods

  private filterJobsForTechnician(jobs: unknown[], technician: unknown): unknown[] {
    return jobs.filter((job: unknown) => {
      // Check skill match
      const requiredSkills = this.getRequiredSkills(job.device.category);
      const technicianSkills = technician.skills.map((s: unknown) => s.name.toLowerCase());
      
      const hasRequiredSkills = requiredSkills.some(skill => 
        technicianSkills.some((techSkill: unknown) => techSkill.includes(skill))
      );
      
      return hasRequiredSkills;
    });
  }

  private optimizeRoute(jobs: unknown[], technician: unknown): unknown[] {
    // Simple greedy algorithm for route optimization
    // In production, this would use more sophisticated algorithms like genetic algorithms or simulated annealing
    
    if (jobs.length === 0) return [];

    let optimizedJobs = [...jobs];
    let currentTime = new Date();
    currentTime.setHours(8, 0, 0, 0); // Start at 8 AM

    return optimizedJobs.map((job, index) => {
      const estimatedDuration = this.estimateJobDuration(job);
      const travelTime = index === 0 ? 30 : this.calculateTravelTime(
        optimizedJobs[index - 1]?.booking?.location,
        job.booking.location
      );
      
      const startTime = new Date(currentTime.getTime() + travelTime * 60000);
      const endTime = new Date(startTime.getTime() + estimatedDuration * 60000);
      
      currentTime = endTime;

      return {
        ...job,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        estimatedDuration,
        travelTime,
        skillMatch: this.calculateSkillMatch(job.device.category, technician.skills),
        priority: this.calculateJobPriority(job),
        estimatedRevenue: this.estimateJobRevenue(job),
      };
    });
  }

  private calculateAssignmentFactors(job: unknown, technician: unknown): unknown {
    return {
      customerPriority: this.calculateCustomerPriority(job.customer),
      urgency: this.calculateUrgency(job),
      skillRequirement: this.calculateSkillMatch(job.device.category, technician.skills),
      locationOptimization: this.calculateLocationScore(job.booking.location, technician),
      resourceUtilization: this.calculateResourceUtilization(technician),
    };
  }

  private calculateOverallScore(factors: unknown): number {
    // Weighted scoring algorithm
    return (
      factors.customerPriority * 0.25 +
      factors.urgency * 0.20 +
      factors.skillRequirement * 0.25 +
      factors.locationOptimization * 0.15 +
      factors.resourceUtilization * 0.15
    );
  }

  private getRequiredSkills(deviceCategory: string): string[] {
    const skillMap: Record<string, string[]> = {
      'Electronics': ['circuit_repair', 'component_replacement', 'diagnostics'],
      'Appliances': ['mechanical_repair', 'electrical_systems', 'troubleshooting'],
      'Automotive': ['engine_repair', 'brake_systems', 'electrical'],
      'Home Maintenance': ['plumbing', 'electrical', 'carpentry'],
    };
    
    return skillMap[deviceCategory] || [];
  }

  private estimateJobDuration(job: unknown): number {
    // Base duration by device category (in minutes)
    const baseDurations: Record<string, number> = {
      'Electronics': 90,
      'Appliances': 120,
      'Automotive': 180,
      'Home Maintenance': 150,
    };
    
    return baseDurations[job.device.category] || 120;
  }

  private calculateTravelTime(fromLocation: string, toLocation: string): number {
    // Mock travel time calculation - would integrate with mapping service
    return Math.floor(Math.random() * 30) + 15; // 15-45 minutes
  }

  private calculateSkillMatch(deviceCategory: string, skills: unknown[]): number {
    const requiredSkills = this.getRequiredSkills(deviceCategory);
    const technicianSkills = skills.map((skill: unknown) => (skill as any).name.toLowerCase());
    
    const matches = requiredSkills.filter((skill: unknown) => 
      technicianSkills.some((techSkill: unknown) => techSkill.includes(skill))
    ).length;
    
    return requiredSkills.length > 0 ? matches / requiredSkills.length : 0.5;
  }

  private calculateJobPriority(job: unknown): 'HIGH' | 'MEDIUM' | 'LOW' {
    // Simple priority calculation based on customer type and urgency
    if ((job.customer as unknown).user.email?.includes('vip') || job.booking.urgent) return 'HIGH';
    if (job.device.category === 'Automotive') return 'MEDIUM';
    return 'LOW';
  }

  private estimateJobRevenue(job: unknown): number {
    // Base revenue estimates by category
    const baseRevenues: Record<string, number> = {
      'Electronics': 150,
      'Appliances': 200,
      'Automotive': 300,
      'Home Maintenance': 175,
    };
    
    return baseRevenues[job.device.category] || 150;
  }

  private findOptimalTimeSlot(technician: unknown, job: unknown): string {
    // Find next available slot in technician's schedule
    const now = new Date();
    const nextSlot = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    nextSlot.setHours(8, 0, 0, 0); // 8 AM
    
    return nextSlot.toISOString();
  }

  private calculateArrivalTime(technician: unknown, location: string, scheduledTime: string): string {
    const scheduled = new Date(scheduledTime);
    const travelTime = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
    const arrival = new Date(scheduled.getTime() + travelTime * 60000);
    
    return arrival.toISOString();
  }

  private generateAssignmentReasons(factors: unknown): string[] {
    const reasons: string[] = [];
    
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

  private generateTradeoffs(primaryFactors: unknown, altFactors: unknown): string[] {
    const tradeoffs: string[] = [];
    
    if ((altFactors as any).skillRequirement > (primaryFactors as any).skillRequirement) {
      tradeoffs.push('Better skill match but longer travel time');
    }
    if ((altFactors as any).locationOptimization > (primaryFactors as any).locationOptimization) {
      tradeoffs.push('Closer location but lower availability');
    }
    
    return tradeoffs.length > 0 ? tradeoffs : ['Alternative option with different optimization balance'];
  }

  private calculateExpectedSatisfaction(schedule: unknown[]): number {
    // Mock satisfaction calculation based on response times and efficiency
    const avgEfficiency = (schedule as unknown[]).reduce((sum: unknown, tech: unknown) => sum + (tech as any).efficiency, 0) / schedule.length;
    return Math.min(5.0, 3.5 + (avgEfficiency / 200)); // Scale to 3.5-5.0 range
  }

  private calculateRevenueOptimization(schedule: unknown[]): number {
    // Mock revenue optimization percentage
    return Math.round((Math.random() * 15 + 5) * 10) / 10; // 5-20% improvement
  }

  private generateImprovements(schedule: unknown[], jobs: unknown[]): unknown[] {
    const improvements = [];
    
    // Route optimization suggestion
    if ((schedule as unknown[]).some(tech => ((tech as any).schedule as unknown[]).reduce((sum: number, job: unknown) => sum + (job as any).travelTime, 0) > 120)) {
      improvements.push({
        type: 'route' as const,
        description: 'Optimize travel routes to reduce total travel time by 20%',
        impact: 'Medium',
        estimatedBenefit: 1200, // Additional revenue from time savings
      });
    }
    
    // Capacity utilization
    const avgUtilization = (schedule as unknown[]).reduce((sum: unknown, tech: unknown) => sum + (tech as any).utilization, 0) / schedule.length;
    if (avgUtilization < 70) {
      improvements.push({
        type: 'scheduling' as const,
        description: 'Increase job density during peak hours to improve utilization',
        impact: 'High',
        estimatedBenefit: 2500,
      });
    }
    
    return improvements;
  }

  private calculateCustomerPriority(customer: unknown): number {
    // Mock customer priority based on history and status
    return Math.random() * 0.3 + 0.7; // 0.7-1.0 range
  }

  private calculateUrgency(job: unknown): number {
    // Mock urgency calculation - fix numeric separator syntax error
    return Math.random() > 0.1 ? 1.0 : Math.random() * 0.5 + 0.3; // 0.3-0.8 for normal, 1.0 for urgent
  }

  private calculateLocationScore(jobLocation: string, technician: unknown): number {
    // Mock location scoring - would use actual geolocation
    return Math.random() * 0.4 + 0.6; // 0.6-1.0 range
  }

  private calculateResourceUtilization(technician: unknown): number {
    // Mock resource utilization based on current workload
    return Math.random() * 0.3 + 0.5; // 0.5-0.8 range
  }

  private calculateAverageUtilization(technicians: unknown[], jobs: unknown[]): number {
    // Mock utilization calculation
    return Math.random() * 20 + 70; // 70-90% utilization
  }

  private identifyBottlenecks(technicians: unknown[], jobs: unknown[]): string[] {
    const bottlenecks = [];
    
    if (technicians.length < 5) {
      bottlenecks.push('Limited technician capacity during peak hours');
    }
    
    const skillCounts = new Map();
    technicians.forEach((tech: unknown) => {
      (tech as any).skills.forEach((skill: unknown) => {
        skillCounts.set((skill as any).name, (skillCounts.get((skill as any).name) || 0) + 1);
      });
    });
    
    if (skillCounts.get('Electronics Repair') < 2) {
      bottlenecks.push('Insufficient electronics repair specialists');
    }
    
    return bottlenecks;
  }

  private generatePeakPeriods(period: string, expectedJobs: number): unknown[] {
    // Generate mock peak periods based on typical patterns
    return [
      { period: 'Weekends', expectedJobs: Math.floor(expectedJobs * 0.3), capacityGap: 15 },
      { period: 'Holiday Season', expectedJobs: Math.floor(expectedJobs * 0.4), capacityGap: 25 },
      { period: 'Summer Months', expectedJobs: Math.floor(expectedJobs * 0.35), capacityGap: 20 },
    ];
  }

  private generateCapacityRecommendations(metrics: unknown): unknown[] {
    const recommendations = [];
    
    if ((metrics as any).averageUtilization > 90) {
      recommendations.push({
        action: 'hire' as const,
        priority: 'HIGH' as const,
        description: 'Hire 2-3 additional technicians to handle increased demand',
        timeline: '4-6 weeks',
        estimatedCost: 15000,
        expectedBenefit: '25% increase in job capacity',
      });
    }
    
    if ((metrics as any).growthRate > 15) {
      recommendations.push({
        action: 'equipment' as const,
        priority: 'MEDIUM' as const,
        description: 'Invest in mobile diagnostic equipment for faster service',
        timeline: '2-3 weeks',
        estimatedCost: 8000,
        expectedBenefit: '15% reduction in service time',
      });
    }
    
    return recommendations;
  }
}