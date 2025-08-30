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
  Person,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/**
 * Customer Login Portal - For customers with active services only
 */
export default function CustomerLogin() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    organizationSlug: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        organizationSlug: formData.organizationSlug,
        type: 'CUSTOMER',
      });
      
      router.push('/customer/dashboard');
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) clearError();
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box textAlign="center" mb={4}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  }}
                >
                  <Person sx={{ fontSize: 40, color: 'white' }} />
                </Avatar>
                <Typography variant="h3" component="h1" color="primary.main" fontWeight={700} mb={1}>
                  Customer Access
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={300} mb={2}>
                  Access Your Active Services
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to view your repair progress and communicate with your service provider
                </Typography>
              </Box>

              {/* Access Notice */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
                <Typography variant="body2" color="info.dark" textAlign="center">
                  <strong>Customer Access:</strong> Only available for customers with active services or repairs
                </Typography>
              </Paper>

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
                  label="Email or Phone"
                  type="text"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange('emailOrPhone')}
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
                  label="Password"
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
                  label="Service Provider Code (optional)"
                  value={formData.organizationSlug}
                  onChange={handleInputChange('organizationSlug')}
                  sx={{ mb: 4 }}
                  helperText="Leave blank if accessing via your service provider's domain"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    fontWeight: 600,
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Access My Services'}
                </Button>
              </Box>

              {/* Footer */}
              <Box textAlign="center" mt={4}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Don&apos;t have access? Contact your service provider to set up your account.
                </Typography>
                <Button 
                  variant="text" 
                  onClick={() => router.push('/')}
                  sx={{ mr: 2 }}
                >
                  Back to Home
                </Button>
                <Button 
                  variant="text" 
                  onClick={() => router.push('/auth/organization/login')}
                >
                  Organization Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Container>
  );
}