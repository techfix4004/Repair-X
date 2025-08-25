/**
 * Technician Dashboard Page
 * 
 * Mobile-first field operations interface with enterprise capabilities:
 * - Field-optimized job assignment with GPS routing
 * - Offline mode for poor connectivity areas
 * - Photo capture and documentation at each workflow stage
 * - Digital forms for customer signatures and approvals
 * - Parts inventory management with barcode scanning
 * - Time tracking with automatic labor cost calculation
 */

import React from 'react';
import { TechnicianDashboard } from '../../components/MultiRoleDashboard';

export default function TechnicianPage() {
  return (
    <div>
      <TechnicianDashboard />
    </div>
  );
}