'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

/**
 * Modern Material-UI Homepage - Enterprise SaaS Platform Entry
 */
export default function Home() {
  const router = useRouter();

  const roleCards = [
    {
      emoji: '👤',
      title: 'Customer Portal',
      description: 'Book repairs, track jobs, manage payments, communicate with technicians in real-time.',
      href: '/customer/dashboard',
      icon: <DashboardIcon />,
      color: 'primary' as const,
      features: ['Real-time tracking', 'Digital payments', 'Live chat support'],
    },
    {
      emoji: '🔧',
      title: 'Technician Mobile',
      description: 'Manage assigned jobs, fill job sheets, update inventory, and document work with photos.',
      href: '/technician/dashboard',
      icon: <BuildIcon />,
      color: 'secondary' as const,
      features: ['Mobile-first design', 'Offline capability', 'Photo documentation'],
    },
    {
      emoji: '🏢',
      title: 'Business Management',
      description: 'Admin dashboard for operations, analytics, employees, financial management.',
      href: '/admin/dashboard',
      icon: <BusinessIcon />,
      color: 'success' as const,
      features: ['Advanced analytics', 'Team management', 'Financial reporting'],
    },
    {
      emoji: '🏗️',
      title: 'SaaS Admin',
      description: 'Multi-tenant management, billing, analytics, and white-label configuration.',
      href: '/saas-admin/dashboard',
      icon: <AdminIcon />,
      color: 'warning' as const,
      features: ['Multi-tenant', 'White-label', 'Enterprise billing'],
    },
  ];

  const systemStatus = [
    { label: 'Backend API', value: 'Operational', healthy: true, icon: <CloudIcon /> },
    { label: 'Database', value: 'PostgreSQL Ready', healthy: true, icon: <SpeedIcon /> },
    { label: 'Cache', value: 'Redis Active', healthy: true, icon: <TrendingIcon /> },
    { label: 'Security', value: 'Encrypted & Secure', healthy: true, icon: <SecurityIcon /> },
  ];

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ pt: 8, pb: 6 }}>
        <Fade in timeout={800}>
          <Box textAlign="center" mb={8}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mr: 2 }}>
                🔧
              </Avatar>
              <Typography variant="h1" component="h1" color="primary.main">
                RepairX
              </Typography>
            </Box>
            <Typography variant="h4" color="text.secondary" mb={2} fontWeight={300}>
              Enterprise Repair Management Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
              Production-grade SaaS platform with AI-powered diagnostics, real-time analytics, 
              and comprehensive multi-role management system.
            </Typography>
            <Box mt={4} display="flex" justifyContent="center" gap={2}>
              <Chip 
                icon={<AIIcon />} 
                label="AI-Powered" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                icon={<SecurityIcon />} 
                label="Enterprise Security" 
                color="secondary" 
                variant="outlined" 
              />
              <Chip 
                icon={<TrendingIcon />} 
                label="Real-time Analytics" 
                color="success" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Fade>

        {/* Role-based Entry Points */}
        <Typography variant="h3" component="h2" textAlign="center" mb={6} color="text.primary">
          Choose Your Role
        </Typography>
        
        <Grid container spacing={4} mb={8}>
          {roleCards.map((role, index) => (
            <Grid item xs={12} md={6} lg={3} key={role.title}>
              <Zoom in timeout={600 + index * 200}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: (theme) => theme.shadows[8],
                    }
                  }}
                  onClick={() => handleNavigate(role.href)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${role.color}.main`, 
                          mr: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {role.icon}
                      </Avatar>
                      <Typography variant="h5" component="h3" fontWeight={600}>
                        {role.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      {role.description}
                    </Typography>
                    
                    <Box>
                      {role.features.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                          color={role.color}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      color={role.color}
                      fullWidth
                      size="large"
                      endIcon={role.icon}
                    >
                      Access {role.title}
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* System Status Dashboard */}
        <Paper elevation={2} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h4" component="h2" textAlign="center" mb={4} color="primary.main">
            🚀 Production System Status
          </Typography>
          
          <Grid container spacing={3}>
            {systemStatus.map((status, index) => (
              <Grid item xs={12} sm={6} md={3} key={status.label}>
                <Zoom in timeout={800 + index * 150}>
                  <Card 
                    sx={{ 
                      textAlign: 'center',
                      bgcolor: status.healthy ? 'success.50' : 'error.50',
                      border: 1,
                      borderColor: status.healthy ? 'success.200' : 'error.200',
                    }}
                  >
                    <CardContent>
                      <Box 
                        sx={{ 
                          color: status.healthy ? 'success.main' : 'error.main',
                          mb: 2 
                        }}
                      >
                        {status.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        {status.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {status.value}
                      </Typography>
                      <Chip 
                        icon={<CheckIcon />}
                        label={status.healthy ? "Operational" : "Issues"}
                        color={status.healthy ? "success" : "error"}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Footer */}
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            RepairX Enterprise Platform v2.0.0 | Production Deployment Complete
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => router.push('/api/health')}
            >
              API Health Check
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              href="http://localhost:3001/health"
              target="_blank"
              rel="noopener noreferrer"
            >
              Backend Health
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => router.push('/system/monitoring')}
            >
              System Monitoring
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
