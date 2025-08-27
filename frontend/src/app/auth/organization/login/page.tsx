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
  Tab,
  Tabs,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  Person,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Organization Login Portal - For team members and invitation acceptance
 */
export default function OrganizationLogin() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    organizationSlug: '',
  });

  const [invitationForm, setInvitationForm] = useState({
    token: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    clearError();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({
        email: loginForm.email,
        password: loginForm.password,
        organizationSlug: loginForm.organizationSlug,
        type: 'ORGANIZATION',
      });
      
      router.push('/admin/dashboard');
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  const handleInvitationAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (invitationForm.password !== invitationForm.confirmPassword) {
      // Handle password mismatch error
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invitationForm.token,
          password: invitationForm.password,
          firstName: invitationForm.firstName,
          lastName: invitationForm.lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invitation acceptance failed');
      }

      const { user, token } = await response.json();
      
      // Store auth data and redirect
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginType', 'ORGANIZATION');
      
      router.push('/admin/dashboard');
    } catch (error) {
      // Handle error
    }
  };

  const handleLoginInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(prev => ({ ...prev, [field]: e.target.value }));
    if (error) clearError();
  };

  const handleInvitationInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvitationForm(prev => ({ ...prev, [field]: e.target.value }));
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
                    bgcolor: 'secondary.main',
                    mx: 'auto',
                    mb: 2,
                    background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                  }}
                >
                  <Business sx={{ fontSize: 40, color: 'white' }} />
                </Avatar>
                <Typography variant="h3" component="h1" color="secondary.main" fontWeight={700} mb={1}>
                  Organization Access
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={300} mb={2}>
                  Team Member Portal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access your organization dashboard and manage your team
                </Typography>
              </Box>

              {/* Access Notice */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'secondary.50', border: 1, borderColor: 'secondary.200' }}>
                <Typography variant="body2" color="secondary.dark" textAlign="center">
                  <strong>Team Access:</strong> Only for organization members and invited users
                </Typography>
              </Paper>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  centered
                >
                  <Tab
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business />
                        <Typography variant="body2" fontWeight={500}>
                          Team Login
                        </Typography>
                      </Box>
                    }
                    sx={{ minHeight: 60 }}
                  />
                  <Tab
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person />
                        <Typography variant="body2" fontWeight={500}>
                          Join Team
                        </Typography>
                      </Box>
                    }
                    sx={{ minHeight: 60 }}
                  />
                </Tabs>
              </Box>

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Team Login Tab */}
              <TabPanel value={currentTab} index={0}>
                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Business Email"
                    type="email"
                    value={loginForm.email}
                    onChange={handleLoginInputChange('email')}
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
                    value={loginForm.password}
                    onChange={handleLoginInputChange('password')}
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
                    label="Organization Code (optional)"
                    value={loginForm.organizationSlug}
                    onChange={handleLoginInputChange('organizationSlug')}
                    sx={{ mb: 4 }}
                    helperText="Leave blank if accessing via organization's custom domain"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    color="secondary"
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                      boxShadow: '0 3px 5px 2px rgba(233, 30, 99, .3)',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? 'Signing In...' : 'Access Organization'}
                  </Button>
                </Box>
              </TabPanel>

              {/* Join Team Tab */}
              <TabPanel value={currentTab} index={1}>
                <Box component="form" onSubmit={handleInvitationAccept}>
                  <TextField
                    fullWidth
                    label="Invitation Token"
                    value={invitationForm.token}
                    onChange={handleInvitationInputChange('token')}
                    required
                    sx={{ mb: 3 }}
                    helperText="Token from your invitation email"
                  />

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={invitationForm.firstName}
                      onChange={handleInvitationInputChange('firstName')}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={invitationForm.lastName}
                      onChange={handleInvitationInputChange('lastName')}
                      required
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={invitationForm.password}
                    onChange={handleInvitationInputChange('password')}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
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
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={invitationForm.confirmPassword}
                    onChange={handleInvitationInputChange('confirmPassword')}
                    required
                    sx={{ mb: 4 }}
                    error={invitationForm.password !== invitationForm.confirmPassword && invitationForm.confirmPassword.length > 0}
                    helperText={
                      invitationForm.password !== invitationForm.confirmPassword && invitationForm.confirmPassword.length > 0
                        ? 'Passwords do not match'
                        : ''
                    }
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || invitationForm.password !== invitationForm.confirmPassword}
                    color="success"
                    endIcon={<ArrowForward />}
                    sx={{ py: 1.5, fontWeight: 600 }}
                  >
                    {isLoading ? 'Creating Account...' : 'Accept Invitation'}
                  </Button>
                </Box>
              </TabPanel>

              {/* Footer */}
              <Box textAlign="center" mt={4}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Need an invitation? Contact your organization administrator.
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
                  onClick={() => router.push('/auth/customer/login')}
                >
                  Customer Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Container>
  );
}