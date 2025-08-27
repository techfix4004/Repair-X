'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
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
  useTheme,
  alpha,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Psychology,
  TrendingUp,
  MonetizationOn,
  Assignment,
  Analytics,
  Speed,
  Star,
  Warning,
  CheckCircle,
  Lightbulb,
  Engineering,
  SmartToy,
  PrecisionManufacturing,
  AttachMoney,
  Timeline,
  Assessment,
  Refresh,
  Settings,
  PlayArrow,
  BugReport,
  Schedule,
  Group,
  Business,
} from '@mui/icons-material';

/**
 * AI Integration Dashboard - Phase 4
 * 
 * Comprehensive dashboard for AI-powered features including:
 * - Intelligent Job Assignment Analytics
 * - Predictive Analytics Insights
 * - Smart Pricing Performance
 * - AI Model Performance Metrics
 * - Business Intelligence Recommendations
 */

interface AIMetrics {
  _totalAIDecisions: number;
  _averageConfidence: number;
  _costSavings: number;
  _revenueOptimization: number;
  _efficiency: number;
  _accuracy: number;
  _costReduction: number;
  _customerSatisfaction: number;
}

interface ModelPerformance {
  _intelligentJobAssignment: any;
  _repairTimePrediction: any;
  _partsFailurePrediction: any;
  _smartPricing: any;
  _qualityPrediction: any;
}

interface AIRecommendation {
  _category: string;
  _priority: 'LOW' | 'MEDIUM' | 'HIGH';
  _recommendation: string;
  _impact: string;
  _action: string;
}

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
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function AIDashboard() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [aiMetrics, setAiMetrics] = useState<AIMetrics | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [retrainingDialog, setRetrainingDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');

  // Load AI dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In production, this would call the actual API endpoints
      // For now, using sample data that matches the backend structure
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data matching backend response structure
      setAiMetrics({
        _totalAIDecisions: 3847,
        _averageConfidence: 91.7,
        _costSavings: 145000,
        _revenueOptimization: 18.7,
        _efficiency: 94.2,
        _accuracy: 89.1,
        _costReduction: 23.5,
        _customerSatisfaction: 96.1
      });

      setModelPerformance({
        _intelligentJobAssignment: {
          _modelVersion: 'v2.1.0',
          _accuracy: 89.3,
          _avgAssignmentScore: 84.2,
          _customerSatisfaction: 4.7,
          _totalAssignments: 1547,
          _lastUpdated: new Date('2025-08-25')
        },
        _repairTimePrediction: {
          _modelVersion: 'v3.2.1',
          _accuracy: 87.3,
          _meanAbsoluteError: 0.8,
          _totalPredictions: 2341,
          _lastTraining: new Date('2025-08-20')
        },
        _partsFailurePrediction: {
          _modelVersion: 'v2.1.0',
          _accuracy: 91.5,
          _precision: 0.89,
          _recall: 0.94,
          _totalPredictions: 856,
          _preventedFailures: 23
        },
        _smartPricing: {
          _modelVersion: 'v4.1.2',
          _pricingAccuracy: 89.5,
          _revenueOptimization: 18.7,
          _winRate: 76.3,
          _totalPricingDecisions: 1247
        },
        _qualityPrediction: {
          _modelVersion: 'v1.8.0',
          _accuracy: 85.7,
          _f1Score: 0.84,
          _qualityImprovement: 12.3,
          _totalPredictions: 1893
        }
      });

      setRecommendations([
        {
          _category: 'Job Assignment',
          _priority: 'HIGH',
          _recommendation: 'Review technician skill mappings - assignment scores below optimal',
          _impact: 'Improve job assignment accuracy by 15%',
          _action: 'Update technician profiles and skill assessments'
        },
        {
          _category: 'Predictive Analytics',
          _priority: 'MEDIUM',
          _recommendation: 'Retrain repair time prediction model with recent data',
          _impact: 'Improve time estimation accuracy by 8%',
          _action: 'Schedule model retraining with last 6 months of data'
        },
        {
          _category: 'Pricing Optimization',
          _priority: 'HIGH',
          _recommendation: 'Adjust pricing strategy - win rate below target',
          _impact: 'Increase quote conversion rate by 12%',
          _action: 'Review competitive positioning and price sensitivity'
        },
        {
          _category: 'Quality Management',
          _priority: 'LOW',
          _recommendation: 'Quality prediction model performing excellently',
          _impact: 'Maintain current high standards',
          _action: 'Continue monitoring and gradual improvements'
        }
      ]);

    } catch (error) {
      console.error('Error loading AI dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleRetrainModel = () => {
    // In production, this would call the retraining API
    console.log(`Retraining model: ${selectedModel}`);
    setRetrainingDialog(false);
    setSelectedModel('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'info';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'success';
    if (accuracy >= 80) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading AI Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="between">
            <Box>
              <Typography variant="h4" color="white" fontWeight={700} mb={1}>
                🤖 AI Integration Dashboard - Phase 4
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.9)" mb={2}>
                Intelligent Job Assignment • Predictive Analytics • Smart Pricing • Business Intelligence
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  icon={<Psychology />}
                  label={`${aiMetrics?._totalAIDecisions || 0} AI Decisions`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<TrendingUp />}
                  label={`${aiMetrics?._averageConfidence || 0}% Avg Confidence`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<AttachMoney />}
                  label={`$${aiMetrics?._costSavings?.toLocaleString() || 0} Saved`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <SmartToy sx={{ fontSize: 40, color: 'white' }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
            <Tab 
              icon={<Assessment />} 
              label="AI Overview" 
              sx={{ fontWeight: 600 }}
            />
            <Tab 
              icon={<Assignment />} 
              label="Job Assignment" 
              sx={{ fontWeight: 600 }}
            />
            <Tab 
              icon={<Analytics />} 
              label="Predictive Analytics" 
              sx={{ fontWeight: 600 }}
            />
            <Tab 
              icon={<MonetizationOn />} 
              label="Smart Pricing" 
              sx={{ fontWeight: 600 }}
            />
            <Tab 
              icon={<Settings />} 
              label="Model Management" 
              sx={{ fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* AI Overview Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {/* Key Performance Indicators */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                    <Speed sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    {aiMetrics?._efficiency}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI Efficiency
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    {aiMetrics?._accuracy}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prediction Accuracy
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                    <TrendingUp sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" color="warning.main" fontWeight={700}>
                    {aiMetrics?._costReduction}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cost Reduction
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                    <Star sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h4" color="info.main" fontWeight={700}>
                    {aiMetrics?._customerSatisfaction}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer Satisfaction
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* AI Recommendations */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title="AI Recommendations"
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><Lightbulb /></Avatar>}
                  action={
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={loadDashboardData}
                    >
                      Refresh
                    </Button>
                  }
                />
                <CardContent>
                  <List>
                    {recommendations.map((rec, index) => (
                      <ListItem key={index} divider={index < recommendations.length - 1}>
                        <ListItemIcon>
                          <Chip
                            label={rec._priority}
                            color={getPriorityColor(rec._priority) as any}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {rec._category}: {rec._recommendation}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box mt={1}>
                              <Typography variant="body2" color="success.main">
                                Impact: {rec._impact}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Action: {rec._action}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader
                  title="AI Impact Summary"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><Timeline /></Avatar>}
                />
                <CardContent>
                  <Box mb={3}>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      Revenue Optimization
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={aiMetrics?._revenueOptimization || 0} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {aiMetrics?._revenueOptimization}% improvement
                    </Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      Cost Savings
                    </Typography>
                    <Typography variant="h5" color="success.main" fontWeight={700}>
                      ${aiMetrics?._costSavings?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total savings this year
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      AI Decisions
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                      {aiMetrics?._totalAIDecisions?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automated decisions made
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Job Assignment Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="h6" mb={1}>Intelligent Job Assignment System</Typography>
                <Typography>
                  AI-powered technician matching based on skills, availability, location, and performance history.
                  Current model version: {modelPerformance?._intelligentJobAssignment?._modelVersion}
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary.main" fontWeight={700}>
                    {modelPerformance?._intelligentJobAssignment?._accuracy}%
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={600}>
                    Assignment Accuracy
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ML model prediction accuracy
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main" fontWeight={700}>
                    {modelPerformance?._intelligentJobAssignment?._avgAssignmentScore}
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    Avg Assignment Score
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of 100 points
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main" fontWeight={700}>
                    {modelPerformance?._intelligentJobAssignment?._customerSatisfaction}
                  </Typography>
                  <Typography variant="h6" color="warning.main" fontWeight={600}>
                    Customer Rating
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average satisfaction score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Assignment Performance Metrics"
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><Assignment /></Avatar>}
                />
                <CardContent>
                  <Typography variant="body1" mb={2}>
                    Total Assignments: <strong>{modelPerformance?._intelligentJobAssignment?._totalAssignments?.toLocaleString()}</strong>
                  </Typography>
                  <Typography variant="body1" mb={2}>
                    Last Updated: <strong>{modelPerformance?._intelligentJobAssignment?._lastUpdated?.toLocaleDateString()}</strong>
                  </Typography>
                  
                  <Box mt={3}>
                    <Typography variant="h6" mb={2}>Key Features:</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><Engineering /></ListItemIcon>
                        <ListItemText 
                          primary="Skill-Based Matching" 
                          secondary="Matches technician expertise with job requirements"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Schedule /></ListItemIcon>
                        <ListItemText 
                          primary="Availability Optimization" 
                          secondary="Considers real-time availability and workload"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Business /></ListItemIcon>
                        <ListItemText 
                          primary="Location Intelligence" 
                          secondary="Optimizes for travel time and geographic efficiency"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Star /></ListItemIcon>
                        <ListItemText 
                          primary="Performance History" 
                          secondary="Leverages past performance and customer feedback"
                        />
                      </ListItem>
                    </List>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Predictive Analytics Tab */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" mb={1}>Advanced Predictive Analytics</Typography>
                <Typography>
                  Machine learning models for repair time estimation, parts failure prediction, 
                  service demand forecasting, and quality prediction.
                </Typography>
              </Alert>
            </Grid>

            {/* Repair Time Prediction */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Repair Time Prediction"
                  avatar={<Avatar sx={{ bgcolor: 'info.main' }}><Schedule /></Avatar>}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" color="info.main" fontWeight={700}>
                      {modelPerformance?._repairTimePrediction?._accuracy}%
                    </Typography>
                    <Chip 
                      label={`MAE: ${modelPerformance?._repairTimePrediction?._meanAbsoluteError}h`}
                      color="info"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Model Version: {modelPerformance?._repairTimePrediction?._modelVersion}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Total Predictions:</strong> {modelPerformance?._repairTimePrediction?._totalPredictions?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Training:</strong> {modelPerformance?._repairTimePrediction?._lastTraining?.toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Parts Failure Prediction */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Parts Failure Prediction"
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><BugReport /></Avatar>}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" color="warning.main" fontWeight={700}>
                      {modelPerformance?._partsFailurePrediction?._accuracy}%
                    </Typography>
                    <Chip 
                      label={`${modelPerformance?._partsFailurePrediction?._preventedFailures} Prevented`}
                      color="success"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Model Version: {modelPerformance?._partsFailurePrediction?._modelVersion}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Precision:</strong> {(modelPerformance?._partsFailurePrediction?._precision * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Recall:</strong> {(modelPerformance?._partsFailurePrediction?._recall * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Quality Prediction */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Quality Prediction"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><Star /></Avatar>}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" color="success.main" fontWeight={700}>
                      {modelPerformance?._qualityPrediction?._accuracy}%
                    </Typography>
                    <Chip 
                      label={`F1: ${modelPerformance?._qualityPrediction?._f1Score}`}
                      color="success"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Model Version: {modelPerformance?._qualityPrediction?._modelVersion}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Quality Improvement:</strong> {modelPerformance?._qualityPrediction?._qualityImprovement}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Predictions:</strong> {modelPerformance?._qualityPrediction?._totalPredictions?.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Predictive Analytics Summary */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Analytics Impact"
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><TrendingUp /></Avatar>}
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="23 Failures Prevented"
                        secondary="Parts failures avoided through predictive maintenance"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Schedule color="info" /></ListItemIcon>
                      <ListItemText 
                        primary="87.3% Time Accuracy"
                        secondary="Repair time predictions within 0.8 hours average"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Star color="warning" /></ListItemIcon>
                      <ListItemText 
                        primary="12.3% Quality Boost"
                        secondary="Overall quality improvement through predictions"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Smart Pricing Tab */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="h6" mb={1}>Smart Pricing Optimization</Typography>
                <Typography>
                  Dynamic pricing engine using market intelligence, competitive analysis, 
                  and demand forecasting to optimize revenue and conversion rates.
                </Typography>
              </Alert>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main" fontWeight={700}>
                    {modelPerformance?._smartPricing?._pricingAccuracy}%
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    Pricing Accuracy
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optimal price predictions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary.main" fontWeight={700}>
                    {modelPerformance?._smartPricing?._revenueOptimization}%
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={600}>
                    Revenue Optimization
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Improvement over baseline
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main" fontWeight={700}>
                    {modelPerformance?._smartPricing?._winRate}%
                  </Typography>
                  <Typography variant="h6" color="warning.main" fontWeight={600}>
                    Quote Win Rate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conversion rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Smart Pricing Features"
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><MonetizationOn /></Avatar>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" mb={2}>Pricing Intelligence</Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon><TrendingUp /></ListItemIcon>
                          <ListItemText 
                            primary="Market Analysis" 
                            secondary="Real-time competitive pricing intelligence"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Assessment /></ListItemIcon>
                          <ListItemText 
                            primary="Demand Forecasting" 
                            secondary="Predict pricing elasticity and demand patterns"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Group /></ListItemIcon>
                          <ListItemText 
                            primary="Customer Segmentation" 
                            secondary="Tier-based pricing strategies"
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" mb={2}>Performance Metrics</Typography>
                      <Box mb={2}>
                        <Typography variant="body2">Total Pricing Decisions</Typography>
                        <Typography variant="h5" color="primary.main" fontWeight={700}>
                          {modelPerformance?._smartPricing?._totalPricingDecisions?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2">Model Version</Typography>
                        <Typography variant="h6">
                          {modelPerformance?._smartPricing?._modelVersion}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2">Revenue Impact</Typography>
                        <Typography variant="h6" color="success.main">
                          +{modelPerformance?._smartPricing?._revenueOptimization}% Revenue
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Model Management Tab */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="h6" mb={1}>AI Model Management & Configuration</Typography>
                <Typography>
                  Monitor, configure, and retrain AI models to maintain optimal performance 
                  and adapt to changing business conditions.
                </Typography>
              </Alert>
            </Grid>

            {/* Model Status Cards */}
            {modelPerformance && Object.entries(modelPerformance).map(([modelKey, model]: [string, any]) => (
              <Grid item xs={12} md={6} lg={4} key={modelKey}>
                <Card>
                  <CardHeader
                    title={modelKey.replace(/([A-Z])/g, ' $1').replace(/^_/, '').replace(/^./, str => str.toUpperCase())}
                    avatar={
                      <Avatar sx={{ 
                        bgcolor: getAccuracyColor(model._accuracy || model._pricingAccuracy) + '.main' 
                      }}>
                        <PrecisionManufacturing />
                      </Avatar>
                    }
                    action={
                      <Chip
                        label={model._modelVersion || model._version}
                        size="small"
                        color="primary"
                      />
                    }
                  />
                  <CardContent>
                    <Box mb={2}>
                      <Typography variant="body2" fontWeight={600}>
                        Accuracy: {model._accuracy || model._pricingAccuracy}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={model._accuracy || model._pricingAccuracy}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        color={getAccuracyColor(model._accuracy || model._pricingAccuracy) as any}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Predictions: {(model._totalPredictions || model._totalAssignments || model._totalPricingDecisions)?.toLocaleString()}
                    </Typography>
                    
                    {model._lastTraining && (
                      <Typography variant="body2" color="text.secondary">
                        Last Training: {model._lastTraining.toLocaleDateString()}
                      </Typography>
                    )}
                    
                    <Box mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Refresh />}
                        onClick={() => {
                          setSelectedModel(modelKey);
                          setRetrainingDialog(true);
                        }}
                      >
                        Retrain
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="AI System Health"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><CheckCircle /></Avatar>}
                />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="success.main" fontWeight={700}>
                          Operational
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          System Status
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary.main" fontWeight={700}>
                          5/5
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Models Active
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="warning.main" fontWeight={700}>
                          24/7
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monitoring
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Model Retraining Dialog */}
      <Dialog open={retrainingDialog} onClose={() => setRetrainingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Refresh sx={{ mr: 2 }} />
            Retrain AI Model
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={3}>
            Retraining the selected model will update it with the latest data to improve accuracy and performance.
          </Typography>
          
          <FormControl fullWidth mb={3}>
            <InputLabel>Selected Model</InputLabel>
            <Select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              label="Selected Model"
            >
              <MenuItem value="intelligentJobAssignment">Intelligent Job Assignment</MenuItem>
              <MenuItem value="repairTimePrediction">Repair Time Prediction</MenuItem>
              <MenuItem value="partsFailurePrediction">Parts Failure Prediction</MenuItem>
              <MenuItem value="smartPricing">Smart Pricing</MenuItem>
              <MenuItem value="qualityPrediction">Quality Prediction</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="warning" sx={{ mt: 2 }}>
            Model retraining typically takes 15-30 minutes and may temporarily affect prediction accuracy.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetrainingDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleRetrainModel}
            startIcon={<PlayArrow />}
            disabled={!selectedModel}
          >
            Start Retraining
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AIDashboard;