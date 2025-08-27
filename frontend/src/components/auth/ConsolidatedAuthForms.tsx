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
  Zoom,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  useTheme,
  alpha,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
  Phone,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type LoginType = 'CUSTOMER' | 'ORGANIZATION';

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

interface OrganizationBoundAuthProps {
  mode?: 'login' | 'register';
  redirectTo?: string;
}

export function ConsolidatedAuthForms({ mode = 'login', redirectTo }: OrganizationBoundAuthProps) {
  const theme = useTheme();
  const router = useRouter();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(mode);

  // Form data for different login types
  const [customerForm, setCustomerForm] = useState({
    emailOrPhone: '',
    password: '',
    organizationSlug: '',
  });

  const [organizationForm, setOrganizationForm] = useState({
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

  const loginTypes = [
    {
      id: 'CUSTOMER' as LoginType,
      label: 'Customer Access',
      icon: <Person />,
      color: 'primary' as const,
      description: 'Access your active repairs and communicate with your service provider',
      features: ['Service tracking', 'Progress updates', 'Direct communication'],
      endpoint: '/auth/customer/login',
    },
    {
      id: 'ORGANIZATION' as LoginType,
      label: 'Organization Team',
      icon: <Business />,
      color: 'secondary' as const,
      description: 'Team member access for technicians, managers, and business owners',
      features: ['Job management', 'Team coordination', 'Business analytics'],
      endpoint: '/auth/organization/login',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const currentLoginType = loginTypes[currentTab];
    let formData: any;
    let redirectPath: string;

    switch (currentLoginType.id) {
      case 'CUSTOMER':
        formData = customerForm;
        redirectPath = '/customer/dashboard';
        break;
      case 'ORGANIZATION':
        formData = organizationForm;
        redirectPath = '/admin/dashboard';
        break;
      default:
        throw new Error('Invalid login type');
    }

    try {
      const response = await fetch(`/api/v1${currentLoginType.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication failed');
      }

      const { user, token } = await response.json();
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginType', currentLoginType.id);
      
      router.push(redirectTo || redirectPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (invitationForm.password !== invitationForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
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
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginType', 'ORGANIZATION');
      
      router.push('/admin/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invitation acceptance failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCustomerForm = () => (
    <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Email or Phone"
        type="text"
        value={customerForm.emailOrPhone}
        onChange={(e) => setCustomerForm(prev => ({ ...prev, emailOrPhone: e.target.value }))}
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
        value={customerForm.password}
        onChange={(e) => setCustomerForm(prev => ({ ...prev, password: e.target.value }))}
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
        value={customerForm.organizationSlug}
        onChange={(e) => setCustomerForm(prev => ({ ...prev, organizationSlug: e.target.value }))}
        sx={{ mb: 3 }}
        helperText="Leave blank if accessing via organization's custom domain"
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
        }}
      >
        {isLoading ? 'Signing In...' : 'Access Services'}
      </Button>
    </Box>
  );

  const renderOrganizationForm = () => (
    <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Business Email"
        type="email"
        value={organizationForm.email}
        onChange={(e) => setOrganizationForm(prev => ({ ...prev, email: e.target.value }))}
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
        value={organizationForm.password}
        onChange={(e) => setOrganizationForm(prev => ({ ...prev, password: e.target.value }))}
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
        value={organizationForm.organizationSlug}
        onChange={(e) => setOrganizationForm(prev => ({ ...prev, organizationSlug: e.target.value }))}
        sx={{ mb: 3 }}
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
        }}
      >
        {isLoading ? 'Signing In...' : 'Access Organization'}
      </Button>
    </Box>
  );

  const renderInvitationForm = () => (
    <Box component="form" onSubmit={handleAcceptInvitation} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Invitation Token"
        value={invitationForm.token}
        onChange={(e) => setInvitationForm(prev => ({ ...prev, token: e.target.value }))}
        required
        sx={{ mb: 3 }}
        helperText="Token from your invitation email"
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="First Name"
          value={invitationForm.firstName}
          onChange={(e) => setInvitationForm(prev => ({ ...prev, firstName: e.target.value }))}
          required
        />
        <TextField
          fullWidth
          label="Last Name"
          value={invitationForm.lastName}
          onChange={(e) => setInvitationForm(prev => ({ ...prev, lastName: e.target.value }))}
          required
        />
      </Box>
      
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={invitationForm.password}
        onChange={(e) => setInvitationForm(prev => ({ ...prev, password: e.target.value }))}
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
        onChange={(e) => setInvitationForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
        required
        sx={{ mb: 3 }}
        error={invitationForm.password !== invitationForm.confirmPassword && invitationForm.confirmPassword.length > 0}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        color="success"
        endIcon={<ArrowForward />}
        sx={{ py: 1.5 }}
      >
        {isLoading ? 'Creating Account...' : 'Accept Invitation'}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Fade in timeout={800}>
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {isLoading && <LinearProgress />}
            
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box textAlign="center" mb={4}>
                <Zoom in timeout={600}>
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
                    🔧
                  </Avatar>
                </Zoom>
                <Typography variant="h3" component="h1" color="primary.main" fontWeight={700} mb={1}>
                  RepairX
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={300} mb={2}>
                  Organization-bound Secure Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access your authorized services and organization tools
                </Typography>
              </Box>

              {/* Access Type Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  centered
                >
                  {loginTypes.map((type, index) => (
                    <Tab
                      key={type.id}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          {type.icon}
                          <Typography variant="body2" fontWeight={500}>
                            {type.label}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        minHeight: 60,
                        color: `${type.color}.main`,
                        '&.Mui-selected': {
                          color: `${type.color}.main`,
                        },
                      }}
                    />
                  ))}
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

              {/* Access Type Description */}
              {currentTab < 2 && (
                <Box mb={3}>
                  <Typography variant="body1" fontWeight={500} mb={1} color={`${loginTypes[currentTab].color}.main`}>
                    {loginTypes[currentTab].description}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {loginTypes[currentTab].features.map((feature) => (
                      <Box
                        key={feature}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: alpha(theme.palette[loginTypes[currentTab].color].main, 0.1),
                          color: `${loginTypes[currentTab].color}.main`,
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        {feature}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Access Restrictions Notice */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
                <Typography variant="body2" color="info.dark" textAlign="center">
                  <strong>🔐 Secure Access:</strong> Only organization members and customers with active services can access this platform.
                </Typography>
              </Paper>

              {/* Tab Panels */}
              <TabPanel value={currentTab} index={0}>
                {renderCustomerForm()}
              </TabPanel>
              <TabPanel value={currentTab} index={1}>
                {renderOrganizationForm()}
              </TabPanel>
              <TabPanel value={currentTab} index={2}>
                {renderInvitationForm()}
              </TabPanel>

              {/* Footer */}
              <Box textAlign="center" mt={4}>
                <Typography variant="caption" color="text.secondary">
                  RepairX Organization-bound Platform v2.0.0
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  Secure • Role-based • Multi-tenant
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Box>
  );
}

export default ConsolidatedAuthForms;