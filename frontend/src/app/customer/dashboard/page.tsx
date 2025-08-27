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
  CardActions,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tab,
  Tabs,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  AppBar,
  Toolbar,
  Badge,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Fab,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  CameraAlt as CameraIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';

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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Sample data
const activeJobs = [
  {
    id: 'JOB-001',
    device: 'iPhone 14 Pro',
    issue: 'Screen replacement',
    technician: 'John Smith',
    status: 'In Progress',
    progress: 75,
    estimatedCompletion: '2024-01-15T14:00:00',
    lastUpdate: '2024-01-14T10:30:00',
  },
  {
    id: 'JOB-002',
    device: 'MacBook Air M2',
    issue: 'Battery replacement',
    technician: 'Sarah Johnson',
    status: 'Diagnosis',
    progress: 25,
    estimatedCompletion: '2024-01-16T16:00:00',
    lastUpdate: '2024-01-14T09:15:00',
  },
];

const jobHistory = [
  {
    id: 'JOB-H001',
    device: 'Samsung Galaxy S23',
    issue: 'Water damage repair',
    completedDate: '2024-01-10',
    cost: 250,
    rating: 5,
    technician: 'Mike Wilson',
  },
  {
    id: 'JOB-H002',
    device: 'iPad Pro',
    issue: 'Screen cracked',
    completedDate: '2023-12-28',
    cost: 180,
    rating: 4,
    technician: 'Lisa Chen',
  },
];

const jobSteps = [
  { label: 'Request Submitted', completed: true },
  { label: 'Technician Assigned', completed: true },
  { label: 'Diagnosis Complete', completed: true },
  { label: 'Repair in Progress', completed: false },
  { label: 'Quality Check', completed: false },
  { label: 'Ready for Pickup', completed: false },
];

export default function CustomerDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [newJobDialog, setNewJobDialog] = useState(false);
  const [supportDialog, setSupportDialog] = useState(false);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Welcome back, Alex!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer Portal
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton color="primary">
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Quick Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Active Jobs
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {activeJobs.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BuildIcon />
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
                      Completed Jobs
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {jobHistory.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircleIcon />
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
                      Total Spent
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      ${jobHistory.reduce((sum, job) => sum + job.cost, 0)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <PaymentIcon />
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
                      Avg. Rating
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {(jobHistory.reduce((sum, job) => sum + job.rating, 0) / jobHistory.length).toFixed(1)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <StarIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<DashboardIcon />} label="Active Jobs" />
            <Tab icon={<HistoryIcon />} label="Job History" />
            <Tab icon={<PaymentIcon />} label="Billing" />
            <Tab icon={<SupportIcon />} label="Support" />
          </Tabs>
        </Paper>

        {/* Active Jobs Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            {activeJobs.map((job) => (
              <Grid item xs={12} lg={6} key={job.id}>
                <Card>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <BuildIcon />
                      </Avatar>
                    }
                    title={job.device}
                    subheader={`Job ID: ${job.id}`}
                    action={
                      <Chip 
                        label={job.status} 
                        color={job.status === 'In Progress' ? 'primary' : 'warning'}
                        variant="outlined"
                      />
                    }
                  />
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      <strong>Issue:</strong> {job.issue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Technician:</strong> {job.technician}
                    </Typography>
                    
                    <Box mt={2} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2" fontWeight={600}>{job.progress}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={job.progress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Est. completion: {new Date(job.estimatedCompletion).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Job Progress Stepper */}
                    <Stepper activeStep={2} orientation="vertical" sx={{ mt: 2 }}>
                      {jobSteps.map((step, index) => (
                        <Step key={step.label} completed={step.completed}>
                          <StepLabel>{step.label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </CardContent>
                  <CardActions>
                    <Button startIcon={<ChatIcon />} size="small">
                      Chat with Technician
                    </Button>
                    <Button startIcon={<LocationIcon />} size="small">
                      Track Location
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}

            {/* Real-time Updates Timeline */}
            <Grid item xs={12} lg={6}>
              <Card>
                <CardHeader 
                  title="Recent Updates" 
                  subheader="Real-time job progress updates"
                />
                <CardContent>
                  <Timeline>
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          <BuildIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" fontWeight={600}>
                          Screen replacement started
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          10:30 AM - John Smith
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color="success">
                          <CheckCircleIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" fontWeight={600}>
                          Diagnosis completed
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          9:15 AM - Sarah Johnson
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color="warning">
                          <HourglassIcon />
                        </TimelineDot>
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" fontWeight={600}>
                          Waiting for parts approval
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          8:45 AM - System
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Job History Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={3}>
            {jobHistory.map((job) => (
              <Grid item xs={12} md={6} key={job.id}>
                <Card>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <CheckCircleIcon />
                      </Avatar>
                    }
                    title={job.device}
                    subheader={`Completed on ${job.completedDate}`}
                  />
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      <strong>Issue:</strong> {job.issue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Technician:</strong> {job.technician}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Cost:</strong> ${job.cost}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mt={2}>
                      <Typography variant="body2" mr={1}>Rating:</Typography>
                      <Rating value={job.rating} readOnly size="small" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button startIcon={<ReceiptIcon />} size="small">
                      View Invoice
                    </Button>
                    <Button startIcon={<ChatIcon />} size="small">
                      Contact Support
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Billing Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader 
                  title="Billing & Payment History" 
                  subheader="Manage your payments and view billing history"
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Methods
                  </Typography>
                  <Typography color="text.secondary" mb={3}>
                    Advanced billing management coming soon. You&apos;ll be able to manage payment methods, 
                    view detailed invoices, and set up automatic payments.
                  </Typography>
                  
                  <Button variant="contained" startIcon={<PaymentIcon />}>
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Support Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Contact Support" />
                <CardContent>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ChatIcon />}
                      size="large"
                    >
                      Live Chat Support
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<PhoneIcon />}
                      size="large"
                    >
                      Call Support: (555) 123-4567
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<EmailIcon />}
                      size="large"
                    >
                      Email: support@repairx.com
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="FAQ & Help Center" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Find answers to common questions and browse our knowledge base.
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Visit Help Center
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>

      {/* Floating Action Button for New Job */}
      <Fab
        color="primary"
        aria-label="create new job"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setNewJobDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* New Job Dialog */}
      <Dialog open={newJobDialog} onClose={() => setNewJobDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Repair Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Request Form</Typography>
            <Typography color="text.secondary" mb={3}>
              Complete job request system with device selection, issue description, 
              photo upload, and appointment scheduling will be available here.
            </Typography>
            
            <TextField
              fullWidth
              label="Device Type"
              placeholder="e.g., iPhone 14 Pro, MacBook Air"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Describe the Issue"
              placeholder="Please describe what's wrong with your device..."
              sx={{ mb: 2 }}
            />
            
            <Box display="flex" gap={2} mb={2}>
              <Button variant="outlined" startIcon={<CameraIcon />}>
                Add Photos
              </Button>
              <Button variant="outlined" startIcon={<AttachFileIcon />}>
                Attach Files
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewJobDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setNewJobDialog(false)}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}