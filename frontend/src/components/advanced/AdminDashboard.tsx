'use client';

import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Fab,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  TrendingDown,
  People,
  Assignment,
  AttachMoney,
  Inventory,
  Notifications,
  Settings,
  Add,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  Info,
  Build,
  Phone,
  Email,
  LocationOn,
  Schedule,
} from '@mui/icons-material';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { AddCommentModal } from './AddCommentModal';
import { AddPaymentModal } from './AddPaymentModal';
import { EnhancedBusinessSettings } from './EnhancedBusinessSettings';

interface AdminDashboardProps {
  organizationId?: string;
}

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalCustomers: number;
  activeCustomers: number;
}

interface RecentJob {
  id: string;
  customer: string;
  device: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delivered';
  assignee: string;
  createdAt: string;
  amount: number;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function AdminDashboard({ organizationId }: AdminDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBusinessSettings, setShowBusinessSettings] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RecentJob | null>(null);

  const [stats] = useState<DashboardStats>({
    totalJobs: 1247,
    activeJobs: 89,
    completedJobs: 1158,
    totalRevenue: 245600,
    monthlyRevenue: 18950,
    pendingPayments: 12400,
    totalCustomers: 892,
    activeCustomers: 156,
  });

  const [recentJobs] = useState<RecentJob[]>([
    {
      id: 'TFX-8053',
      customer: 'Sachin Mallesh',
      device: 'iPhone 14 Pro',
      status: 'completed',
      assignee: 'Azeez',
      createdAt: '2025-01-27',
      amount: 250,
    },
    {
      id: 'TFX-8054',
      customer: 'John Doe',
      device: 'Samsung Galaxy S23',
      status: 'in-progress',
      assignee: 'Mike Wilson',
      createdAt: '2025-01-27',
      amount: 180,
    },
    {
      id: 'TFX-8055',
      customer: 'Sarah Johnson',
      device: 'MacBook Pro',
      status: 'pending',
      assignee: 'Emma Davis',
      createdAt: '2025-01-26',
      amount: 450,
    },
    {
      id: 'TFX-8056',
      customer: 'Mike Brown',
      device: 'iPad Air',
      status: 'delivered',
      assignee: 'Tom Smith',
      createdAt: '2025-01-26',
      amount: 120,
    },
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Low Inventory Alert',
      message: 'iPhone 14 Pro screens are running low (5 units remaining)',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'success',
      title: 'Payment Received',
      message: 'Payment of $250 received for job TFX-8053',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'New Customer Registration',
      message: 'Emma Wilson has registered as a new customer',
      timestamp: '6 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'error',
      title: 'Job Delayed',
      message: 'Job TFX-8049 is delayed due to parts unavailability',
      timestamp: '1 day ago',
      read: true,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'delivered': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'in-progress': return <Build />;
      case 'completed': return <CheckCircle />;
      case 'delivered': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Info color="info" />;
    }
  };

  const handleJobAction = (job: RecentJob, action: 'comment' | 'payment') => {
    setSelectedJob(job);
    if (action === 'comment') {
      setShowCommentModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  if (showBusinessSettings) {
    return <EnhancedBusinessSettings organizationId={organizationId} />;
  }

  return (
    <Box className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <Box className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <Typography variant="h4" component="h1" className="font-bold text-gray-900">
              Admin Dashboard
            </Typography>
            <Typography variant="body1" className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your repair business.
            </Typography>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisQuarter">This Quarter</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => setShowBusinessSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Jobs
                  </Typography>
                  <Typography variant="h5" component="h2" className="font-bold">
                    {stats.totalJobs.toLocaleString()}
                  </Typography>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <Typography variant="body2" className="text-green-500">
                      +12% from last month
                    </Typography>
                  </div>
                </div>
                <Avatar className="bg-blue-100">
                  <Assignment className="text-blue-600" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Jobs
                  </Typography>
                  <Typography variant="h5" component="h2" className="font-bold">
                    {stats.activeJobs}
                  </Typography>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <Typography variant="body2" className="text-orange-500">
                      +5% from yesterday
                    </Typography>
                  </div>
                </div>
                <Avatar className="bg-orange-100">
                  <Build className="text-orange-600" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h5" component="h2" className="font-bold">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </Typography>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <Typography variant="body2" className="text-green-500">
                      +8% from last month
                    </Typography>
                  </div>
                </div>
                <Avatar className="bg-green-100">
                  <AttachMoney className="text-green-600" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Customers
                  </Typography>
                  <Typography variant="h5" component="h2" className="font-bold">
                    {stats.activeCustomers}
                  </Typography>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <Typography variant="body2" className="text-red-500">
                      -2% from last week
                    </Typography>
                  </div>
                </div>
                <Avatar className="bg-purple-100">
                  <People className="text-purple-600" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Jobs */}
        <Grid item xs={12} lg={8}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <Typography variant="h6" component="h2" className="font-semibold">
                  Recent Jobs
                </Typography>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <List>
                {recentJobs.map((job, index) => (
                  <ListItem 
                    key={job.id}
                    className={`rounded-lg mb-2 ${index !== recentJobs.length - 1 ? 'border-b' : ''}`}
                  >
                    <ListItemIcon>
                      {getStatusIcon(job.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div className="flex items-center gap-2">
                          <Typography className="font-semibold text-blue-600">
                            {job.id}
                          </Typography>
                          <Chip 
                            label={job.status.replace('-', ' ')}
                            color={getStatusColor(job.status) as any}
                            size="small"
                            variant="outlined"
                          />
                        </div>
                      }
                      secondary={
                        <div className="mt-1">
                          <Typography variant="body2" className="text-gray-600">
                            Customer: {job.customer} | Device: {job.device}
                          </Typography>
                          <Typography variant="body2" className="text-gray-500">
                            Assigned to: {job.assignee} | Amount: ${job.amount}
                          </Typography>
                        </div>
                      }
                    />
                    <div className="flex gap-1">
                      <Tooltip title="Add Comment">
                        <IconButton 
                          size="small"
                          onClick={() => handleJobAction(job, 'comment')}
                        >
                          <Add />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Payment">
                        <IconButton 
                          size="small"
                          onClick={() => handleJobAction(job, 'payment')}
                        >
                          <AttachMoney />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <div className="space-y-4">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Typography variant="h6" component="h2" className="font-semibold">
                    Notifications
                  </Typography>
                  <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                    <Notifications />
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <List>
                  {notifications.slice(0, 4).map((notification) => (
                    <ListItem 
                      key={notification.id}
                      className={`rounded-lg mb-2 ${!notification.read ? 'bg-blue-50' : ''}`}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <div>
                            <Typography variant="body2" className="text-gray-600 mb-1">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {notification.timestamp}
                            </Typography>
                          </div>
                        }
                      />
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <Typography variant="h6" component="h2" className="font-semibold">
                  Quick Stats
                </Typography>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body2">Job Completion Rate</Typography>
                    <Typography variant="body2" className="font-semibold">93%</Typography>
                  </div>
                  <LinearProgress variant="determinate" value={93} className="h-2 rounded" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body2">Customer Satisfaction</Typography>
                    <Typography variant="body2" className="font-semibold">98%</Typography>
                  </div>
                  <LinearProgress variant="determinate" value={98} className="h-2 rounded" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body2">Revenue Target</Typography>
                    <Typography variant="body2" className="font-semibold">76%</Typography>
                  </div>
                  <LinearProgress variant="determinate" value={76} className="h-2 rounded" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="body2">Inventory Turnover</Typography>
                    <Typography variant="body2" className="font-semibold">85%</Typography>
                  </div>
                  <LinearProgress variant="determinate" value={85} className="h-2 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>

      {/* Floating Action Buttons */}
      <Box className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Fab 
          color="primary" 
          aria-label="add job"
          onClick={() => setShowCommentModal(true)}
        >
          <Add />
        </Fab>
      </Box>

      {/* Modals */}
      <AddCommentModal 
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedJob(null);
        }}
        jobData={selectedJob ? {
          jobId: selectedJob.id,
          customer: selectedJob.customer,
          assignee: selectedJob.assignee,
          status: selectedJob.status === 'completed' ? 'Completed and Delivered' : selectedJob.status,
        } : undefined}
        onSubmit={(data) => {
          console.log('Comment submitted:', data);
          setShowCommentModal(false);
          setSelectedJob(null);
        }}
      />

      <AddPaymentModal 
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedJob(null);
        }}
        jobData={selectedJob ? {
          jobId: selectedJob.id,
          customer: selectedJob.customer,
          assignee: selectedJob.assignee,
          status: selectedJob.status === 'completed' ? 'Completed and Delivered' : selectedJob.status,
          payableAmount: selectedJob.amount,
          remainingAmount: selectedJob.amount,
        } : undefined}
        onSubmit={(data) => {
          console.log('Payment submitted:', data);
          setShowPaymentModal(false);
          setSelectedJob(null);
        }}
      />
    </Box>
  );
}