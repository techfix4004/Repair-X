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
  Chip,
  Avatar,
  Button,
  IconButton,
  Tab,
  Tabs,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  AppBar,
  Toolbar,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Paper,
  SwipeableDrawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Map as MapIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Phone as PhoneIcon,
  Navigation as NavigationIcon,
  CameraAlt as CameraIcon,
  Check as CheckIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Route as RouteIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  Note as NoteIcon,
  Settings as SettingsIcon,
  QrCodeScanner as QrCodeIcon,
  Inventory2 as PartsIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
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
      id={`technician-tabpanel-${index}`}
      aria-labelledby={`technician-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// Sample data
const todayJobs = [
  {
    id: 'JOB-001',
    customer: 'John Smith',
    device: 'iPhone 14 Pro',
    issue: 'Screen replacement',
    priority: 'High',
    timeSlot: '9:00 AM - 11:00 AM',
    address: '123 Main St, City',
    status: 'In Progress',
    estimatedDuration: 90,
    startTime: new Date().getTime() - 30 * 60 * 1000, // Started 30 minutes ago
  },
  {
    id: 'JOB-002',
    customer: 'Sarah Johnson',
    device: 'MacBook Air M2',
    issue: 'Battery replacement',
    priority: 'Medium',
    timeSlot: '2:00 PM - 4:00 PM',
    address: '456 Oak Ave, City',
    status: 'Scheduled',
    estimatedDuration: 120,
  },
  {
    id: 'JOB-003',
    customer: 'Mike Wilson',
    device: 'Samsung Galaxy S23',
    issue: 'Water damage assessment',
    priority: 'Urgent',
    timeSlot: '4:30 PM - 6:00 PM',
    address: '789 Pine Rd, City',
    status: 'Scheduled',
    estimatedDuration: 60,
  },
];

const technicianStats = {
  todayJobs: 3,
  completedJobs: 142,
  rating: 4.8,
  efficiency: 94,
};

export default function TechnicianDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [bottomNav, setBottomNav] = useState(0);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [jobDialog, setJobDialog] = useState(false);
  const [activeJob, setActiveJob] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setBottomNav(newValue);
    setSelectedTab(newValue);
  };

  const startJob = (jobId: string) => {
    setActiveJob(jobId);
    // In real app, would start timer and update job status
  };

  const pauseJob = () => {
    setActiveJob(null);
    // In real app, would pause timer
  };

  const speedDialActions = [
    { icon: <PhotoCameraIcon />, name: 'Take Photo' },
    { icon: <NoteIcon />, name: 'Add Note' },
    { icon: <QrCodeIcon />, name: 'Scan QR Code' },
    { icon: <PartsIcon />, name: 'Request Parts' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: isMobile ? 7 : 0 }}>
      {/* Mobile App Bar */}
      <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Tech Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Typography>
          </Box>

          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Quick Stats */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box textAlign="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {technicianStats.todayJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today&apos;s Jobs
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box textAlign="center">
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <CheckIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {technicianStats.completedJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box textAlign="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {technicianStats.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box textAlign="center">
                  <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    {technicianStats.efficiency}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Efficiency
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Active Job Indicator */}
        {activeJob && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                🔧 Active Job: {activeJob}
              </Typography>
              <Button
                variant="contained"
                color="warning"
                startIcon={<PauseIcon />}
                onClick={pauseJob}
              >
                Pause
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Timer: 00:30:45 | Estimated remaining: 1h 0m
            </Typography>
          </Paper>
        )}

        {/* Mobile Tabs */}
        {!isMobile && (
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<AssignmentIcon />} label="Today's Jobs" />
              <Tab icon={<MapIcon />} label="Route" />
              <Tab icon={<InventoryIcon />} label="Inventory" />
              <Tab icon={<PersonIcon />} label="Profile" />
            </Tabs>
          </Paper>
        )}

        {/* Today's Jobs Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Today&apos;s Schedule
          </Typography>
          
          <List>
            {todayJobs.map((job, index) => (
              <React.Fragment key={job.id}>
                <ListItem
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    mb: 2,
                    border: job.status === 'In Progress' ? 2 : 1,
                    borderColor: job.status === 'In Progress' ? 'primary.main' : 'divider',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: job.priority === 'Urgent' ? 'error.main' : 
                                job.priority === 'High' ? 'warning.main' : 'primary.main'
                      }}
                    >
                      <BuildIcon />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {job.customer}
                        </Typography>
                        <Chip 
                          label={job.priority} 
                          size="small"
                          color={
                            job.priority === 'Urgent' ? 'error' : 
                            job.priority === 'High' ? 'warning' : 'primary'
                          }
                        />
                        <Chip 
                          label={job.status}
                          size="small"
                          variant="outlined"
                          color={job.status === 'In Progress' ? 'primary' : 'default'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{job.device}:</strong> {job.issue}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1} gap={2}>
                          <Box display="flex" alignItems="center">
                            <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {job.timeSlot}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center">
                            <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {job.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {job.status === 'Scheduled' ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<StartIcon />}
                          onClick={() => startJob(job.id)}
                        >
                          Start
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<NavigationIcon />}
                        >
                          Navigate
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PhoneIcon />}
                      >
                        Call
                      </Button>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Route Optimization Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Card>
            <CardHeader 
              title="Route Optimization" 
              subheader="AI-optimized route for today's jobs"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Advanced route optimization with real-time traffic updates, GPS navigation 
                integration, and efficiency tracking will be available here.
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" startIcon={<RouteIcon />}>
                  Start Navigation
                </Button>
                <Button variant="outlined" startIcon={<NavigationIcon />}>
                  View on Map
                </Button>
                <Button variant="outlined" startIcon={<TimeIcon />}>
                  Optimize Route
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Inventory Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Card>
            <CardHeader 
              title="Mobile Inventory" 
              subheader="Parts and tools tracking"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Real-time inventory management including parts scanning, stock levels, 
                automatic reordering, and usage tracking will be implemented here.
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" startIcon={<QrCodeIcon />}>
                  Scan Part
                </Button>
                <Button variant="outlined" startIcon={<PartsIcon />}>
                  Request Parts
                </Button>
                <Button variant="outlined" startIcon={<InventoryIcon />}>
                  Check Stock
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Profile Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Card>
            <CardHeader 
              title="Technician Profile" 
              subheader="Performance and settings"
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Comprehensive technician profile with performance metrics, skill assessments, 
                training progress, and personal settings will be available here.
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button variant="contained" startIcon={<PersonIcon />}>
                  Edit Profile
                </Button>
                <Button variant="outlined" startIcon={<SettingsIcon />}>
                  Settings
                </Button>
                <Button variant="outlined" startIcon={<TrendingUpIcon />}>
                  Performance
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNavigation
          value={bottomNav}
          onChange={handleBottomNavChange}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <BottomNavigationAction label="Jobs" icon={<AssignmentIcon />} />
          <BottomNavigationAction label="Route" icon={<MapIcon />} />
          <BottomNavigationAction label="Inventory" icon={<InventoryIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      )}

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: isMobile ? 80 : 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => setSpeedDialOpen(false)}
          />
        ))}
      </SpeedDial>

      {/* Mobile Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <Box sx={{ width: 280, p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                John Technician
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Senior Repair Tech
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <List>
            <ListItem button>
              <ListItemText primary="Today's Schedule" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Job History" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Performance Metrics" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Training Center" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
}