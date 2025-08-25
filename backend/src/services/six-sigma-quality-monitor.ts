import { EventEmitter } from 'events';

export interface SixSigmaMetrics {
  defectRate: number; // DPMO (Defects Per Million Opportunities)
  processCapability: number; // Cp
  processCapabilityK: number; // Cpk
  customerSatisfaction: number; // CSAT %
  netPromoterScore: number; // NPS
  qualityScore: number; // Overall quality score 0-100
}

export class SixSigmaQualityMonitor extends EventEmitter {
  private metrics: SixSigmaMetrics;
  private qualityThresholds = {
    defectRate: 3.4, // Six Sigma standard
    processCapability: 1.33,
    customerSatisfaction: 95,
    netPromoterScore: 70,
    qualityScore: 90
  };

  constructor() {
    super();
    this.metrics = {
      defectRate: 0,
      processCapability: 0,
      processCapabilityK: 0,
      customerSatisfaction: 0,
      netPromoterScore: 0,
      qualityScore: 0
    };
  }

  async collectMetrics(): Promise<SixSigmaMetrics> {
    // Simulate real-time metrics collection
    this.metrics = {
      defectRate: 2.5, // Excellent: Below Six Sigma standard
      processCapability: 1.67, // Excellent: Above minimum requirement
      processCapabilityK: 1.57,
      customerSatisfaction: 94.2, // Excellent: Near target
      netPromoterScore: 68, // Good: Near target
      qualityScore: 95 // Excellent: Above target
    };

    return this.metrics;
  }

  async validateSixSigmaCompliance(): Promise<boolean> {
    await this.collectMetrics();
    
    const compliance = {
      defectRateCompliant: this.metrics.defectRate <= this.qualityThresholds.defectRate,
      processCapabilityCompliant: this.metrics.processCapability >= this.qualityThresholds.processCapability,
      customerSatisfactionCompliant: this.metrics.customerSatisfaction >= this.qualityThresholds.customerSatisfaction,
      npsCompliant: this.metrics.netPromoterScore >= this.qualityThresholds.netPromoterScore,
      qualityScoreCompliant: this.metrics.qualityScore >= this.qualityThresholds.qualityScore
    };

    const overallCompliant = Object.values(compliance).every(Boolean);
    
    if (overallCompliant) {
      this.emit('sixSigmaAchieved', this.metrics);
    } else {
      this.emit('qualityAlert', { metrics: this.metrics, compliance });
    }

    return overallCompliant;
  }

  generateQualityReport(): string {
    return `
# Six Sigma Quality Report
Generated: ${new Date().toISOString()}

## Key Metrics
- Defect Rate: ${this.metrics.defectRate} DPMO (Target: ≤${this.qualityThresholds.defectRate})
- Process Capability (Cp): ${this.metrics.processCapability} (Target: ≥${this.qualityThresholds.processCapability})
- Customer Satisfaction: ${this.metrics.customerSatisfaction}% (Target: ≥${this.qualityThresholds.customerSatisfaction}%)
- Net Promoter Score: ${this.metrics.netPromoterScore} (Target: ≥${this.qualityThresholds.netPromoterScore})
- Quality Score: ${this.metrics.qualityScore}/100 (Target: ≥${this.qualityThresholds.qualityScore})

## Compliance Status
${this.metrics.defectRate <= this.qualityThresholds.defectRate ? '✅' : '❌'} Defect Rate
${this.metrics.processCapability >= this.qualityThresholds.processCapability ? '✅' : '❌'} Process Capability
${this.metrics.customerSatisfaction >= this.qualityThresholds.customerSatisfaction ? '✅' : '❌'} Customer Satisfaction
${this.metrics.netPromoterScore >= this.qualityThresholds.netPromoterScore ? '✅' : '❌'} Net Promoter Score
${this.metrics.qualityScore >= this.qualityThresholds.qualityScore ? '✅' : '❌'} Quality Score

## Overall Assessment
Six Sigma Compliant: ${Object.values({
      defectRate: this.metrics.defectRate <= this.qualityThresholds.defectRate,
      processCapability: this.metrics.processCapability >= this.qualityThresholds.processCapability,
      customerSatisfaction: this.metrics.customerSatisfaction >= this.qualityThresholds.customerSatisfaction,
      nps: this.metrics.netPromoterScore >= this.qualityThresholds.netPromoterScore,
      qualityScore: this.metrics.qualityScore >= this.qualityThresholds.qualityScore
    }).every(Boolean) ? '✅ YES' : '❌ NO'}
`;
  }
}

export default SixSigmaQualityMonitor;