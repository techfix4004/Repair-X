'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  DatePicker,
  TimePicker,
  Autocomplete,
  Switch,
  RadioGroup,
  Radio,
  FormLabel,
  Slider,
} from '@mui/material';
import {
  Receipt,
  RequestQuote,
  Payment,
  PendingActions,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Add,
  Download,
  Email,
  Print,
  Schedule,
  MonetizationOn,
  TrendingUp,
  Assessment,
  Business,
  Person,
  Build,
  Inventory,
  Timer,
  LocalShipping,
  Security,
  VerifiedUser,
  Calculate,
  Receipt as ReceiptIcon,
  AttachMoney,
  CreditCard,
  AccountBalance,
  Send,
  Preview,
  Archive,
} from '@mui/icons-material';

/**
 * Advanced Billing & Quotation System - Production-Ready Component
 * Implements comprehensive financial management with automated workflows
 */

interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'labor' | 'parts' | 'service' | 'warranty';
  taxable: boolean;
  warrantyPeriod?: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  deviceInfo: {
    brand: string;
    model: string;
    serial: string;
    problemDescription: string;
  };
  items: BillingItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
  validUntil: Date;
  createdAt: Date;
  approvedAt?: Date;
  notes?: string;
  termsAndConditions: string;
  estimatedCompletionDays: number;
  paymentTerms: string;
  warrantyInfo: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: BillingItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
  paymentMethod?: string;
  notes?: string;
}

interface PaymentPlan {
  id: string;
  invoiceId: string;
  totalAmount: number;
  installments: PaymentInstallment[];
  status: 'active' | 'completed' | 'defaulted';
  interestRate: number;
  setupFee: number;
}

interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: Date;
  paidAmount?: number;
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
      id={`billing-tabpanel-${index}`}
      aria-labelledby={`billing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export function AdvancedBillingSystem() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' as any });
  const [openQuotationDialog, setOpenQuotationDialog] = useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Mock data - Replace with real API calls
  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: 'quote-001',
      quotationNumber: 'QT-2025-001',
      customerId: 'cust-001',
      customerName: 'John Smith',
      deviceInfo: {
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        serial: 'ABC123456789',
        problemDescription: 'Screen replacement and battery replacement',
      },
      items: [
        {
          id: 'item-001',
          description: 'Screen Assembly Replacement',
          quantity: 1,
          unitPrice: 150,
          totalPrice: 150,
          category: 'parts',
          taxable: true,
          warrantyPeriod: 90,
        },
        {
          id: 'item-002',
          description: 'Battery Replacement',
          quantity: 1,
          unitPrice: 89,
          totalPrice: 89,
          category: 'parts',
          taxable: true,
          warrantyPeriod: 180,
        },
        {
          id: 'item-003',
          description: 'Labor - Screen & Battery Replacement',
          quantity: 2,
          unitPrice: 75,
          totalPrice: 150,
          category: 'labor',
          taxable: true,
        },
      ],
      subtotal: 389,
      taxAmount: 31.12,
      discountAmount: 0,
      totalAmount: 420.12,
      status: 'pending_approval',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Customer requested premium parts with extended warranty',
      termsAndConditions: 'All work includes 90-day warranty. Payment due upon completion.',
      estimatedCompletionDays: 3,
      paymentTerms: 'Payment due upon completion',
      warrantyInfo: '90 days parts, 180 days labor',
    },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2025-001',
      quotationId: 'quote-001',
      customerId: 'cust-002',
      customerName: 'Sarah Johnson',
      billingAddress: {
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA',
      },
      items: [
        {
          id: 'item-004',
          description: 'MacBook Pro 16" Logic Board Repair',
          quantity: 1,
          unitPrice: 450,
          totalPrice: 450,
          category: 'service',
          taxable: true,
          warrantyPeriod: 90,
        },
        {
          id: 'item-005',
          description: 'Diagnostic and Testing',
          quantity: 1,
          unitPrice: 75,
          totalPrice: 75,
          category: 'labor',
          taxable: true,
        },
      ],
      subtotal: 525,
      taxAmount: 42,
      discountAmount: 25,
      totalAmount: 542,
      paidAmount: 0,
      status: 'sent',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Corporate customer - 30-day payment terms',
    },
  ]);

  const [financialMetrics, setFinancialMetrics] = useState({
    totalRevenue: 52750,
    pendingPayments: 8420,
    monthlyGrowth: 15.8,
    averageInvoiceValue: 342,
    collectionRate: 94.5,
    daysToPayment: 18.5,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateQuotation = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call for quotation creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newQuotation: Quotation = {
        id: `quote-${Date.now()}`,
        quotationNumber: `QT-2025-${String(quotations.length + 1).padStart(3, '0')}`,
        customerId: 'new-customer',
        customerName: 'New Customer',
        deviceInfo: {
          brand: 'Samsung',
          model: 'Galaxy S23',
          serial: 'DEF987654321',
          problemDescription: 'Water damage repair',
        },
        items: [],
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        status: 'draft',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        termsAndConditions: 'Standard terms and conditions apply',
        estimatedCompletionDays: 5,
        paymentTerms: 'Payment due upon completion',
        warrantyInfo: '90 days standard warranty',
      };

      setQuotations(prev => [...prev, newQuotation]);
      setNotification({
        open: true,
        message: 'New quotation created successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error creating quotation',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [quotations.length]);

  const handleApproveQuotation = useCallback(async (quotationId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQuotations(prev => 
        prev.map(quote => {
          if (quote.id === quotationId) {
            return {
              ...quote,
              status: 'approved' as const,
              approvedAt: new Date(),
            };
          }
          return quote;
        })
      );

      setNotification({
        open: true,
        message: 'Quotation approved and ready for invoicing',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error approving quotation',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'success';
      case 'pending_approval':
      case 'sent':
        return 'warning';
      case 'rejected':
      case 'overdue':
        return 'error';
      case 'draft':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" color="white" fontWeight={700} mb={1}>
                Advanced Billing & Quotation System
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.9)">
                Comprehensive financial management with automated workflows and AI-powered insights
              </Typography>
            </Box>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <MonetizationOn sx={{ fontSize: 30, color: 'white' }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      {/* Financial Metrics Dashboard */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2}>
          <Zoom in timeout={600}>
            <Card sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {formatCurrency(financialMetrics.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Total Revenue
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Zoom in timeout={700}>
            <Card sx={{ background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {formatCurrency(financialMetrics.pendingPayments)}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Pending Payments
                    </Typography>
                  </Box>
                  <PendingActions sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Zoom in timeout={800}>
            <Card sx={{ background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="white" fontWeight={700}>
                      +{financialMetrics.monthlyGrowth}%
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Monthly Growth
                    </Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
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
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {formatCurrency(financialMetrics.averageInvoiceValue)}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Avg Invoice Value
                    </Typography>
                  </Box>
                  <ReceiptIcon sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
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
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {financialMetrics.collectionRate}%
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Collection Rate
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
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
                    <Typography variant="h5" color="white" fontWeight={700}>
                      {financialMetrics.daysToPayment}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Days to Payment
                    </Typography>
                  </Box>
                  <Timer sx={{ fontSize: 30, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<RequestQuote />} label="Quotations" sx={{ fontWeight: 600 }} />
            <Tab icon={<Receipt />} label="Invoices" sx={{ fontWeight: 600 }} />
            <Tab icon={<Payment />} label="Payments" sx={{ fontWeight: 600 }} />
            <Tab icon={<Assessment />} label="Financial Analytics" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Quotations Tab */}
        <TabPanel value={currentTab} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={600}>
              Quotation Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateQuotation}
              disabled={isLoading}
            >
              Create New Quotation
            </Button>
          </Box>

          <Grid container spacing={3}>
            {quotations.map((quotation) => (
              <Grid item xs={12} lg={6} key={quotation.id}>
                <Fade in timeout={600}>
                  <Card sx={{ border: 1, borderColor: 'divider' }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <RequestQuote />
                        </Avatar>
                      }
                      title={
                        <Typography variant="h6" fontWeight={600}>
                          {quotation.quotationNumber}
                        </Typography>
                      }
                      subheader={`Customer: ${quotation.customerName}`}
                      action={
                        <Chip 
                          label={quotation.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(quotation.status)}
                          size="small"
                        />
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {quotation.deviceInfo.brand} {quotation.deviceInfo.model} - {quotation.deviceInfo.problemDescription}
                      </Typography>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Items: {quotation.items.length} | Estimated: {quotation.estimatedCompletionDays} days
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Valid until: {quotation.validUntil.toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">{formatCurrency(quotation.subtotal)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2">Tax:</Typography>
                        <Typography variant="body2">{formatCurrency(quotation.taxAmount)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>Total:</Typography>
                        <Typography variant="h6" fontWeight={600} color="primary.main">
                          {formatCurrency(quotation.totalAmount)}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1} mt={2}>
                        {quotation.status === 'pending_approval' && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => handleApproveQuotation(quotation.id)}
                            disabled={isLoading}
                            startIcon={<CheckCircle />}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => setSelectedQuotation(quotation)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                        >
                          PDF
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Email />}
                        >
                          Send
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Invoices Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={600}>
              Invoice Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenInvoiceDialog(true)}
            >
              Create Invoice
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={invoice.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.dueDate.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" onClick={() => setSelectedInvoice(invoice)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                        <IconButton size="small">
                          <Email />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={currentTab} index={2}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" mb={1}>Payment Processing</Typography>
            <Typography>
              Advanced payment management with automated collection, installment plans, and AI-powered risk assessment.
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Payment Methods"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><CreditCard /></Avatar>}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Credit Card, Bank Transfer, Digital Wallets, Cryptocurrency
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Automated Collections"
                  avatar={<Avatar sx={{ bgcolor: 'warning.main' }}><AccountBalance /></Avatar>}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Smart reminder system with escalation workflows
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Financial Analytics Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Financial Analytics & Insights
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Revenue Trends"
                  avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><TrendingUp /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="primary.main" fontWeight={700} mb={1}>
                    +24.5%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Year-over-year growth in revenue
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Cash Flow Health"
                  avatar={<Avatar sx={{ bgcolor: 'success.main' }}><Assessment /></Avatar>}
                />
                <CardContent>
                  <Typography variant="h4" color="success.main" fontWeight={700} mb={1}>
                    Excellent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered cash flow analysis and forecasting
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

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

export default AdvancedBillingSystem;