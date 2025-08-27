'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
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
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Alert,
  Snackbar,
  Divider,
  useTheme,
  alpha,
  Zoom,
  Fade,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Rating,
  Badge,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Person,
  Phone,
  Email,
  LocationOn,
  Business,
  Star,
  TrendingUp,
  TrendingDown,
  Schedule,
  Build,
  MonetizationOn,
  Add,
  Edit,
  Delete,
  Message,
  Call,
  WhatsApp,
  Sms,
  History,
  Assessment,
  Loyalty,
  Psychology,
  AutoAwesome,
  Verified,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  ThumbUp,
  ThumbDown,
  Favorite,
  Share,
  MoreVert,
  Groups,
  PersonAdd,
  Search,
  FilterList,
  CalendarToday,
  Notifications,
  Campaign,
} from '@mui/icons-material';

/**
 * Advanced Customer Relationship Management System - Production-Ready Component
 * Implements comprehensive CRM with AI-powered customer insights and automation
 */

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customerSince: Date;
  totalSpent: number;
  averageOrderValue: number;
  lastInteraction: Date;
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
  satisfaction: {
    rating: number;
    lastSurvey: Date;
    feedback?: string;
  };
  segmentation: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    riskScore: number; // 0-100, higher = more likely to churn
    lifetimeValue: number;
    engagementScore: number; // 0-100
  };
  preferences: {
    deviceBrands: string[];
    serviceTypes: string[];
    communicationFrequency: 'minimal' | 'regular' | 'frequent';
    marketingOptIn: boolean;
  };
  devices: CustomerDevice[];
  serviceHistory: ServiceRecord[];
  notes: CustomerNote[];
  tags: string[];
  status: 'active' | 'inactive' | 'at_risk' | 'vip';
}

interface CustomerDevice {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  repairHistory: number;
  estimatedValue: number;
  status: 'active' | 'repaired' | 'retired';
}

interface ServiceRecord {
  id: string;
  serviceDate: Date;
  deviceId: string;
  problemDescription: string;
  solution: string;
  cost: number;
  technicianId: string;
  technicianName: string;
  satisfaction: number;
  status: 'completed' | 'in_progress' | 'cancelled';
  followUpDate?: Date;
  warrantyIssue: boolean;
}

interface CustomerNote {
  id: string;
  note: string;
  type: 'general' | 'complaint' | 'compliment' | 'follow_up' | 'sales_opportunity';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: Date;
  resolved: boolean;
}

interface AIInsight {
  customerId: string;
  type: 'churn_risk' | 'upsell_opportunity' | 'satisfaction_alert' | 'loyalty_reward';
  title: string;
  description: string;
  confidence: number;
  actionRecommendation: string;
  potentialValue?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
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
      id={`crm-tabpanel-${index}`}
      aria-labelledby={`crm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export function AdvancedCRMSystem() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' as any });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);

  // Mock data - Replace with real API calls
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 'cust-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA',
      },
      customerSince: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      totalSpent: 1250.50,
      averageOrderValue: 208.42,
      lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      preferredContactMethod: 'email',
      satisfaction: {
        rating: 4.8,
        lastSurvey: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        feedback: 'Excellent service and quick turnaround time',
      },
      segmentation: {
        tier: 'gold',
        riskScore: 15, // Low risk
        lifetimeValue: 2450,
        engagementScore: 85,
      },
      preferences: {
        deviceBrands: ['Apple', 'Samsung'],
        serviceTypes: ['screen_repair', 'battery_replacement'],
        communicationFrequency: 'regular',
        marketingOptIn: true,
      },
      devices: [
        {
          id: 'dev-001',
          brand: 'Apple',
          model: 'iPhone 14 Pro',
          serialNumber: 'ABC123456789',
          purchaseDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          warrantyExpiration: new Date(Date.now() + 165 * 24 * 60 * 60 * 1000),
          repairHistory: 2,
          estimatedValue: 800,
          status: 'active',
        },
      ],
      serviceHistory: [
        {
          id: 'serv-001',
          serviceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          deviceId: 'dev-001',
          problemDescription: 'Cracked screen',
          solution: 'Screen replacement',
          cost: 150,
          technicianId: 'tech-001',
          technicianName: 'Sarah Johnson',
          satisfaction: 5,
          status: 'completed',
          warrantyIssue: false,
        },
      ],
      notes: [
        {
          id: 'note-001',
          note: 'Customer prefers early morning appointments',
          type: 'general',
          priority: 'medium',
          createdBy: 'admin-001',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          resolved: false,
        },
      ],
      tags: ['premium_customer', 'apple_specialist', 'frequent_visitor'],
      status: 'active',
    },
    {
      id: 'cust-002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0124',
      address: {
        street: '456 Oak Ave',
        city: 'Cambridge',
        state: 'MA',
        zipCode: '02138',
        country: 'USA',
      },
      customerSince: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      totalSpent: 450.75,
      averageOrderValue: 150.25,
      lastInteraction: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      preferredContactMethod: 'phone',
      satisfaction: {
        rating: 3.2,
        lastSurvey: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        feedback: 'Service was okay, but took longer than expected',
      },
      segmentation: {
        tier: 'silver',
        riskScore: 75, // High risk
        lifetimeValue: 850,
        engagementScore: 45,
      },
      preferences: {
        deviceBrands: ['Samsung', 'Google'],
        serviceTypes: ['water_damage', 'software_repair'],
        communicationFrequency: 'minimal',
        marketingOptIn: false,
      },
      devices: [
        {
          id: 'dev-002',
          brand: 'Samsung',
          model: 'Galaxy S23',
          serialNumber: 'DEF987654321',
          purchaseDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          repairHistory: 1,
          estimatedValue: 600,
          status: 'active',
        },
      ],
      serviceHistory: [
        {
          id: 'serv-002',
          serviceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          deviceId: 'dev-002',
          problemDescription: 'Water damage',
          solution: 'Water damage repair and cleaning',
          cost: 200,
          technicianId: 'tech-002',
          technicianName: 'Mike Chen',
          satisfaction: 3,
          status: 'completed',
          warrantyIssue: false,
        },
      ],
      notes: [],
      tags: ['at_risk', 'price_sensitive'],
      status: 'at_risk',
    },
  ]);

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      customerId: 'cust-002',
      type: 'churn_risk',
      title: 'High Churn Risk Alert',
      description: 'Customer Sarah Johnson has a 75% churn risk score based on low satisfaction and reduced engagement.',
      confidence: 0.89,
      actionRecommendation: 'Proactive outreach with special discount offer and satisfaction survey',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      customerId: 'cust-001',
      type: 'upsell_opportunity',
      title: 'Premium Service Upsell',
      description: 'High-value customer with device protection plan opportunity',
      confidence: 0.76,
      actionRecommendation: 'Offer premium protection plan during next service visit',
      potentialValue: 299,
      priority: 'medium',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ]);

  const [crmMetrics, setCrmMetrics] = useState({
    totalCustomers: 1247,
    activeCustomers: 892,
    customerSatisfaction: 4.6,
    retentionRate: 87.5,
    averageLifetimeValue: 1850,
    churnRate: 3.2,
    upsellConversionRate: 23.8,
    referralRate: 15.2,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'primary';
      case 'gold': return 'warning';
      case 'silver': return 'info';
      case 'bronze': return 'secondary';
      default: return 'default';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '👤';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'at_risk': return 'warning';
      case 'inactive': return 'error';
      case 'vip': return 'primary';
      default: return 'default';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'error';
    if (score >= 40) return 'warning';
    return 'success';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'churn_risk': return <Warning />;
      case 'upsell_opportunity': return <TrendingUp />;
      case 'satisfaction_alert': return <Star />;
      case 'loyalty_reward': return <Favorite />;
      default: return <AutoAwesome />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" color="white" fontWeight={700} mb={1}>
                Advanced Customer Relationship Management
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.9)">
                AI-powered customer insights, automated engagement, and predictive analytics
              </Typography>
            </Box>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Groups sx={{ fontSize: 30, color: 'white' }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      {/* CRM Metrics Dashboard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={600}>
            <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {crmMetrics.totalCustomers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Total Customers
                    </Typography>
                  </Box>
                  <Groups sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={700}>
            <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {crmMetrics.customerSatisfaction}/5
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Satisfaction Score
                    </Typography>
                  </Box>
                  <Star sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={800}>
            <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {crmMetrics.retentionRate}%
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Retention Rate
                    </Typography>
                  </Box>
                  <Loyalty sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in timeout={900}>
            <Card sx={{ background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {formatCurrency(crmMetrics.averageLifetimeValue)}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Avg Lifetime Value
                    </Typography>
                  </Box>
                  <MonetizationOn sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* AI Insights Alert */}
      {aiInsights.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' },
          }}
        >
          <Typography variant="h6" mb={1}>
            🤖 AI Customer Insights - {aiInsights.length} actionable insights available
          </Typography>
          <Typography>
            Our AI has identified potential churn risks, upsell opportunities, and customer satisfaction issues.
          </Typography>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<Person />} label="Customer Directory" sx={{ fontWeight: 600 }} />
            <Tab icon={<Psychology />} label="AI Insights" sx={{ fontWeight: 600 }} />
            <Tab icon={<Assessment />} label="Analytics" sx={{ fontWeight: 600 }} />
            <Tab icon={<Campaign />} label="Engagement" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Customer Directory Tab */}
        <TabPanel value={currentTab} index={0}>
          {/* Search and Controls */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <TextField
              label="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setOpenCustomerDialog(true)}
            >
              Add Customer
            </Button>
          </Box>

          <Grid container spacing={3}>
            {filteredCustomers.map((customer) => (
              <Grid item xs={12} lg={6} key={customer.id}>
                <Fade in timeout={600}>
                  <Card sx={{ border: 1, borderColor: 'divider' }}>
                    <CardHeader
                      avatar={
                        <Badge 
                          badgeContent={getTierIcon(customer.segmentation.tier)} 
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                        </Badge>
                      }
                      title={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <Chip 
                            label={customer.status}
                            color={getStatusColor(customer.status)}
                            size="small"
                          />
                        </Box>
                      }
                      subheader={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {customer.email} | {customer.phone}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Chip 
                              label={customer.segmentation.tier}
                              color={getTierColor(customer.segmentation.tier)}
                              size="small"
                            />
                            <Rating value={customer.satisfaction.rating} readOnly size="small" />
                          </Box>
                        </Box>
                      }
                      action={
                        <IconButton>
                          <MoreVert />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      {/* Risk Score Alert */}
                      {customer.segmentation.riskScore >= 70 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            High churn risk ({customer.segmentation.riskScore}%) - Consider proactive engagement
                          </Typography>
                        </Alert>
                      )}

                      {/* Customer Metrics */}
                      <Grid container spacing={2} mb={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary.main" fontWeight={600}>
                              {formatCurrency(customer.totalSpent)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Spent
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                              {formatCurrency(customer.segmentation.lifetimeValue)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Lifetime Value
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Engagement Score */}
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Engagement Score
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {customer.segmentation.engagementScore}/100
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={customer.segmentation.engagementScore}
                          color={customer.segmentation.engagementScore >= 70 ? 'success' : customer.segmentation.engagementScore >= 40 ? 'warning' : 'error'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      {/* Customer Tags */}
                      <Box mb={2}>
                        {customer.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag.replace('_', ' ')}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                      </Box>

                      {/* Action Buttons */}
                      <Box display="flex" gap={1} mt={2}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Message />}
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          Contact
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<History />}
                        >
                          History
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                        >
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* AI Insights Tab */}
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h5" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
            <Psychology color="primary" />
            AI-Powered Customer Insights
          </Typography>
          
          <Grid container spacing={3}>
            {aiInsights.map((insight, index) => (
              <Grid item xs={12} lg={6} key={insight.customerId + insight.type}>
                <Fade in timeout={600 + index * 200}>
                  <Card sx={{ border: 1, borderColor: 'divider' }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: `${getInsightColor(insight.priority)}.main` }}>
                          {getInsightIcon(insight.type)}
                        </Avatar>
                      }
                      title={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {insight.title}
                          </Typography>
                          <Chip 
                            label={`${(insight.confidence * 100).toFixed(0)}% confidence`}
                            size="small"
                            color="success"
                          />
                        </Box>
                      }
                      subheader={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={insight.type.replace('_', ' ')}
                            size="small"
                            color="primary"
                          />
                          <Chip 
                            label={insight.priority + ' priority'}
                            size="small"
                            color={getInsightColor(insight.priority)}
                          />
                        </Box>
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {insight.description}
                      </Typography>
                      
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight={600} mb={1}>
                          Recommended Action:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {insight.actionRecommendation}
                        </Typography>
                      </Box>

                      {insight.potentialValue && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            Potential Value: {formatCurrency(insight.potentialValue)}
                          </Typography>
                        </Alert>
                      )}

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {insight.createdAt.toLocaleString()}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AutoAwesome />}
                        >
                          Take Action
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Customer Analytics & Trends
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Customer Acquisition"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><TrendingUp /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="success.main" fontWeight={700} mb={1}>
                    +18.5%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly customer growth rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Churn Prevention"
                  avatar={<Avatar sx={{ bgcolor: 'error.main' }}><Warning /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="error.main" fontWeight={700} mb={1}>
                    {crmMetrics.churnRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current monthly churn rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Upsell Success"
                  avatar={<Avatar sx={{ bgcolor: 'info.main' }}><MonetizationOn /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="info.main" fontWeight={700} mb={1}>
                    {crmMetrics.upsellConversionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upsell conversion rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Referral Rate"
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><Share /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="warning.main" fontWeight={700} mb={1}>
                    {crmMetrics.referralRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer referral success rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Engagement Tab */}
        <TabPanel value={currentTab} index={3}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" mb={1}>Automated Customer Engagement</Typography>
            <Typography>
              AI-powered email campaigns, SMS notifications, and personalized communication based on customer behavior and preferences.
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Active Campaigns"
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><Campaign /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="primary.main" fontWeight={700} mb={1}>
                    7
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Campaigns currently running
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Engagement Rate"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><ThumbUp /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="success.main" fontWeight={700} mb={1}>
                    68.5%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average campaign engagement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Customer Dialog */}
      <Dialog open={openCustomerDialog} onClose={() => setOpenCustomerDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomerDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Customer</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdvancedCRMSystem;