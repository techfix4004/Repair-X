/**
 * Admin Business Management Page - Enhanced with Modern UI/UX
 * 
 * Comprehensive enterprise dashboard with advanced business logic:
 * - Modern Material-UI dashboard with real-time analytics
 * - Advanced comment and payment modals with rich features
 * - Enhanced business settings with multi-tab configuration
 * - Professional admin profile management
 * - Real-time notifications and job management
 * - Six Sigma quality metrics and performance tracking
 */

'use client';

import React from 'react';
import { AdminDashboard } from '../../components/advanced/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard organizationId="admin-org" />
    </div>
  );
}