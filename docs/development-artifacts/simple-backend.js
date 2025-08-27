const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'RepairX Backend is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'RepairX API',
    endpoints: ['auth', 'jobs', 'customers', 'technicians'],
    timestamp: new Date().toISOString()
  });
});

// Mock authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    success: true,
    token: 'mock_jwt_token',
    user: {
      id: 1,
      email,
      name: 'Demo User',
      role: 'customer'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name } = req.body;
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: Math.floor(Math.random() * 1000),
      email,
      name,
      role: 'customer'
    }
  });
});

// Mock jobs endpoints
app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'JOB-001',
        device: 'iPhone 14 Pro',
        issue: 'Screen replacement',
        status: 'In Progress',
        customer: 'John Doe',
        technician: 'Alice Smith',
        created: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'JOB-002',
        device: 'Samsung Galaxy S23',
        issue: 'Battery replacement',
        status: 'Scheduled',
        customer: 'Jane Smith',
        technician: 'Bob Johnson',
        created: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });
});

// Mock customers endpoint
app.get('/api/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        totalJobs: 5,
        activeJobs: 1
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1-555-0124',
        totalJobs: 3,
        activeJobs: 1
      }
    ]
  });
});

// Mock technicians endpoint
app.get('/api/technicians', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Alice Smith',
        email: 'alice@repairx.com',
        specialties: ['iPhone', 'Samsung', 'Screen Repairs'],
        activeJobs: 3,
        rating: 4.8,
        status: 'available'
      },
      {
        id: 2,
        name: 'Bob Johnson',
        email: 'bob@repairx.com',
        specialties: ['MacBook', 'Battery Repairs', 'Water Damage'],
        activeJobs: 2,
        rating: 4.9,
        status: 'busy'
      }
    ]
  });
});

// Analytics endpoint
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 124580,
      activeJobs: 94,
      completedJobs: 1247,
      activeTechnicians: 28,
      customerSatisfaction: 96,
      revenueGrowth: 12.5,
      monthlyRevenue: [
        { month: 'Jan', revenue: 12000, jobs: 45 },
        { month: 'Feb', revenue: 19000, jobs: 52 },
        { month: 'Mar', revenue: 15000, jobs: 48 },
        { month: 'Apr', revenue: 22000, jobs: 61 },
        { month: 'May', revenue: 18000, jobs: 55 },
        { month: 'Jun', revenue: 25000, jobs: 68 }
      ]
    }
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RepairX Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});