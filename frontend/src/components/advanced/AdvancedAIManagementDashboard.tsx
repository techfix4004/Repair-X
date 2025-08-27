'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Tab,
  Tabs,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  Badge,
  Rating,
} from '@mui/material';
import {
  Psychology,
  ModelTraining,
  PhotoCamera,
  Business,
  Timeline,
  Visibility,
  Add,
  PlayArrow,
  Stop,
  Refresh,
  CloudUpload,
  Analytics,
  CompareArrows,
  Security,
  Settings,
  TrendingUp,
  Assessment,
  Speed,
  CheckCircle,
  Warning,
  Error,
  AdminPanelSettings,
  GroupWork,
  AutoAwesome,
  SmartToy,
  PrecisionManufacturing,
  Science,
  Memory,
  Storage,
  Api,
  Webhook,
  VpnKey,
  Domain,
  Palette,
  Insights,
} from '@mui/icons-material';

/**
 * Advanced AI Management Dashboard - Phase 5
 * 
 * Comprehensive dashboard for enterprise AI features:
 * - ML Model Management & Monitoring
 * - Computer Vision Analytics
 * - Enterprise Integration Controls
 * - Multi-tenant SaaS Management
 * - Advanced Workflow Automation
 */

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
      id={`advanced-ai-tabpanel-${index}`}
      aria-labelledby={`advanced-ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdvancedAIManagementDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // State management for different features
  const [models, setModels] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [cvAnalytics, setCvAnalytics] = useState<any>({});
  const [systemMetrics, setSystemMetrics] = useState<any>({});

  // Dialog states
  const [modelDialog, setModelDialog] = useState(false);
  const [experimentDialog, setExperimentDialog] = useState(false);
  const [tenantDialog, setTenantDialog] = useState(false);
  const [imageUploadDialog, setImageUploadDialog] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      setModels([
        {
          id: 'model_001',
          name: 'Job Assignment Optimizer',
          type: 'CLASSIFICATION',
          accuracy: 0.893,
          status: 'DEPLOYED',
          version: '2.1.3',
          lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          predictions: 15672,
          latency: 45
        },
        {
          id: 'model_002',
          name: 'Damage Assessment CV',
          type: 'COMPUTER_VISION',
          accuracy: 0.915,
          status: 'TRAINING',
          version: '1.8.0',
          lastTrained: new Date(),
          predictions: 8934,
          latency: 120
        },
        {
          id: 'model_003',
          name: 'Pricing Optimization',
          type: 'REGRESSION',
          accuracy: 0.847,
          status: 'DEPLOYED',
          version: '3.2.1',
          lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          predictions: 23441,
          latency: 32
        }
      ]);

      setExperiments([
        {
          id: 'exp_001',
          name: 'Pricing Model A/B Test',
          modelA: 'Pricing v3.1',
          modelB: 'Pricing v3.2',
          status: 'RUNNING',
          trafficSplit: 20,
          confidence: 0.94,
          improvement: 8.3,
          duration: 7
        },
        {
          id: 'exp_002',
          name: 'CV Accuracy Improvement',
          modelA: 'CV v1.7',
          modelB: 'CV v1.8',
          status: 'COMPLETED',
          trafficSplit: 50,
          confidence: 0.99,
          improvement: 12.1,
          duration: 14
        }
      ]);

      setTenants([
        {
          id: 'tenant_001',
          name: 'TechFix Pro',
          plan: 'ENTERPRISE',
          users: 147,
          apiCalls: 89234,
          mrr: 299,
          status: 'ACTIVE',
          features: ['SSO', 'White-label', 'AI Advanced']
        },
        {
          id: 'tenant_002',
          name: 'QuickRepair Inc',
          plan: 'PROFESSIONAL',
          users: 23,
          apiCalls: 12455,
          mrr: 99,
          status: 'ACTIVE',
          features: ['AI Basic', 'Integrations']
        }
      ]);

      setCvAnalytics({
        totalAnalyses: 34567,
        accuracyRate: 0.924,
        avgProcessingTime: 2.8,
        damageTypes: {
          'CRACK': 8943,
          'SCRATCH': 5671,
          'WATER_DAMAGE': 2134,
          'BROKEN_PART': 3892
        }
      });

      setSystemMetrics({
        uptime: 99.97,
        totalRequests: 2456789,
        avgResponseTime: 89,
        errorRate: 0.003,
        aiDecisions: 456789
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEPLOYED':
      case 'ACTIVE':
      case 'COMPLETED':
        return 'success';
      case 'TRAINING':
      case 'RUNNING':
        return 'primary';
      case 'ERROR':
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 1
          }}
        >
          Advanced AI Management
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          Phase 5: Enterprise AI Features & Integration Platform
        </Typography>
        
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {models.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      AI Models Active
                    </Typography>
                  </Box>
                  <ModelTraining sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatNumber(systemMetrics.aiDecisions || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      AI Decisions Made
                    </Typography>
                  </Box>
                  <Psychology sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatNumber(cvAnalytics.totalAnalyses || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      CV Analyses
                    </Typography>
                  </Box>
                  <PhotoCamera sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {tenants.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Active Tenants
                    </Typography>
                  </Box>
                  <Business sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minWidth: 120,
              textTransform: 'none',
              fontWeight: 600
            }
          }}
        >
          <Tab 
            icon={<ModelTraining />} 
            label="ML Models" 
            iconPosition="start"
          />
          <Tab 
            icon={<PhotoCamera />} 
            label="Computer Vision" 
            iconPosition="start"
          />
          <Tab 
            icon={<Science />} 
            label="A/B Testing" 
            iconPosition="start"
          />
          <Tab 
            icon={<Business />} 
            label="Enterprise" 
            iconPosition="start"
          />
          <Tab 
            icon={<Api />} 
            label="Integrations" 
            iconPosition="start"
          />
          <Tab 
            icon={<Analytics />} 
            label="Analytics" 
            iconPosition="start"
          />
        </Tabs>

        {/* ML Models Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Machine Learning Models
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadDashboardData}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setModelDialog(true)}
                  >
                    Create Model
                  </Button>
                </Box>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Model Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Accuracy</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Predictions</TableCell>
                      <TableCell>Latency</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SmartToy sx={{ mr: 1, color: 'primary.main' }} />
                            {model.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={model.type} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={model.status}
                            color={getStatusColor(model.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {(model.accuracy * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={model.accuracy * 100}
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{model.version}</TableCell>
                        <TableCell>{formatNumber(model.predictions)}</TableCell>
                        <TableCell>{model.latency}ms</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Retrain">
                              <IconButton size="small">
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Settings">
                              <IconButton size="small">
                                <Settings />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Computer Vision Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Computer Vision Analytics
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => setImageUploadDialog(true)}
                >
                  Analyze Image
                </Button>
              </Box>
            </Grid>

            {/* CV Performance Metrics */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Analysis Performance
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Accuracy Rate
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={cvAnalytics.accuracyRate * 100}
                        sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {(cvAnalytics.accuracyRate * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Avg Processing Time
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {cvAnalytics.avgProcessingTime}s
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Analyses
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatNumber(cvAnalytics.totalAnalyses)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Damage Type Distribution */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Damage Type Distribution
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(cvAnalytics.damageTypes || {}).map(([type, count]) => (
                      <Grid item xs={6} sm={3} key={type}>
                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                          <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {formatNumber(count as number)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {type.replace('_', ' ')}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Analyses */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Analyses
                  </Typography>
                  <List>
                    {[
                      { id: 1, device: 'iPhone 15 Pro', damage: 'Screen Crack', confidence: 0.94, time: '2 min ago' },
                      { id: 2, device: 'Samsung Galaxy S24', damage: 'Water Damage', confidence: 0.87, time: '5 min ago' },
                      { id: 3, device: 'iPad Pro', damage: 'Scratch', confidence: 0.92, time: '8 min ago' },
                    ].map((analysis) => (
                      <ListItem key={analysis.id} divider>
                        <ListItemIcon>
                          <PhotoCamera color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${analysis.device} - ${analysis.damage}`}
                          secondary={`Confidence: ${(analysis.confidence * 100).toFixed(1)}% • ${analysis.time}`}
                        />
                        <Rating 
                          value={analysis.confidence * 5} 
                          precision={0.1} 
                          size="small" 
                          readOnly 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* A/B Testing Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  A/B Testing Experiments
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setExperimentDialog(true)}
                >
                  Create Experiment
                </Button>
              </Box>
            </Grid>

            {experiments.map((experiment) => (
              <Grid item xs={12} md={6} key={experiment.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {experiment.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {experiment.modelA} vs {experiment.modelB}
                        </Typography>
                      </Box>
                      <Chip 
                        label={experiment.status}
                        color={getStatusColor(experiment.status) as any}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Traffic Split
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={experiment.trafficSplit}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {experiment.trafficSplit}% to Model B
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                          <Typography variant="body2" color="textSecondary">
                            Confidence
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {(experiment.confidence * 100).toFixed(1)}%
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                          <Typography variant="body2" color="textSecondary">
                            Improvement
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            +{experiment.improvement}%
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Running for {experiment.duration} days
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color={experiment.status === 'RUNNING' ? 'error' : 'primary'}>
                          {experiment.status === 'RUNNING' ? <Stop /> : <PlayArrow />}
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Enterprise Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Multi-Tenant Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setTenantDialog(true)}
                >
                  Add Tenant
                </Button>
              </Box>
            </Grid>

            {tenants.map((tenant) => (
              <Grid item xs={12} md={6} key={tenant.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {tenant.name}
                        </Typography>
                        <Chip 
                          label={tenant.plan}
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Chip 
                        label={tenant.status}
                        color={getStatusColor(tenant.status) as any}
                        size="small"
                      />
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Users
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {tenant.users}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          API Calls
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {formatNumber(tenant.apiCalls)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          MRR
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          ${tenant.mrr}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Features
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {tenant.features.map((feature: string, index: number) => (
                          <Chip
                            key={index}
                            label={feature}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton size="small">
                        <Settings />
                      </IconButton>
                      <IconButton size="small">
                        <Analytics />
                      </IconButton>
                      <IconButton size="small">
                        <AdminPanelSettings />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Integrations Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Enterprise Integrations
              </Typography>
            </Grid>

            {/* SSO Configuration */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VpnKey sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Single Sign-On (SSO)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Configure SAML, OIDC, or LDAP authentication for enterprise customers.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="SAML Enabled"
                    />
                    <Chip label="3 Configured" color="success" size="small" />
                  </Box>
                  <Button variant="outlined" fullWidth>
                    Configure SSO
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* API Gateway */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Api sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      API Gateway
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Advanced rate limiting, analytics, and security for tenant APIs.
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Rate Limit
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        10K/hour
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Success Rate
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        99.7%
                      </Typography>
                    </Grid>
                  </Grid>
                  <Button variant="outlined" fullWidth>
                    Gateway Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Webhooks */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Webhook sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Webhooks
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Real-time event notifications for job updates and system events.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2">
                      Active Webhooks
                    </Typography>
                    <Badge badgeContent={7} color="primary">
                      <Webhook />
                    </Badge>
                  </Box>
                  <Button variant="outlined" fullWidth>
                    Manage Webhooks
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* White-Label */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Palette sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      White-Label Platform
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Custom branding, domains, and UI customization for enterprise clients.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2">
                      Custom Domains
                    </Typography>
                    <Chip label="2 Active" color="success" size="small" />
                  </Box>
                  <Button variant="outlined" fullWidth>
                    Brand Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                System Analytics & Performance
              </Typography>
            </Grid>

            {/* System Health */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CircularProgress
                    variant="determinate"
                    value={systemMetrics.uptime}
                    size={80}
                    thickness={4}
                    sx={{ 
                      color: systemMetrics.uptime > 99 ? 'success.main' : 'warning.main',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {systemMetrics.uptime}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    System Uptime
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Speed sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {systemMetrics.avgResponseTime}ms
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Response Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(systemMetrics.totalRequests)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    {systemMetrics.errorRate < 0.01 ? (
                      <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
                    ) : (
                      <Warning sx={{ fontSize: 60, color: 'warning.main' }} />
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {(systemMetrics.errorRate * 100).toFixed(3)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Error Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Trends */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Performance Trends
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Real-time performance monitoring shows optimal system health across all AI services.
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                        <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                          92.4%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          AI Accuracy
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          1.2s
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          AI Response Time
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>
                          847GB
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Data Processed
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
                        <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>
                          $45K
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Cost Savings
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Loading Overlay */}
      {loading && (
        <Box 
          sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Create Model Dialog */}
      <Dialog 
        open={modelDialog} 
        onClose={() => setModelDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New AI Model</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Model Name"
                placeholder="e.g., Advanced Damage Assessment"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Model Type</InputLabel>
                <Select label="Model Type">
                  <MenuItem value="CLASSIFICATION">Classification</MenuItem>
                  <MenuItem value="REGRESSION">Regression</MenuItem>
                  <MenuItem value="COMPUTER_VISION">Computer Vision</MenuItem>
                  <MenuItem value="NLP">Natural Language Processing</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Training Data Source</InputLabel>
                <Select label="Training Data Source">
                  <MenuItem value="historical">Historical Data</MenuItem>
                  <MenuItem value="synthetic">Synthetic Data</MenuItem>
                  <MenuItem value="external">External Dataset</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Features"
                placeholder="device_type, damage_severity, location, technician_rating"
                helperText="Comma-separated list of features"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModelDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Create & Train
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedAIManagementDashboard;