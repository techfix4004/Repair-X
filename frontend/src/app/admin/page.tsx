/**
 * Admin Business Management Page - Enhanced with Complete Business Settings
 * 
 * Comprehensive enterprise dashboard with advanced analytics:
 * - Complete 20+ business setting categories with detailed modals
 * - Enhanced workflow designer with drag-and-drop business rule creation
 * - Real-time KPI dashboards with Six Sigma quality metrics
 * - Employee management with role-based permissions
 * - Financial reporting with tax compliance and profit analysis
 * - Customer relationship management with segmentation
 */

import React from 'react';
import { AdminDashboard } from '../../components/MultiRoleDashboard';
import { EnhancedBusinessSettings } from '../../components/EnhancedBusinessSettings';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Business Settings Management System */}
      <div className="p-6">
        <EnhancedBusinessSettings tenantId="admin" />
      </div>
      
      {/* Original Admin Dashboard (can be toggled or integrated) */}
      <div className="mt-8 px-6">
        <AdminDashboard />
      </div>
    </div>
  );
}