'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
  AdminPanelSettings,
  Phone,
  Send,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

type LoginType = 'USER_CLIENT' | 'ORGANIZATION' | 'SAAS_ADMIN';

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

interface ConsolidatedAuthProps {
  mode?: 'login' | 'register';
  redirectTo?: string;
}

export function ConsolidatedAuthForms({ mode = 'login', redirectTo }: ConsolidatedAuthProps) {
  const theme = useTheme();
  const router = useRouter();
  const { login, register, isLoading, error, clearError } = useAuth();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(mode);

  // Form data for different login types
  const [userClientForm, setUserClientForm] = useState({
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    rememberMe: false,
  });

  const [organizationForm, setOrganizationForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    contactPerson: '',
    phone: '',
    tenantDomain: '',
    rememberMe: false,
  });

  const [saasAdminForm, setSaasAdminForm] = useState({
    email: '',
    password: '',
    adminKey: '',
    rememberMe: false,
  });

  const loginTypes = [
    {
      id: 'USER_CLIENT' as LoginType,
      label: 'User / Client',
      icon: <Person />,
      color: 'primary' as const,
      description: 'Self-service customer portal with email/phone login',
      features: ['Device registration', 'Service tracking', 'Payment history', 'Direct communication'],
    },
    {
      id: 'ORGANIZATION' as LoginType,
      label: 'Organization',
      icon: <Business />,
      color: 'secondary' as const,
      description: 'Multi-tenant business management with branch support',
      features: ['Multi-branch operations', 'Team management', 'Analytics dashboard', 'Workflow automation'],
    },
    {
      id: 'SAAS_ADMIN' as LoginType,
      label: 'SaaS Admin',
      icon: <AdminPanelSettings />,
      color: 'warning' as const,
      description: 'Platform administration and multi-tenant management',
      features: ['Tenant management', 'Platform analytics', 'White-label config', 'System monitoring'],
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const currentLoginType = loginTypes[currentTab];
    let formData: any;
    let redirectPath: string;

    switch (currentLoginType.id) {
      case 'USER_CLIENT':
        formData = userClientForm;
        redirectPath = '/customer/dashboard';
        break;
      case 'ORGANIZATION':
        formData = organizationForm;
        redirectPath = '/admin/dashboard';
        break;
      case 'SAAS_ADMIN':
        formData = saasAdminForm;
        redirectPath = '/saas-admin/dashboard';
        break;
      default:
        throw new Error('Invalid login type');
    }

    try {
      if (authMode === 'login') {
        await login(formData.email || formData.emailOrPhone, formData.password, currentLoginType.id);
      } else {
        await register({ ...formData, loginType: currentLoginType.id });
      }
      
      router.push(redirectTo || redirectPath);
    } catch (error) {
      console.error(`${authMode} failed:`, error);
    }
  };

  const renderUserClientForm = () => (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {authMode === 'register' && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              value={userClientForm.firstName}
              onChange={(e) => setUserClientForm(prev => ({ ...prev, firstName: e.target.value }))}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={userClientForm.lastName}
              onChange={(e) => setUserClientForm(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </Box>
          <TextField
            fullWidth
            label="Phone Number"
            value={userClientForm.phone}
            onChange={(e) => setUserClientForm(prev => ({ ...prev, phone: e.target.value }))}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
          />
        </>
      )}
      
      <TextField
        fullWidth
        label="Email or Phone"
        type="text"
        value={userClientForm.emailOrPhone}
        onChange={(e) => setUserClientForm(prev => ({ ...prev, emailOrPhone: e.target.value }))}
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
        value={userClientForm.password}
        onChange={(e) => setUserClientForm(prev => ({ ...prev, password: e.target.value }))}
        required
        sx={{ mb: authMode === 'register' ? 3 : 2 }}
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

      {authMode === 'register' && (
        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={userClientForm.confirmPassword}
          onChange={(e) => setUserClientForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
          sx={{ mb: 2 }}
          error={userClientForm.password !== userClientForm.confirmPassword && userClientForm.confirmPassword.length > 0}
          helperText={
            userClientForm.password !== userClientForm.confirmPassword && userClientForm.confirmPassword.length > 0
              ? 'Passwords do not match'
              : ''
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={userClientForm.rememberMe}
            onChange={(e) => setUserClientForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
            color="primary"
          />
        }
        label="Remember me"
        sx={{ mb: 3 }}
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
        {isLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>
    </Box>
  );

  const renderOrganizationForm = () => (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {authMode === 'register' && (
        <>
          <TextField
            fullWidth
            label="Organization Name"
            value={organizationForm.organizationName}
            onChange={(e) => setOrganizationForm(prev => ({ ...prev, organizationName: e.target.value }))}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Contact Person"
            value={organizationForm.contactPerson}
            onChange={(e) => setOrganizationForm(prev => ({ ...prev, contactPerson: e.target.value }))}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={organizationForm.phone}
            onChange={(e) => setOrganizationForm(prev => ({ ...prev, phone: e.target.value }))}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Tenant Domain (optional)"
            value={organizationForm.tenantDomain}
            onChange={(e) => setOrganizationForm(prev => ({ ...prev, tenantDomain: e.target.value }))}
            sx={{ mb: 3 }}
            helperText="Custom domain for white-label deployment"
          />
        </>
      )}
      
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
        sx={{ mb: authMode === 'register' ? 3 : 2 }}
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

      {authMode === 'register' && (
        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={organizationForm.confirmPassword}
          onChange={(e) => setOrganizationForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
          sx={{ mb: 2 }}
          error={organizationForm.password !== organizationForm.confirmPassword && organizationForm.confirmPassword.length > 0}
          helperText={
            organizationForm.password !== organizationForm.confirmPassword && organizationForm.confirmPassword.length > 0
              ? 'Passwords do not match'
              : ''
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={organizationForm.rememberMe}
            onChange={(e) => setOrganizationForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
            color="secondary"
          />
        }
        label="Remember me"
        sx={{ mb: 3 }}
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
        {isLoading ? 'Processing...' : authMode === 'login' ? 'Access Organization' : 'Create Organization'}
      </Button>
    </Box>
  );

  const renderSaasAdminForm = () => (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Admin Email"
        type="email"
        value={saasAdminForm.email}
        onChange={(e) => setSaasAdminForm(prev => ({ ...prev, email: e.target.value }))}
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
        value={saasAdminForm.password}
        onChange={(e) => setSaasAdminForm(prev => ({ ...prev, password: e.target.value }))}
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
        label="Admin Access Key"
        value={saasAdminForm.adminKey}
        onChange={(e) => setSaasAdminForm(prev => ({ ...prev, adminKey: e.target.value }))}
        required
        sx={{ mb: 2 }}
        helperText="Platform administration security key"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AdminPanelSettings color="action" />
            </InputAdornment>
          ),
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={saasAdminForm.rememberMe}
            onChange={(e) => setSaasAdminForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
            color="warning"
          />
        }
        label="Remember me"
        sx={{ mb: 3 }}
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
        }}
      >
        {isLoading ? 'Authenticating...' : 'Access SaaS Admin'}
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
                  Professional Repair Services Platform
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {authMode === 'login' ? 'Sign in to access your account' : 'Create your RepairX account'}
                </Typography>
              </Box>

              {/* Auth Mode Toggle */}
              <Box display="flex" justifyContent="center" mb={3}>
                <Button
                  variant={authMode === 'login' ? 'contained' : 'outlined'}
                  onClick={() => setAuthMode('login')}
                  sx={{ mr: 1 }}
                >
                  Sign In
                </Button>
                <Button
                  variant={authMode === 'register' ? 'contained' : 'outlined'}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </Button>
              </Box>

              {/* Login Type Tabs */}
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
                </Tabs>
              </Box>

              {/* Login Type Description */}
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

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Tab Panels */}
              <TabPanel value={currentTab} index={0}>
                {renderUserClientForm()}
              </TabPanel>
              <TabPanel value={currentTab} index={1}>
                {renderOrganizationForm()}
              </TabPanel>
              <TabPanel value={currentTab} index={2}>
                {renderSaasAdminForm()}
              </TabPanel>

              {/* Footer */}
              <Divider sx={{ my: 3 }} />
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  <Button
                    variant="text"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    sx={{ ml: 1 }}
                  >
                    {authMode === 'login' ? 'Sign up here' : 'Sign in here'}
                  </Button>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  RepairX Enterprise Platform v2.0.0 | Production Ready
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