
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

export class SixSigmaQualityFramework {
  async measureDefectRate(): Promise<number> {
    try {
      const { stdout } = await execAsync('cd backend && npm run lint 2>&1 | grep -c "error" || echo "0"');
      const errors = parseInt(stdout.trim()) || 0;
      const totalOpportunities = 1000000; // 1M opportunities for DPMO calculation
      return (errors / totalOpportunities) * 1000000;
    } catch {
      return 0;
    }
  }

  async measureCodeCoverage(): Promise<number> {
    try {
      const { stdout } = await execAsync('cd backend && npm test -- --coverage --silent 2>/dev/null | grep "All files" | grep -o "[0-9]\+\.[0-9]\+" | head -1 || echo "0"');
      return parseFloat(stdout.trim()) || 0;
    } catch {
      return 0;
    }
  }

  async measureBuildTime(): Promise<number> {
    const start = Date.now();
    try {
      await execAsync('cd backend && npm run build');
      return (Date.now() - start) / 1000;
    } catch {
      return (Date.now() - start) / 1000;
    }
  }

  calculateProcessCapability(defectRate: number): { cp: number; cpk: number } {
    // Six Sigma process capability calculations
    const upperLimit = 3.4; // DPMO target
    const lowerLimit = 0;
    const mean = defectRate;
    const stdDev = Math.max(defectRate / 6, 0.1); // Minimum std dev to avoid division by zero
    
    const cp = (upperLimit - lowerLimit) / (6 * stdDev);
    const cpk = Math.min(
      (upperLimit - mean) / (3 * stdDev),
      (mean - lowerLimit) / (3 * stdDev)
    );
    
    return { cp: Math.max(cp, 0), cpk: Math.max(cpk, 0) };
  }
}
