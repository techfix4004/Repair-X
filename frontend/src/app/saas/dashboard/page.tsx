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
  Drawer,
  AppBar,
  Toolbar,
  Badge,
  LinearProgress,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as MoneyIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  CloudQueue as CloudIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PowerSettingsNew as PowerIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  Language as GlobalIcon,
  AccountBalance as BillingIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DRAWER_WIDTH = 300;

// Sample data
const tenantData = [
  {
    id: 'tenant-1',
    name: 'TechFix Solutions',
    status: 'active',
    plan: 'Enterprise',
    users: 45,
    revenue: 2850,
    lastActive: '2024-01-14',
    region: 'US-East',
    usage: 78,
  },
  {
    id: 'tenant-2',
    name: 'QuickRepair Inc',
    status: 'active',
    plan: 'Professional',
    users: 23,
    revenue: 1420,
    lastActive: '2024-01-14',
    region: 'US-West',
    usage: 56,
  },
  {
    id: 'tenant-3',
    name: 'Mobile Fix Pro',
    status: 'trial',
    plan: 'Trial',
    users: 8,
    revenue: 0,
    lastActive: '2024-01-13',
    region: 'EU-Central',
    usage: 23,
  },
];

const revenueData = [
  { month: 'Jan', revenue: 45000, tenants: 12 },
  { month: 'Feb', revenue: 52000, tenants: 15 },
  { month: 'Mar', revenue: 48000, tenants: 18 },
  { month: 'Apr', revenue: 61000, tenants: 22 },
  { month: 'May', revenue: 58000, tenants: 25 },
  { month: 'Jun', revenue: 67000, tenants: 28 },
];

const systemMetrics = {
  totalTenants: 28,
  activeUsers: 847,
  totalRevenue: 67000,
  systemUptime: 99.9,
  apiCalls: 2840000,
  storageUsed: 2.4, // TB
};

const navigation = [
  { name: 'Overview', icon: DashboardIcon, href: '/saas/dashboard', current: true },
  { name: 'Tenants', icon: BusinessIcon, href: '/saas/tenants', count: 28 },
  { name: 'Users', icon: PeopleIcon, href: '/saas/users' },
  { name: 'Analytics', icon: AnalyticsIcon, href: '/saas/analytics' },
  { name: 'Billing', icon: BillingIcon, href: '/saas/billing' },
  { name: 'Infrastructure', icon: CloudIcon, href: '/saas/infrastructure' },
  { name: 'Security', icon: SecurityIcon, href: '/saas/security' },
  { name: 'Settings', icon: SettingsIcon, href: '/saas/settings' },
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
      id={`saas-tabpanel-${index}`}
      aria-labelledby={`saas-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SaaSDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [tenantDialog, setTenantDialog] = useState(false);
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
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>RepairX SaaS</Typography>
            <Typography variant="body2" color="text.secondary">Platform Administration</Typography>
          </Box>
        </Box>
      </Box>
      
      <List sx={{ pt: 0 }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemText>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.5,
                    px: 3,
                    bgcolor: item.current ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    borderRight: item.current ? 3 : 0,
                    borderRightColor: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <Badge badgeContent={item.count} color="error">
                    <Icon color={item.current ? 'primary' : 'inherit'} sx={{ mr: 2 }} />
                  </Badge>
                  <Typography
                    fontWeight={item.current ? 600 : 400}
                    color={item.current ? 'primary.main' : 'text.primary'}
                  >
                    {item.name}
                  </Typography>
                </Box>
              </ListItemText>
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
            SaaS Platform Dashboard
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              icon={<CheckCircleIcon />}
              label="All Systems Operational" 
              color="success" 
              variant="outlined" 
              size="small"
            />
            <IconButton color="primary">
              <Badge badgeContent={7} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main' }}>SA</Avatar>
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
          {/* Platform Metrics */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card>
                <CardContent>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      {systemMetrics.totalTenants}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Tenants
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card>
                <CardContent>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      {systemMetrics.activeUsers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card>
                <CardContent>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                      <MoneyIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      ${systemMetrics.totalRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card>
                <CardContent>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                      <SpeedIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      {systemMetrics.systemUptime}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uptime
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card>
                <CardContent>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                      <CloudIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      {(systemMetrics.apiCalls / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      API Calls
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card>
                <CardContent>
                  <Box textAlign="center">
                    <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                      <StorageIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      {systemMetrics.storageUsed}TB
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Storage Used
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Platform Overview Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<TrendingUpIcon />} label="Revenue Analytics" />
              <Tab icon={<BusinessIcon />} label="Tenant Management" />
              <Tab icon={<SecurityIcon />} label="System Health" />
              <Tab icon={<GlobalIcon />} label="Global Operations" />
            </Tabs>
          </Paper>

          {/* Revenue Analytics Tab */}
          <TabPanel value={selectedTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardHeader 
                    title="Platform Revenue Growth" 
                    subheader="Monthly recurring revenue and tenant acquisition"
                  />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
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
                          dataKey="tenants"
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
                  <CardHeader title="Growth Metrics" />
                  <CardContent>
                    <Box mb={3}>
                      <Typography variant="body2" gutterBottom>
                        Monthly Recurring Revenue
                      </Typography>
                      <Typography variant="h4" fontWeight={600} color="primary.main">
                        $67,000
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        +15.8% from last month
                      </Typography>
                    </Box>

                    <Box mb={3}>
                      <Typography variant="body2" gutterBottom>
                        Customer Acquisition Cost
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        $124
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        -8.2% from last month
                      </Typography>
                    </Box>

                    <Box mb={3}>
                      <Typography variant="body2" gutterBottom>
                        Churn Rate
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        2.1%
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        +0.3% from last month
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Average Revenue Per User
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
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

          {/* Tenant Management Tab */}
          <TabPanel value={selectedTab} index={1}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Tenant Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTenantDialog(true)}
              >
                Add New Tenant
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Usage</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenantData.map((tenant) => (
                    <TableRow key={tenant.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <BusinessIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {tenant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {tenant.region}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tenant.plan}
                          color={tenant.plan === 'Enterprise' ? 'primary' : 
                                tenant.plan === 'Professional' ? 'secondary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{tenant.users}</TableCell>
                      <TableCell>${tenant.revenue}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={tenant.usage} 
                            sx={{ width: 60, height: 6 }}
                          />
                          <Typography variant="body2">
                            {tenant.usage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tenant.status}
                          color={tenant.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="secondary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <PowerIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* System Health Tab */}
          <TabPanel value={selectedTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="System Status" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <CheckCircleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="API Gateway" 
                          secondary="All endpoints operational" 
                        />
                        <ListItemSecondaryAction>
                          <Chip label="Healthy" color="success" size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <CheckCircleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Database Cluster" 
                          secondary="Primary and replicas active" 
                        />
                        <ListItemSecondaryAction>
                          <Chip label="Healthy" color="success" size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <WarningIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Cache Layer" 
                          secondary="High memory usage detected" 
                        />
                        <ListItemSecondaryAction>
                          <Chip label="Warning" color="warning" size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>

                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <CheckCircleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Message Queue" 
                          secondary="Processing normally" 
                        />
                        <ListItemSecondaryAction>
                          <Chip label="Healthy" color="success" size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Performance Metrics" />
                  <CardContent>
                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">CPU Usage</Typography>
                        <Typography variant="body2" fontWeight={600}>42%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={42} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Memory Usage</Typography>
                        <Typography variant="body2" fontWeight={600}>68%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={68} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box mb={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Disk I/O</Typography>
                        <Typography variant="body2" fontWeight={600}>34%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={34} color="success" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>

                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Network Throughput</Typography>
                        <Typography variant="body2" fontWeight={600}>56%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={56} color="info" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Global Operations Tab */}
          <TabPanel value={selectedTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Global Operations Center" 
                    subheader="Multi-region deployment and monitoring"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Coming Soon: Global Operations Management</Typography>
                    <Typography color="text.secondary">
                      Comprehensive global operations including multi-region deployment monitoring, 
                      international compliance management, global analytics, and cross-region data synchronization 
                      will be available in this section.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Container>
      </Box>

      {/* Add Tenant Dialog */}
      <Dialog open={tenantDialog} onClose={() => setTenantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Tenant</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tenant Name"
                  placeholder="e.g., TechFix Solutions"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Plan</InputLabel>
                  <Select label="Plan" defaultValue="">
                    <MenuItem value="trial">Trial</MenuItem>
                    <MenuItem value="professional">Professional</MenuItem>
                    <MenuItem value="enterprise">Enterprise</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select label="Region" defaultValue="">
                    <MenuItem value="us-east">US East</MenuItem>
                    <MenuItem value="us-west">US West</MenuItem>
                    <MenuItem value="eu-central">EU Central</MenuItem>
                    <MenuItem value="asia-pacific">Asia Pacific</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  placeholder="admin@company.com"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTenantDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setTenantDialog(false)}>
            Create Tenant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}