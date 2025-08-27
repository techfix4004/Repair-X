'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Fade,
  InputAdornment,
  IconButton,
  Container,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Security,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

/**
 * SaaS Admin Login Portal - Backend-only Access
 * This page should only be accessible via dedicated backend URL
 */
export default function SaasAdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminKey: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/admin-backend/saas-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'SaaS admin authentication failed');
      }

      const { user, token } = await response.json();
      
      // Store auth data
      localStorage.setItem('saas-admin-token', token);
      localStorage.setItem('saas-admin-user', JSON.stringify(user));
      
      // Redirect to SaaS admin dashboard
      router.push('/saas-admin/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Fade in timeout={800}>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            }}
          >
            <Card sx={{ bgcolor: 'transparent' }}>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box textAlign="center" mb={4}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'warning.main',
                      mx: 'auto',
                      mb: 2,
                      background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
                    }}
                  >
                    <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h3" component="h1" color="warning.main" fontWeight={700} mb={1}>
                    SaaS Admin Portal
                  </Typography>
                  <Typography variant="h6" color="text.secondary" fontWeight={300} mb={2}>
                    Platform Administration Access
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                    <Security color="warning" />
                    <Typography variant="body2" color="warning.main">
                      Backend-only Access • Multi-tenant Management
                    </Typography>
                  </Box>
                </Box>

                {/* Security Notice */}
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3, bgcolor: 'warning.50', border: 1, borderColor: 'warning.200' }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Restricted Access Portal
                  </Typography>
                  <Typography variant="caption">
                    This interface is for SaaS platform administration only. Requires valid admin credentials and access key.
                  </Typography>
                </Alert>

                {/* Error Display */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Admin Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Admin Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="SaaS Admin Access Key"
                    value={formData.adminKey}
                    onChange={handleInputChange('adminKey')}
                    required
                    sx={{ mb: 4 }}
                    helperText="Platform administration security key"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AdminPanelSettings color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    color="warning"
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)',
                      boxShadow: '0 3px 5px 2px rgba(255, 193, 7, .3)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #F57C00 30%, #FFB300 90%)',
                      },
                    }}
                  >
                    {isLoading ? 'Authenticating...' : 'Access SaaS Admin Panel'}
                  </Button>
                </Box>

                {/* Footer */}
                <Box textAlign="center" mt={4}>
                  <Typography variant="caption" color="text.secondary">
                    RepairX SaaS Administration v2.0.0
                  </Typography>
                  <br />
                  <Typography variant="caption" color="warning.main">
                    Platform Management • Multi-tenant Control • System Monitoring
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
}