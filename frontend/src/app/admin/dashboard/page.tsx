'use client';

import React, { useState } from 'react';
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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DRAWER_WIDTH = 280;

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 12000, jobs: 45 },
  { month: 'Feb', revenue: 19000, jobs: 52 },
  { month: 'Mar', revenue: 15000, jobs: 48 },
  { month: 'Apr', revenue: 22000, jobs: 61 },
  { month: 'May', revenue: 18000, jobs: 55 },
  { month: 'Jun', revenue: 25000, jobs: 68 },
];

const jobStatusData = [
  { name: 'Completed', value: 45, color: '#10b981' },
  { name: 'In Progress', value: 23, color: '#f59e0b' },
  { name: 'Pending', value: 18, color: '#6b7280' },
  { name: 'Cancelled', value: 8, color: '#ef4444' },
];

const navigation = [
  { name: 'Dashboard', icon: DashboardIcon, href: '/admin/dashboard', current: true },
  { name: 'Job Workflow', icon: AssignmentIcon, href: '/admin/workflow', count: 12 },
  { name: 'Customer CRM', icon: PeopleIcon, href: '/admin/crm', count: 8 },
  { name: 'Billing System', icon: MoneyIcon, href: '/admin/billing' },
  { name: 'Inventory Mgmt', icon: InventoryIcon, href: '/admin/inventory', count: 3 },
  { name: 'AI Analytics', icon: AnalyticsIcon, href: '/admin/analytics' },
  { name: 'Technicians', icon: PeopleIcon, href: '/admin/technicians' },
  { name: 'Settings', icon: SettingsIcon, href: '/admin/settings' },
];

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>🔧</Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>RepairX Admin</Typography>
            <Typography variant="body2" color="text.secondary">Business Management</Typography>
          </Box>
        </Box>
      </Box>
      
      <List sx={{ pt: 0 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                sx={{
                  py: 1.5,
                  px: 3,
                  bgcolor: item.current ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  borderRight: item.current ? 3 : 0,
                  borderRightColor: 'primary.main',
                }}
              >
                <ListItemIcon>
                  <Badge badgeContent={item.count} color="error">
                    <Icon color={item.current ? 'primary' : 'inherit'} />
                  </Badge>
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: item.current ? 600 : 400,
                    color: item.current ? 'primary.main' : 'text.primary',
                  }}
                />
                <ChevronRightIcon fontSize="small" />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Business Dashboard
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="primary">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main' }}>AD</Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        <Container maxWidth="xl">
          {/* Key Metrics Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        $124,580
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUpIcon color="success" fontSize="small" />
                        <Typography variant="body2" color="success.main" ml={0.5}>
                          +12.5%
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                      <MoneyIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Active Jobs
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        94
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TimeIcon color="warning" fontSize="small" />
                        <Typography variant="body2" color="warning.main" ml={0.5}>
                          23 urgent
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <AssignmentIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Technicians
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        28
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2" color="success.main" ml={0.5}>
                          25 active
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                      <PeopleIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Customer Satisfaction
                      </Typography>
                      <Typography variant="h4" fontWeight={600}>
                        96%
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <SpeedIcon color="success" fontSize="small" />
                        <Typography variant="body2" color="success.main" ml={0.5}>
                          4.8/5 rating
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                      <AnalyticsIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs for Different Views */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<TimelineIcon />} label="Performance Analytics" />
              <Tab icon={<PieChartIcon />} label="Job Distribution" />
              <Tab icon={<BarChartIcon />} label="Financial Reports" />
              <Tab icon={<SpeedIcon />} label="Operations" />
            </Tabs>
          </Paper>

          {/* Tab Panels */}
          <TabPanel value={selectedTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardHeader 
                    title="Revenue & Job Trends" 
                    subheader="Monthly performance overview"
                  />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke={theme.palette.primary.main}
                          fill={alpha(theme.palette.primary.main, 0.1)}
                          strokeWidth={2}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="jobs"
                          stroke={theme.palette.secondary.main}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title="Quick Actions" />
                  <CardContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AssignmentIcon />}
                        size="large"
                      >
                        Create New Job
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PeopleIcon />}
                        size="large"
                      >
                        Add Technician
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<InventoryIcon />}
                        size="large"
                      >
                        Manage Inventory
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<AnalyticsIcon />}
                        size="large"
                      >
                        View Reports
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Job Status Distribution" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={jobStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {jobStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Performance Metrics" />
                  <CardContent>
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Job Completion Rate</Typography>
                        <Typography variant="body2" fontWeight={600}>87%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={87} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Average Response Time</Typography>
                        <Typography variant="body2" fontWeight={600}>2.3 hrs</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={76} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Customer Satisfaction</Typography>
                        <Typography variant="body2" fontWeight={600}>96%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={96} color="success" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Technician Utilization</Typography>
                        <Typography variant="body2" fontWeight={600}>82%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={82} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={selectedTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Financial Overview" 
                    subheader="Revenue, expenses, and profit analysis"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Coming Soon: Advanced Financial Analytics</Typography>
                    <Typography color="text.secondary">
                      Comprehensive financial reporting including revenue tracking, expense management, 
                      profit margins, and forecasting will be available in this section.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={selectedTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Operations Management" 
                    subheader="Team management, scheduling, and workflow optimization"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Coming Soon: Operations Dashboard</Typography>
                    <Typography color="text.secondary">
                      Advanced operations management including technician scheduling, route optimization, 
                      inventory management, and workflow automation will be available here.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
}