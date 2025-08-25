/**
 * Minimal RepairX Backend for Staging Testing
 * This provides basic API endpoints for comprehensive testing
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data stores for testing
const users = [
  {
    id: '1',
    email: 'admin@repairx.com',
    password: bcrypt.hashSync('admin123', 10),
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2', 
    email: 'tech@repairx.com',
    password: bcrypt.hashSync('tech123', 10),
    name: 'Tech User',
    role: 'technician'
  },
  {
    id: '3',
    email: 'customer@repairx.com', 
    password: bcrypt.hashSync('customer123', 10),
    name: 'Customer User',
    role: 'customer'
  }
];

const jobs = [];
const businessSettings = {};
const devices = [];

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'staging_jwt_secret_for_testing_only';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'RepairX Backend Staging',
    version: '1.0.0-staging'
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'customer' } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id: String(users.length + 1),
      email,
      password: hashedPassword,
      name,
      role
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Business settings routes
app.get('/api/business/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      taxSettings: { gst: 18, vat: 20, hst: 13 },
      printSettings: { invoiceTemplate: 'modern', receiptFormat: 'thermal' },
      workflowSettings: { autoAssign: true, emailNotifications: true },
      emailSettings: { smtp: 'configured', templates: 15 },
      smsSettings: { gateway: 'twilio', credits: 1000 },
      employeeManagement: { totalEmployees: 25, activeToday: 18 },
      customerDatabase: { totalCustomers: 5420, newThisMonth: 89 },
      invoiceSettings: { nextNumber: 'INV-2025-001', autoGenerate: true },
      quotationSettings: { validityDays: 30, autoConvert: true },
      paymentSettings: { gateways: ['stripe', 'paypal', 'square'] },
      addressSettings: { serviceRadius: '50km', zones: 5 },
      reminderSystem: { activeReminders: 45, overdueFollowups: 8 },
      businessInfo: { name: 'RepairX Staging', phone: '+1-555-STAGING' },
      sequenceSettings: { jobPrefix: 'JOB', invoicePrefix: 'INV' },
      expenseManagement: { categories: 12, monthlyBudget: 50000 },
      inventorySettings: { totalParts: 1240, lowStock: 15 },
      outsourcingSettings: { providers: 8, activeContracts: 5 },
      qualitySettings: { sixSigmaEnabled: true, defectRate: '2.1 DPMO' },
      securitySettings: { mfa: true, audit: true },
      integrationSettings: { apis: 12, webhooks: 6 }
    }
  });
});

app.put('/api/business/settings/:category', (req, res) => {
  const { category } = req.params;
  const settings = req.body;
  
  businessSettings[category] = settings;
  
  res.json({
    success: true,
    message: `${category} settings updated successfully`,
    settings: businessSettings[category]
  });
});

// Job management routes  
app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    jobs: [
      {
        id: 'JOB-2025-001',
        customerName: 'John Doe',
        device: 'iPhone 14 Pro',
        issue: 'Screen replacement',
        status: 'IN_DIAGNOSIS',
        createdAt: '2025-01-10T10:00:00Z',
        estimatedCompletion: '2025-01-12T16:00:00Z'
      },
      {
        id: 'JOB-2025-002', 
        customerName: 'Jane Smith',
        device: 'MacBook Air',
        issue: 'Battery replacement',
        status: 'PARTS_ORDERED',
        createdAt: '2025-01-09T14:30:00Z',
        estimatedCompletion: '2025-01-15T12:00:00Z'
      }
    ]
  });
});

app.post('/api/jobs', (req, res) => {
  const newJob = {
    id: `JOB-2025-${String(jobs.length + 3).padStart(3, '0')}`,
    ...req.body,
    status: 'CREATED',
    createdAt: new Date().toISOString()
  };
  
  jobs.push(newJob);
  
  res.status(201).json({
    success: true,
    job: newJob
  });
});

// Device management
app.get('/api/devices', (req, res) => {
  res.json({
    success: true,
    devices: [
      { id: 1, name: 'iPhone 14 Pro', category: 'smartphone', qrCode: 'QR123456' },
      { id: 2, name: 'MacBook Air M2', category: 'laptop', qrCode: 'QR789012' }
    ]
  });
});

// Payment routes
app.post('/api/payments/process', (req, res) => {
  const { amount, method, jobId } = req.body;
  
  res.json({
    success: true,
    payment: {
      id: `PAY-${Date.now()}`,
      amount,
      method,
      jobId,
      status: 'completed',
      timestamp: new Date().toISOString()
    }
  });
});

// Dashboard analytics
app.get('/api/dashboard/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalJobs: 1247,
      activeJobs: 89,
      completedToday: 23,
      revenue: {
        today: 4850.50,
        month: 89250.75,
        year: 850000.00
      },
      technicians: {
        online: 12,
        busy: 8,
        available: 4
      },
      customerSatisfaction: 4.8,
      avgRepairTime: '2.3 days'
    }
  });
});

// Business Intelligence
app.get('/api/business-intelligence/recommendations', (req, res) => {
  res.json({
    success: true,
    recommendations: [
      {
        type: 'technician_assignment',
        jobId: 'JOB-2025-001',
        recommendedTechnician: 'tech-001',
        confidence: 0.92,
        reasoning: 'Best skill match and closest location'
      }
    ]
  });
});

// SMS Management
app.get('/api/sms/status', (req, res) => {
  res.json({
    success: true,
    sms: {
      credits: 850,
      sent: 1240,
      delivered: 1198,
      failed: 42,
      gateway: 'twilio'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RepairX Staging Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Test login: admin@repairx.com / admin123`);
  console.log(`👨‍🔧 Test technician: tech@repairx.com / tech123`);  
  console.log(`👤 Test customer: customer@repairx.com / customer123`);
});

module.exports = app;