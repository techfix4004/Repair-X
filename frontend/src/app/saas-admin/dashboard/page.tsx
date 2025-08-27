'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  AppBar,
  Toolbar,
  Badge,
  LinearProgress,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Divider,
  Alert,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  CloudQueue as CloudIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AdminPanelSettings as AdminIcon,
  Public as GlobalIcon,
  AccountTree as TenantIcon,
  Payments as BillingIcon,
  Assessment as ReportsIcon,
  WhiteBalance as WhiteLabelIcon,
  Monitor as MonitoringIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`saas-admin-tabpanel-${index}`}
      aria-labelledby={`saas-admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SaaSAdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with real API calls
  const platformMetrics = {
    totalTenants: 28,
    activeUsers: 847,
    monthlyRevenue: 67000,
    systemUptime: 99.9,
    apiCalls: 2.8,
    storageUsed: 2.4,
  };

  const revenueData = [
    { month: 'Jan', revenue: 35000, tenants: 22 },
    { month: 'Feb', revenue: 42000, tenants: 24 },
    { month: 'Mar', revenue: 48000, tenants: 25 },
    { month: 'Apr', revenue: 52000, tenants: 26 },
    { month: 'May', revenue: 58000, tenants: 27 },
    { month: 'Jun', revenue: 67000, tenants: 28 },
  ];

  const tenantDistribution = [
    { name: 'Enterprise', value: 15, color: '#8884d8' },
    { name: 'Professional', value: 8, color: '#82ca9d' },
    { name: 'Starter', value: 5, color: '#ffc658' },
  ];

  const activeTenants = [
    { id: 'tenant-1', name: 'TechRepair Pro', domain: 'techrepair.repairx.com', plan: 'Enterprise', users: 45, revenue: 2500, status: 'active' },
    { id: 'tenant-2', name: 'QuickFix Solutions', domain: 'quickfix.repairx.com', plan: 'Professional', users: 23, revenue: 1200, status: 'active' },
    { id: 'tenant-3', name: 'Mobile Masters', domain: 'mobilemasters.repairx.com', plan: 'Enterprise', users: 67, revenue: 3200, status: 'active' },
    { id: 'tenant-4', name: 'Gadget Guru', domain: 'gadgetguru.repairx.com', plan: 'Starter', users: 12, revenue: 500, status: 'trial' },
    { id: 'tenant-5', name: 'Device Doctors', domain: 'devicedoctors.repairx.com', plan: 'Professional', users: 34, revenue: 1800, status: 'active' },
  ];

  const systemHealth = [
    { service: 'Main API Gateway', status: 'operational', uptime: 99.9, responseTime: 145 },
    { service: 'Database Cluster', status: 'operational', uptime: 99.8, responseTime: 23 },
    { service: 'File Storage', status: 'operational', uptime: 99.9, responseTime: 67 },
    { service: 'Background Jobs', status: 'operational', uptime: 99.7, responseTime: 234 },
    { service: 'Email Service', status: 'degraded', uptime: 98.5, responseTime: 567 },
    { service: 'SMS Gateway', status: 'operational', uptime: 99.6, responseTime: 189 },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return 'primary';
      case 'Professional': return 'secondary';
      case 'Starter': return 'warning';
      default: return 'default';
    }
  };

  const tabs = [
    { label: 'Overview', icon: <DashboardIcon /> },
    { label: 'Tenants', icon: <TenantIcon /> },
    { label: 'Analytics', icon: <AnalyticsIcon /> },
    { label: 'Billing', icon: <BillingIcon /> },
    { label: 'System Health', icon: <MonitoringIcon /> },
    { label: 'Global Settings', icon: <SettingsIcon /> },
  ];

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box textAlign="center">
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
            <AdminIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" mb={2}>Loading SaaS Platform...</Typography>
          <LinearProgress sx={{ width: 300 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'warning.main' }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: 'warning.dark', mr: 2 }}>
            <AdminIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" fontWeight={700}>
              RepairX SaaS
            </Typography>
            <Typography variant="body2" color="warning.100">
              Platform Administration
            </Typography>
          </Box>
          <Chip 
            icon={<CheckCircleIcon />}
            label="All Systems Operational" 
            color="success" 
            sx={{ mr: 2 }}
          />
          <Badge badgeContent={7} color="error">
            <NotificationsIcon />
          </Badge>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Platform Metrics Overview */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={600}>
              <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="white" fontWeight={700}>
                        {platformMetrics.totalTenants}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Active Tenants
                      </Typography>
                    </Box>
                    <TenantIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={700}>
              <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="white" fontWeight={700}>
                        {platformMetrics.activeUsers}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Active Users
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={800}>
              <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="white" fontWeight={700}>
                        ${platformMetrics.monthlyRevenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Monthly Revenue
                      </Typography>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={900}>
              <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="white" fontWeight={700}>
                        {platformMetrics.systemUptime}%
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Uptime
                      </Typography>
                    </Box>
                    <SpeedIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={1000}>
              <Card sx={{ background: 'linear-gradient(45deg, #607D8B 30%, #90A4AE 90%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="white" fontWeight={700}>
                        {platformMetrics.apiCalls}M
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        API Calls
                      </Typography>
                    </Box>
                    <CloudIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={1100}>
              <Card sx={{ background: 'linear-gradient(45deg, #795548 30%, #A1887F 90%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="white" fontWeight={700}>
                        {platformMetrics.storageUsed}TB
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Storage Used
                      </Typography>
                    </Box>
                    <StorageIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      {tab.icon}
                      {tab.label}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={currentTab} index={0}>
            <Grid container spacing={3}>
              {/* Platform Revenue Growth */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardHeader
                    title="Platform Revenue Growth"
                    subheader="Monthly recurring revenue and tenant acquisition"
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <TrendingUpIcon />
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="revenue" orientation="left" />
                        <YAxis yAxisId="tenants" orientation="right" />
                        <Tooltip />
                        <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
                        <Line yAxisId="tenants" type="monotone" dataKey="tenants" stroke="#82ca9d" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Growth Metrics */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title="Growth Metrics"
                    avatar={
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <AnalyticsIcon />
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Box mb={3}>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        Monthly Recurring Revenue
                      </Typography>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        $67,000
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +15.8% from last month
                      </Typography>
                    </Box>

                    <Box mb={3}>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        Customer Acquisition Cost
                      </Typography>
                      <Typography variant="h4" color="secondary.main" fontWeight={700}>
                        $124
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        -8.2% from last month
                      </Typography>
                    </Box>

                    <Box mb={3}>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        Churn Rate
                      </Typography>
                      <Typography variant="h4" color="warning.main" fontWeight={700}>
                        2.1%
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +0.3% from last month
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        Average Revenue Per User
                      </Typography>
                      <Typography variant="h4" color="info.main" fontWeight={700}>
                        $79
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +5.1% from last month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tenants Tab */}
          <TabPanel value={currentTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardHeader
                    title="Active Tenants"
                    subheader="Multi-tenant platform management"
                    action={
                      <Button variant="contained" startIcon={<BusinessIcon />}>
                        Add Tenant
                      </Button>
                    }
                  />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Organization</TableCell>
                            <TableCell>Plan</TableCell>
                            <TableCell>Users</TableCell>
                            <TableCell>Revenue</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activeTenants.map((tenant) => (
                            <TableRow key={tenant.id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {tenant.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {tenant.domain}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip label={tenant.plan} color={getPlanColor(tenant.plan)} size="small" />
                              </TableCell>
                              <TableCell>{tenant.users}</TableCell>
                              <TableCell>${tenant.revenue}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={tenant.status} 
                                  color={tenant.status === 'active' ? 'success' : 'warning'} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>
                                <Button size="small" variant="outlined">
                                  Manage
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card>
                  <CardHeader title="Tenant Distribution" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={tenantDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {tenantDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* System Health Tab */}
          <TabPanel value={currentTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="h6" mb={1}>System Health Monitoring</Typography>
                  <Typography>
                    Real-time monitoring of all platform services and infrastructure components.
                  </Typography>
                </Alert>
              </Grid>

              {systemHealth.map((service, index) => (
                <Grid item xs={12} md={6} lg={4} key={service.service}>
                  <Fade in timeout={600 + index * 100}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Typography variant="h6" fontWeight={500}>
                            {service.service}
                          </Typography>
                          <Chip 
                            label={service.status} 
                            color={getStatusColor(service.status)} 
                            size="small" 
                          />
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Uptime: {service.uptime}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={service.uptime} 
                            color={service.uptime > 99 ? 'success' : service.uptime > 98 ? 'warning' : 'error'}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Response Time: {service.responseTime}ms
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Other tabs placeholder */}
          <TabPanel value={currentTab} index={2}>
            <Typography variant="h5" gutterBottom>Advanced Analytics</Typography>
            <Typography>Platform-wide analytics and business intelligence dashboard will be implemented here.</Typography>
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <Typography variant="h5" gutterBottom>Billing Management</Typography>
            <Typography>Subscription billing, payment processing, and revenue management will be implemented here.</Typography>
          </TabPanel>

          <TabPanel value={currentTab} index={5}>
            <Typography variant="h5" gutterBottom>Global Platform Settings</Typography>
            <Typography>Platform-wide configuration, white-label settings, and system administration will be implemented here.</Typography>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default SaaSAdminDashboard;