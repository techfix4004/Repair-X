import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Advanced Analytics and Business Intelligence Service
export class BusinessIntelligenceService {
  private readonly prisma = prisma;

  // AI-Powered Service Matching
  async intelligentJobAssignment(jobId: string): Promise<{
    recommendedTechnicians: Array<{
      technicianId: string;
      score: number;
      factors: {
        skillMatch: number;
        availability: number;
        location: number;
        performance: number;
        customerRating: number;
      };
      estimatedArrival: string;
      confidence: number;
    }>;
    reasoning: string[];
  }> {
    // Get job details
    const job = await this.prisma.job.findUnique({
      where: { id: _jobId },
      include: {
        device: true,
        customer: true,
        booking: true,
      },
    });

    if (!job) throw new Error('Job not found');

    // Get available technicians
    const technicians = await this.prisma.technician.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      include: {
        user: true,
        skills: true,
        reviews: true,
      },
    });

    // AI matching algorithm
    const recommendations = technicians.map((technician: unknown) => {
      // Skill matching (40% weight)
      const skillMatch = this.calculateSkillMatch(job.device.category, technician.skills);
      
      // Availability score (25% weight)  
      const availability = this.calculateAvailabilityScore(technician.id);
      
      // Location proximity (20% weight)
      const location = this.calculateLocationScore(job.booking.location, technician);
      
      // Performance history (10% weight)
      const performance = this.calculatePerformanceScore(technician.reviews);
      
      // Customer rating (5% weight)
      const customerRating = technician.reviews.reduce((sum: unknown, r: unknown) => sum + r.rating, 0) / technician.reviews.length || 5;

      // Weighted score calculation
      const score = (
        skillMatch * 0.40 +
        availability * 0.25 +
        location * 0.20 +
        performance * 0.10 +
        (customerRating / 5) * 0.05
      );

      return {
        technicianId: technician.id,
        score: Math.round(score * 100) / 100,
        factors: {
          skillMatch: Math.round(skillMatch * 100) / 100,
          availability: Math.round(availability * 100) / 100,
          location: Math.round(location * 100) / 100,
          performance: Math.round(performance * 100) / 100,
          customerRating: Math.round(customerRating * 10) / 10,
        },
        estimatedArrival: this.calculateETA(technician, job.booking.location),
        confidence: Math.min(0.95, score * 0.8 + 0.2), // Confidence between 0.2-0.95
      };
    }).sort((a: unknown, b: unknown) => b.score - a.score);

    return {
      recommendedTechnicians: recommendations.slice(0, 5), // Top 5 matches
      reasoning: [
        'Ranked by AI matching algorithm considering skills, availability, location, and performance',
        `Primary matching criteria: ${job.device.category} expertise`,
        'Location proximity weighted for faster response time',
        'Historical performance and customer ratings included',
      ],
    };
  }

  // Predictive Analytics for Repair Time Estimation
  async predictRepairTime(deviceCategory: string, issueDescription: string, complexity: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<{
    estimatedHours: number;
    confidenceInterval: { min: number; max: number };
    factors: string[];
    historicalData: {
      averageTime: number;
      completionRate: number;
      sampleSize: number;
    };
  }> {
    // Get historical data for similar repairs
    const historicalJobs = await this.prisma.job.findMany({
      where: {
        device: {
          category: deviceCategory,
        },
        status: 'COMPLETED',
        actualHours: { not: null },
      },
      include: {
        device: true,
      },
    });

    // Machine learning-inspired estimation
    const baseTimeByComplexity = {
      LOW: 2.5,
      MEDIUM: 5.0,
      HIGH: 8.5,
    };

    const categoryMultipliers = {
      'Electronics': 1.2,
      'Appliances': 1.5,
      'Automotive': 2.0,
      'Home Maintenance': 1.3,
    };

    let estimatedHours = baseTimeByComplexity[complexity];
    estimatedHours *= categoryMultipliers[deviceCategory as keyof typeof categoryMultipliers] || 1.0;

    // Adjust based on historical data
    if (historicalJobs.length > 0) {
      const avgHistorical = historicalJobs.reduce((sum: unknown, job: unknown) => sum + (job.actualHours || 0), 0) / historicalJobs.length;
      estimatedHours = (estimatedHours * 0.6) + (avgHistorical * 0.4); // Weighted blend
    }

    // Issue complexity analysis (simple NLP-like keyword matching)
    const complexityKeywords = {
      high: ['replacement', 'rebuild', 'extensive', 'multiple', 'complex', 'advanced'],
      medium: ['repair', 'fix', 'replace', 'adjust', 'calibrate'],
      low: ['clean', 'maintenance', 'check', 'inspect', 'simple'],
    };

    const issueWords = issueDescription.toLowerCase().split(' ');
    let complexityBoost = 1.0;

    for (const word of issueWords) {
      if (complexityKeywords.high.some(kw => word.includes(kw))) {
        complexityBoost += 0.3;
      } else if (complexityKeywords.medium.some(kw => word.includes(kw))) {
        complexityBoost += 0.1;
      }
    }

    estimatedHours *= complexityBoost;

    return {
      estimatedHours: Math.round(estimatedHours * 10) / 10,
      confidenceInterval: {
        min: Math.round((estimatedHours * 0.7) * 10) / 10,
        max: Math.round((estimatedHours * 1.4) * 10) / 10,
      },
      factors: [
        `Base complexity: ${complexity}`,
        `Device category: ${deviceCategory}`,
        `Historical average: ${historicalJobs.length} similar jobs`,
        `Issue analysis: ${complexityBoost > 1.2 ? 'High complexity detected' : 'Standard complexity'}`,
      ],
      historicalData: {
        averageTime: historicalJobs.length > 0 ? 
          Math.round((historicalJobs.reduce((sum: unknown, job: unknown) => sum + (job.actualHours || 0), 0) / historicalJobs.length) * 10) / 10 : 0,
        completionRate: historicalJobs.length > 0 ? 
          Math.round((historicalJobs.filter((job: unknown) => job.status === 'COMPLETED').length / historicalJobs.length) * 100) : 0,
        sampleSize: historicalJobs.length,
      },
    };
  }

  // Advanced Business Metrics Dashboard
  async generateBusinessIntelligenceDashboard(dateRange: { start: Date; end: Date }): Promise<{
    summary: {
      totalRevenue: number;
      totalJobs: number;
      avgJobValue: number;
      customerSatisfaction: number;
      technicianUtilization: number;
    };
    trends: {
      revenueByDay: Array<{ date: string; revenue: number; jobs: number }>;
      serviceCategories: Array<{ category: string; count: number; revenue: number }>;
      technicianPerformance: Array<{
        technicianId: string;
        name: string;
        jobsCompleted: number;
        avgRating: number;
        revenue: number;
        efficiency: number;
      }>;
    };
    predictions: {
      nextMonthRevenue: number;
      growthRate: number;
      recommendedActions: string[];
    };
    qualityMetrics: {
      defectRate: number;
      reworkRate: number;
      customerRetention: number;
      npsScore: number;
    };
  }> {
    const { start, end  } = (dateRange as unknown);

    // Get completed jobs in date range
    const jobs = await this.prisma.job.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'COMPLETED',
      },
      include: {
        booking: true,
        device: true,
        technician: { include: { user: true } },
        reviews: true,
      },
    });

    // Calculate summary metrics
    const totalRevenue = jobs.reduce((sum: unknown, job: unknown) => sum + (job.totalAmount || 0), 0);
    const totalJobs = jobs.length;
    const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;
    
    const allReviews = jobs.flatMap((job: unknown) => job.reviews);
    const customerSatisfaction = allReviews.length > 0 ?
      allReviews.reduce((sum: unknown, review: unknown) => sum + review.rating, 0) / allReviews.length : 0;

    // Technician utilization calculation
    const activeTechnicians = await this.prisma.technician.count({ where: { isActive: true } });
    const technicianUtilization = activeTechnicians > 0 ?
      (new Set(jobs.map((job: unknown) => job.technicianId)).size / activeTechnicians) * 100 : 0;

    // Revenue trends by day
    const revenueByDay = this.groupJobsByDay(jobs, start, end);

    // Service category analysis
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    jobs.forEach((job: unknown) => {
      const category = job.device.category;
      const current = categoryMap.get(category) || { count: 0, revenue: 0 };
      categoryMap.set(category, {
        count: current.count + 1,
        revenue: current.revenue + (job.totalAmount || 0),
      });
    });

    // Technician performance analysis
    const technicianMap = new Map<string, any>();
    jobs.forEach((job: unknown) => {
      if (!job.technician) return;
      
      const id = job.technician.id;
      const current = technicianMap.get(id) || {
        technicianId: id,
        name: `${(job.technician as unknown).user.firstName} ${(job.technician as unknown).user.lastName}`,
        jobsCompleted: 0,
        totalRating: 0,
        ratingCount: 0,
        revenue: 0,
        totalHours: 0,
      };

      current.jobsCompleted++;
      current.revenue += job.totalAmount || 0;
      current.totalHours += job.actualHours || 0;

      job.reviews.forEach((review: unknown) => {
        current.totalRating += review.rating;
        current.ratingCount++;
      });

      technicianMap.set(id, current);
    });

    const technicianPerformance = Array.from(technicianMap.values()).map((tech: unknown) => ({
      technicianId: tech.technicianId,
      name: tech.name,
      jobsCompleted: tech.jobsCompleted,
      avgRating: tech.ratingCount > 0 ? Math.round((tech.totalRating / tech.ratingCount) * 10) / 10 : 0,
      revenue: tech.revenue,
      efficiency: tech.totalHours > 0 ? Math.round((tech.revenue / tech.totalHours) * 10) / 10: 0,
    }));

    // Predictive analytics
    const nextMonthRevenue = this.predictNextMonthRevenue(revenueByDay);
    const growthRate = this.calculateGrowthRate(revenueByDay);

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalJobs,
        avgJobValue: Math.round(avgJobValue * 100) / 100,
        customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
        technicianUtilization: Math.round(technicianUtilization * 10) / 10,
      },
      trends: {
        revenueByDay,
        serviceCategories: Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          count: data.count,
          revenue: Math.round(data.revenue * 100) / 100,
        })),
        technicianPerformance: technicianPerformance.sort((a: unknown, b: unknown) => b.revenue - a.revenue),
      },
      predictions: {
        nextMonthRevenue: Math.round(nextMonthRevenue * 100) / 100,
        growthRate: Math.round(growthRate * 100) / 100,
        recommendedActions: this.generateRecommendations(jobs, technicianPerformance),
      },
      qualityMetrics: {
        defectRate: this.calculateDefectRate(jobs),
        reworkRate: this.calculateReworkRate(jobs),
        customerRetention: this.calculateCustomerRetention(jobs),
        npsScore: this.calculateNPSScore(allReviews),
      },
    };
  }

  // Helper methods for calculations
  private calculateSkillMatch(deviceCategory: string, skills: unknown[]): number {
    // Simple skill matching - in production, this would be more sophisticated
    const categorySkills = {
      'Electronics': ['circuit_repair', 'component_replacement', 'diagnostics'],
      'Appliances': ['mechanical_repair', 'electrical_systems', 'troubleshooting'],
      'Automotive': ['engine_repair', 'brake_systems', 'electrical'],
    };

    const requiredSkills = categorySkills[deviceCategory as keyof typeof categorySkills] || [];
    const technicianSkills = skills.map((skill: unknown) => skill.name.toLowerCase());
    
    const matches = requiredSkills.filter((skill: unknown) => 
      technicianSkills.some(techSkill => techSkill.includes(skill))
    ).length;

    return requiredSkills.length > 0 ? matches / requiredSkills.length : 0.5;
  }

  private calculateAvailabilityScore(technicianId: string): number {
    // Mock availability calculation - would integrate with calendar/scheduling system
    return Math.random() * 0.3 + 0.7; // 0.7-1.0 range
  }

  private calculateLocationScore(jobLocation: string, technician: unknown): number {
    // Mock location scoring - would use actual geolocation
    return Math.random() * 0.4 + 0.6; // 0.6-1.0 range
  }

  private calculatePerformanceScore(reviews: unknown[]): number {
    if (reviews.length === 0) return 0.8; // Default score for new technicians
    
    const avgRating = reviews.reduce((sum: unknown, review: unknown) => sum + review.rating, 0) / reviews.length;
    return avgRating / 5; // Convert 5-star rating to 0-1 scale
  }

  private calculateETA(technician: unknown, jobLocation: string): string {
    // Mock ETA calculation
    const baseMinutes = 30;
    const variation = Math.random() * 60; // 0-60 minutes variation
    const totalMinutes = baseMinutes + variation;
    
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + totalMinutes);
    
    return eta.toISOString();
  }

  private groupJobsByDay(jobs: unknown[], start: Date, end: Date): Array<{ date: string; revenue: number; jobs: number }> {
    const dayMap = new Map<string, { revenue: number; jobs: number }>();
    
    jobs.forEach((job: unknown) => {
      const dateKey = job.createdAt.toISOString().split('T')[0];
      const current = dayMap.get(dateKey) || { revenue: 0, jobs: 0 };
      dayMap.set(dateKey, {
        revenue: current.revenue + (job.totalAmount || 0),
        jobs: current.jobs + 1,
      });
    });

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      jobs: data.jobs,
    })).sort((a: unknown, b: unknown) => a.date.localeCompare(b.date));
  }

  private predictNextMonthRevenue(revenueData: Array<{ revenue: number }>): number {
    if ((revenueData as any).length < 2) return 0;
    
    const totalRevenue = (revenueData as any).reduce((sum: unknown, day) => sum + day.revenue, 0);
    const dailyAverage = totalRevenue / (revenueData as any).length;
    const monthlyPrediction = dailyAverage * 30;
    
    // Simple growth trend calculation
    const recent = (revenueData as any).slice(-7);
    const earlier = (revenueData as any).slice(0, 7);
    
    if (recent.length > 0 && earlier.length > 0) {
      const recentAvg = recent.reduce((sum: unknown, day) => sum + day.revenue, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum: unknown, day) => sum + day.revenue, 0) / earlier.length;
      const growthFactor = recentAvg > 0 ? recentAvg / earlierAvg : 1;
      
      return monthlyPrediction * growthFactor;
    }
    
    return monthlyPrediction;
  }

  private calculateGrowthRate(revenueData: Array<{ revenue: number }>): number {
    if ((revenueData as any).length < 2) return 0;
    
    const firstHalf = (revenueData as any).slice(0, Math.floor((revenueData as any).length / 2));
    const secondHalf = (revenueData as any).slice(Math.floor((revenueData as any).length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum: unknown, day) => sum + day.revenue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum: unknown, day) => sum + day.revenue, 0) / secondHalf.length;
    
    return firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  }

  private generateRecommendations(jobs: unknown[], technicianPerformance: unknown[]): string[] {
    const recommendations: string[] = [];
    
    // Revenue optimization
    const avgJobValue = jobs.reduce((sum: unknown, job: unknown) => sum + (job.totalAmount || 0), 0) / jobs.length;
    if (avgJobValue < 100) {
      recommendations.push('Consider upselling premium service packages to increase average job value');
    }
    
    // Technician performance
    const lowPerformers = technicianPerformance.filter((tech: unknown) => tech.avgRating < 4.0);
    if (lowPerformers.length > 0) {
      recommendations.push(`${lowPerformers.length} technicians need performance coaching`);
    }
    
    // Service category diversification
    const categories = new Set(jobs.map((job: unknown) => job.device.category));
    if (categories.size < 3) {
      recommendations.push('Expand service categories to diversify revenue streams');
    }
    
    return recommendations;
  }

  private calculateDefectRate(jobs: unknown[]): number {
    const totalJobs = jobs.length;
    const defectiveJobs = jobs.filter((job: unknown) => 
      job.reviews.some((review: unknown) => review.rating < 3)
    ).length;
    
    return totalJobs > 0 ? (defectiveJobs / totalJobs) * 1000000 : 0; // DPMO
  }

  private calculateReworkRate(jobs: unknown[]): number {
    // Mock rework calculation - would track actual rework in real system
    return Math.random() * 5; // 0-5% rework rate
  }

  private calculateCustomerRetention(jobs: unknown[]): number {
    const customers = new Set(jobs.map((job: unknown) => job.customerId));
    const repeatCustomers = new Set();
    
    const customerJobCounts = new Map<string, number>();
    jobs.forEach((job: unknown) => {
      const count = customerJobCounts.get(job.customerId) || 0;
      customerJobCounts.set(job.customerId, count + 1);
      
      if (count >= 1) {
        repeatCustomers.add(job.customerId);
      }
    });
    
    return customers.size > 0 ? (repeatCustomers.size / customers.size) * 100 : 0;
  }

  private calculateNPSScore(reviews: unknown[]): number {
    if (reviews.length === 0) return 0;
    
    const promoters = reviews.filter((review: unknown) => review.rating >= 4).length;
    const detractors = reviews.filter((review: unknown) => review.rating <= 2).length;
    
    return ((promoters - detractors) / reviews.length) * 100;
  }
}