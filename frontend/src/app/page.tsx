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
  CheckCircle as CheckIcon,
  TrendingUp as TrendingIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

/**
 * Modern Material-UI Homepage - Organization-bound Access Only
 * SaaS Admin access removed from public interface
 */
export default function Home() {
  const router = useRouter();

  const roleCards = [
    {
      emoji: '👤',
      title: 'Customer Portal',
      description: 'Access your active repairs, track progress, and communicate with your service provider.',
      href: '/auth/customer/login',
      icon: <DashboardIcon />,
      color: 'primary' as const,
      features: ['Real-time tracking', 'Service history', 'Direct communication'],
      note: 'For customers with active services only',
    },
    {
      emoji: '🔧',
      title: 'Technician Access',
      description: 'Manage assigned jobs, complete service reports, and update repair progress.',
      href: '/auth/organization/login',
      icon: <BuildIcon />,
      color: 'secondary' as const,
      features: ['Job management', 'Mobile interface', 'Progress tracking'],
      note: 'By organization invitation only',
    },
    {
      emoji: '🏢',
      title: 'Business Management',
      description: 'Organization dashboard for operations, team management, and business analytics.',
      href: '/auth/organization/login',
      icon: <BusinessIcon />,
      color: 'success' as const,
      features: ['Team management', 'Analytics', 'Customer relations'],
      note: 'For organization owners and managers',
    },
  ];

  const systemStatus = [
    { label: 'Backend API', value: 'Operational', healthy: true, icon: <CloudIcon /> },
    { label: 'Database', value: 'PostgreSQL Ready', healthy: true, icon: <SpeedIcon /> },
    { label: 'Security', value: 'Organization-bound', healthy: true, icon: <SecurityIcon /> },
    { label: 'Access Control', value: 'Role-based Active', healthy: true, icon: <TrendingIcon /> },
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
              Professional Repair Services Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
              Secure organization-bound repair management with role-based access control.
              Access restricted to authorized organization members and customers with active services.
            </Typography>
            <Box mt={4} display="flex" justifyContent="center" gap={2}>
              <Chip 
                icon={<SecurityIcon />} 
                label="Organization-bound Security" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                icon={<AIIcon />} 
                label="Role-based Access" 
                color="secondary" 
                variant="outlined" 
              />
              <Chip 
                icon={<TrendingIcon />} 
                label="Tenant Isolation" 
                color="success" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Fade>

        {/* Access Notice */}
        <Paper elevation={1} sx={{ p: 3, mb: 6, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
          <Typography variant="h6" color="info.main" mb={2} textAlign="center">
            🔐 Secure Access Notice
          </Typography>
          <Typography variant="body2" color="info.dark" textAlign="center" mb={2}>
            This platform uses organization-bound authentication for enhanced security:
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                <strong>Technicians:</strong> Access by organization invitation only
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                <strong>Customers:</strong> Access provided after service submission
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                <strong>Organizations:</strong> Contact support for setup
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Role-based Entry Points */}
        <Typography variant="h3" component="h2" textAlign="center" mb={6} color="text.primary">
          Access Your Role
        </Typography>
        
        <Grid container spacing={4} mb={8}>
          {roleCards.map((role, index) => (
            <Grid item xs={12} md={4} key={role.title}>
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
                    
                    <Box mb={2}>
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

                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                      {role.note}
                    </Typography>
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
            🚀 Secure Platform Status
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
            RepairX Enterprise Platform v2.0.0 | Organization-bound Security Model
          </Typography>
          <Typography variant="caption" color="text.secondary" mb={3} display="block">
            Platform administration access available via dedicated backend interface
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
