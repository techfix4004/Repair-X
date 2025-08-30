'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  Smartphone, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Plus,
  QrCode
} from 'lucide-react';

interface DashboardStats {
  activeJobs: number;
  completedJobs: number;
  totalDevices: number;
  pendingApprovals: number;
  totalSpent: number;
  upcomingAppointments: number;
}

interface RecentActivity {
  id: string;
  type: 'job_update' | 'approval_needed' | 'completed' | 'scheduled';
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    completedJobs: 0,
    totalDevices: 0,
    pendingApprovals: 0,
    totalSpent: 0,
    upcomingAppointments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setIsLoading(true);
        
        // Load real customer statistics from API
        const statsResponse = await fetch('/api/v1/customer/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } else {
          // Fallback to safe defaults if API fails
          console.warn('Failed to load customer stats, using defaults');
          setStats({
            activeJobs: 0,
            completedJobs: 0,
            totalDevices: 0,
            pendingApprovals: 0,
            totalSpent: 0,
            upcomingAppointments: 0,
          });
        }

        // Load real recent activity from API
        const activityResponse = await fetch('/api/v1/customer/dashboard/recent-activity', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activities || []);
        } else {
          console.warn('Failed to load recent activity, using empty array');
          setRecentActivity([]);
        }
        
      } catch (error) {
        console.error('Error loading customer dashboard data:', error);
        
        // Provide safe fallbacks for any network or parsing errors
        setStats({
          activeJobs: 0,
          completedJobs: 0,
          totalDevices: 0,
          pendingApprovals: 0,
          totalSpent: 0,
          upcomingAppointments: 0,
        });
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerData();
    
    // Set up real-time updates for customer data
    const interval = setInterval(loadCustomerData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
        status: 'completed'
      }
    ]);

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your repairs and devices
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Book Service
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <QrCode className="h-4 w-4 mr-2" />
              QR Check-in
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              {stats.pendingApprovals > 0 && (
                <span className="text-orange-600 font-medium">
                  {stats.pendingApprovals} awaiting approval
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-green-600 font-medium">
              95% satisfaction rate
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registered Devices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDevices}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Phones, laptops, appliances
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Next appointment in 2 days
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Savings from repairs: $890
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-red-600 font-medium">
              Requires immediate attention
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Stay updated on your repair status</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className={
                  'p-2 rounded-lg ' + (
                    activity.type === 'approval_needed' ? 'bg-orange-100' :
                    activity.type === 'job_update' ? 'bg-blue-100' :
                    activity.type === 'completed' ? 'bg-green-100' :
                    activity.type === 'scheduled' ? 'bg-purple-100' : ''
                  )
                }>
                  {activity.type === 'approval_needed' && <AlertCircle className="h-5 w-5 text-orange-600" />}
                  {activity.type === 'job_update' && <Clock className="h-5 w-5 text-blue-600" />}
                  {activity.type === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {activity.type === 'scheduled' && <Calendar className="h-5 w-5 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </h3>
                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="mt-2">
                    <span className={
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + (
                        activity.status === 'awaiting_approval' ? 'bg-orange-100 text-orange-800' :
                        activity.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' : ''
                      )
                    }>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  );
}