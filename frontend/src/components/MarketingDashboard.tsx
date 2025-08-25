/**
 * Marketing Dashboard Component
 * 
 * Comprehensive marketing automation dashboard featuring:
 * - Campaign performance analytics
 * - Acquisition funnel monitoring
 * - Lead scoring and management
 * - ROI tracking and optimization
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Target,
  DollarSign,
  MousePointer,
  Eye,
  Settings,
  Plus,
  Calendar,
  Filter,
  Download,
  Play,
  Pause,
  Edit,
  MoreVertical
} from 'lucide-react';

interface MarketingMetrics {
  campaigns: {
    active: number;
    completed: number;
    totalSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
  };
  funnels: {
    active: number;
    totalConversions: number;
    averageConversionRate: number;
    revenueAttribution: number;
  };
  leads: {
    newLeads: number;
    qualifiedLeads: number;
    averageScore: number;
    conversionRate: number;
  };
  roi: {
    totalSpend: number;
    totalRevenue: number;
    roi: number;
    costPerLead: number;
    costPerAcquisition: number;
  };
}

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'multi_channel';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  audience: {
    targetCount: number;
    segments: string[];
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    frequency?: string;
  };
}

interface AcquisitionFunnel {
  id: string;
  name: string;
  stages: Array<{
    id: string;
    name: string;
    users: number;
    conversionRate: number;
  }>;
  metrics: {
    totalEntered: number;
    totalConverted: number;
    overallConversionRate: number;
    averageTimeToConvert: number;
    revenuePerConversion: number;
    totalRevenue: number;
  };
}

const MarketingDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [funnels, setFunnels] = useState<AcquisitionFunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'campaigns' | 'funnels' | 'leads'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load marketing metrics
      const metricsResponse = await fetch('/api/v1/marketing/dashboard');
      const metricsData = await metricsResponse.json();
      
      if (metricsData.success) {
        setMetrics(metricsData.analytics);
      }

      // Mock campaigns data
      setCampaigns([
        {
          id: 'camp_1',
          name: 'New Customer Welcome Series',
          type: 'email',
          status: 'active',
          audience: { targetCount: 2547, segments: ['new_customers'] },
          metrics: { sent: 2547, delivered: 2489, opened: 1172, clicked: 234, converted: 47, unsubscribed: 12 },
          schedule: { startDate: '2025-08-10T09:00:00Z' },
        },
        {
          id: 'camp_2',
          name: 'Customer Reactivation',
          type: 'email',
          status: 'active',
          audience: { targetCount: 1834, segments: ['inactive_customers'] },
          metrics: { sent: 1834, delivered: 1798, opened: 647, clicked: 89, converted: 23, unsubscribed: 8 },
          schedule: { startDate: '2025-08-08T14:30:00Z' },
        },
        {
          id: 'camp_3',
          name: 'Technician Recruitment',
          type: 'multi_channel',
          status: 'scheduled',
          audience: { targetCount: 5000, segments: ['technician_prospects'] },
          metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0 },
          schedule: { startDate: '2025-08-12T10:00:00Z' },
        },
      ]);

      // Mock funnels data
      setFunnels([
        {
          id: 'funnel_1',
          name: 'Customer Acquisition Funnel',
          stages: [
            { id: 'visitor', name: 'Website Visitor', users: 5234, conversionRate: 100 },
            { id: 'lead', name: 'Lead', users: 1547, conversionRate: 29.5 },
            { id: 'prospect', name: 'Prospect', users: 432, conversionRate: 27.9 },
            { id: 'customer', name: 'Customer', users: 187, conversionRate: 43.3 },
          ],
          metrics: {
            totalEntered: 5234,
            totalConverted: 187,
            overallConversionRate: 3.6,
            averageTimeToConvert: 48.5,
            revenuePerConversion: 127.50,
            totalRevenue: 23842.50,
          },
        },
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <BarChart3 className="w-8 h-8 animate-pulse text-blue-600" />
          <p className="text-gray-600">Loading marketing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketing Automation</h1>
              <p className="text-gray-600">Drive growth with intelligent marketing campaigns</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'campaigns', name: 'Campaigns', icon: Mail },
              { id: 'funnels', name: 'Funnels', icon: Target },
              { id: 'leads', name: 'Leads', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as 'overview' | 'campaigns' | 'funnels' | 'leads')}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.campaigns.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(metrics?.campaigns.averageOpenRate || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <MousePointer className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(metrics?.campaigns.averageClickRate || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Marketing ROI</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(metrics?.roi.roi || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Return on Investment</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(metrics?.roi.totalSpend || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Spend</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(metrics?.roi.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(metrics?.roi.costPerLead || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Cost per Lead</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(metrics?.roi.costPerAcquisition || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Cost per Acquisition</p>
                </div>
              </div>
            </div>

            {/* Funnel Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acquisition Funnels</h3>
              {funnels.map((funnel) => (
                <div key={funnel.id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">{funnel.name}</h4>
                    <span className="text-sm text-gray-500">
                      {formatPercentage(funnel.metrics.overallConversionRate)} overall conversion
                    </span>
                  </div>
                  <div className="flex justify-between space-x-4">
                    {funnel.stages.map((stage, index) => (
                      <div key={stage.id} className="flex-1">
                        <div className="text-center">
                          <div className="bg-blue-100 rounded-lg p-3 mb-2">
                            <p className="text-lg font-bold text-blue-900">{stage.users.toLocaleString()}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                          {index > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatPercentage(stage.conversionRate)} conversion
                            </p>
                          )}
                        </div>
                        {index < funnel.stages.length - 1 && (
                          <div className="flex justify-center mt-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Campaign Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Calendar className="w-4 h-4" />
                    <span>Date Range</span>
                  </button>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Active Campaigns</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {campaign.audience.targetCount.toLocaleString()} recipients • 
                          Started {new Date(campaign.schedule.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {campaign.status === 'active' && (
                          <button className="text-gray-400 hover:text-gray-600">
                            <Pause className="w-5 h-5" />
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button className="text-green-600 hover:text-green-700">
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Campaign Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{campaign.metrics.sent.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {formatPercentage((campaign.metrics.opened / campaign.metrics.sent) * 100)}
                        </p>
                        <p className="text-xs text-gray-500">Open Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPercentage((campaign.metrics.clicked / campaign.metrics.opened) * 100)}
                        </p>
                        <p className="text-xs text-gray-500">Click Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {formatPercentage((campaign.metrics.converted / campaign.metrics.clicked) * 100)}
                        </p>
                        <p className="text-xs text-gray-500">Conversion</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {formatPercentage((campaign.metrics.unsubscribed / campaign.metrics.sent) * 100)}
                        </p>
                        <p className="text-xs text-gray-500">Unsubscribe</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingDashboard;