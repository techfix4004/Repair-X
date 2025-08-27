'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Grid,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Box,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Security,
  Notifications,
  Save,
  Edit,
  Upload,
  Visibility,
  VisibilityOff,
  Lock,
  Shield,
  Key,
  CameraAlt,
} from '@mui/icons-material';

interface AdminProfileSettingsProps {
  adminId?: string;
  onClose?: () => void;
}

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  dateOfJoining: string;
  manager: string;
  bio: string;
  profilePicture?: string;
}

interface ContactInfo {
  primaryPhone: string;
  secondaryPhone: string;
  emergencyContact: string;
  emergencyPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorAuth: boolean;
  sessionTimeout: string;
  loginAlerts: boolean;
  deviceTrust: boolean;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  jobUpdates: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
}

export function AdminProfileSettings({ adminId, onClose }: AdminProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profile, setProfile] = useState<AdminProfile>({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@repairx.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Admin Manager',
    department: 'Operations',
    employeeId: 'EMP001',
    dateOfJoining: '2023-01-15',
    manager: 'Sarah Johnson',
    bio: 'Experienced operations manager with 5+ years in repair industry management.',
    profilePicture: '/api/placeholder/120/120',
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    primaryPhone: '+1 (555) 123-4567',
    secondaryPhone: '+1 (555) 765-4321',
    emergencyContact: 'Jane Smith (Spouse)',
    emergencyPhone: '+1 (555) 999-8888',
    address: {
      street: '123 Admin Street',
      city: 'Management City',
      state: 'Admin State',
      zipCode: '12345',
      country: 'United States',
    },
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: true,
    sessionTimeout: '30',
    loginAlerts: true,
    deviceTrust: false,
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    jobUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
    marketingEmails: false,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const departments = [
    'Operations',
    'Customer Service',
    'Technical',
    'Sales',
    'Marketing',
    'Finance',
    'HR',
    'IT',
  ];

  const managers = [
    'Sarah Johnson',
    'Mike Wilson',
    'Emma Davis',
    'Tom Brown',
    'Lisa Anderson',
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'India',
    'Germany',
    'France',
    'Other',
  ];

  const validateSecurity = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (security.newPassword && security.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (security.newPassword && security.newPassword !== security.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (activeTab === 'security' && !validateSecurity()) {
      return;
    }
    
    // Save logic here
    console.log('Saving profile:', { profile, contactInfo, security, notifications });
    setIsEditing(false);
    setErrors({});
  };

  const handlePasswordChange = () => {
    if (validateSecurity()) {
      // Change password logic
      console.log('Password changed successfully');
      setSecurity({
        ...security,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Person />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.profilePicture} alt="Profile" />
                <AvatarFallback>
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <IconButton
                  className="absolute bottom-0 right-0 bg-white shadow-md"
                  size="small"
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-600">{profile.jobTitle}</p>
              <p className="text-sm text-gray-500">{profile.department}</p>
              {isEditing && (
                <Button variant="outline" size="sm" className="mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Label>First Name *</Label>
              <Input
                value={profile.firstName}
                onChange={(e) => setProfile({
                  ...profile,
                  firstName: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Last Name *</Label>
              <Input
                value={profile.lastName}
                onChange={(e) => setProfile({
                  ...profile,
                  lastName: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({
                  ...profile,
                  email: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Phone Number *</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({
                  ...profile,
                  phone: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Job Title</Label>
              <Input
                value={profile.jobTitle}
                onChange={(e) => setProfile({
                  ...profile,
                  jobTitle: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Department</Label>
              <Select
                value={profile.department}
                onValueChange={(value) => setProfile({
                  ...profile,
                  department: value
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Employee ID</Label>
              <Input
                value={profile.employeeId}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Date of Joining</Label>
              <Input
                type="date"
                value={profile.dateOfJoining}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Reporting Manager</Label>
              <Select
                value={profile.manager}
                onValueChange={(value) => setProfile({
                  ...profile,
                  manager: value
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager} value={manager}>
                      {manager}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Label>Bio</Label>
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile({
                  ...profile,
                  bio: e.target.value
                })}
                disabled={!isEditing}
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Label>Primary Phone *</Label>
              <Input
                value={contactInfo.primaryPhone}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  primaryPhone: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Secondary Phone</Label>
              <Input
                value={contactInfo.secondaryPhone}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  secondaryPhone: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Emergency Contact</Label>
              <Input
                value={contactInfo.emergencyContact}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  emergencyContact: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Emergency Phone</Label>
              <Input
                value={contactInfo.emergencyPhone}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  emergencyPhone: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LocationOn />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Label>Street Address *</Label>
              <Input
                value={contactInfo.address.street}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  address: { ...contactInfo.address, street: e.target.value }
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>City *</Label>
              <Input
                value={contactInfo.address.city}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  address: { ...contactInfo.address, city: e.target.value }
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>State/Province *</Label>
              <Input
                value={contactInfo.address.state}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  address: { ...contactInfo.address, state: e.target.value }
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>ZIP/Postal Code *</Label>
              <Input
                value={contactInfo.address.zipCode}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  address: { ...contactInfo.address, zipCode: e.target.value }
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Country *</Label>
              <Select
                value={contactInfo.address.country}
                onValueChange={(value) => setContactInfo({
                  ...contactInfo,
                  address: { ...contactInfo.address, country: value }
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock />
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({
                    ...security,
                    currentPassword: e.target.value
                  })}
                />
                <IconButton
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={security.newPassword}
                  onChange={(e) => setSecurity({
                    ...security,
                    newPassword: e.target.value
                  })}
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                <IconButton
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  size="small"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </div>
              {errors.newPassword && (
                <div className="text-red-500 text-sm mt-1">{errors.newPassword}</div>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({
                  ...security,
                  confirmPassword: e.target.value
                })}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button 
                onClick={handlePasswordChange}
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Change Password
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield />
            Security Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Switch
              checked={security.twoFactorAuth}
              onCheckedChange={(checked) => setSecurity({
                ...security,
                twoFactorAuth: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Login Alerts</Label>
              <p className="text-sm text-gray-500">Get notified of new logins</p>
            </div>
            <Switch
              checked={security.loginAlerts}
              onCheckedChange={(checked) => setSecurity({
                ...security,
                loginAlerts: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Trust This Device</Label>
              <p className="text-sm text-gray-500">Skip 2FA on this device</p>
            </div>
            <Switch
              checked={security.deviceTrust}
              onCheckedChange={(checked) => setSecurity({
                ...security,
                deviceTrust: checked
              })}
            />
          </div>
          <div>
            <Label>Session Timeout</Label>
            <Select
              value={security.sessionTimeout}
              onValueChange={(value) => setSecurity({
                ...security,
                sessionTimeout: value
              })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Notifications />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                emailNotifications: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={notifications.smsNotifications}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                smsNotifications: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive push notifications</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                pushNotifications: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Job Updates</Label>
              <p className="text-sm text-gray-500">Get notified about job status changes</p>
            </div>
            <Switch
              checked={notifications.jobUpdates}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                jobUpdates: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>System Alerts</Label>
              <p className="text-sm text-gray-500">Important system notifications</p>
            </div>
            <Switch
              checked={notifications.systemAlerts}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                systemAlerts: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-sm text-gray-500">Receive weekly summary reports</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                weeklyReports: checked
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Emails</Label>
              <p className="text-sm text-gray-500">Product updates and promotions</p>
            </div>
            <Switch
              checked={notifications.marketingEmails}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                marketingEmails: checked
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile Settings</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Back to Dashboard
            </Button>
          )}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Person className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Security className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Notifications className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {renderProfileTab()}
        </TabsContent>

        <TabsContent value="contact">
          {renderContactTab()}
        </TabsContent>

        <TabsContent value="security">
          {renderSecurityTab()}
        </TabsContent>

        <TabsContent value="notifications">
          {renderNotificationsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}