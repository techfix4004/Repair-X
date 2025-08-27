'use client';

import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
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
  Grid,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Business,
  Settings,
  Person,
  LocationOn,
  Phone,
  Email,
  Save,
  Edit,
  Add,
  Upload,
  Notifications,
  Security,
  Payment,
  Inventory,
  Group,
  Analytics,
  Support,
} from '@mui/icons-material';

interface BusinessSettingsProps {
  organizationId?: string;
}

interface BusinessProfile {
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  website: string;
  description: string;
  logo?: string;
}

interface ContactInfo {
  primaryEmail: string;
  secondaryEmail: string;
  primaryPhone: string;
  secondaryPhone: string;
  fax: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface BusinessHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

export function EnhancedBusinessSettings({ organizationId }: BusinessSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessName: 'RepairX Solutions',
    businessType: 'Electronics Repair',
    registrationNumber: 'REG123456789',
    taxId: 'TAX987654321',
    website: 'https://repairx.com',
    description: 'Professional electronics repair and maintenance services',
    logo: '/api/placeholder/120/120',
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    primaryEmail: 'info@repairx.com',
    secondaryEmail: 'support@repairx.com',
    primaryPhone: '+1 (555) 123-4567',
    secondaryPhone: '+1 (555) 765-4321',
    fax: '+1 (555) 111-2222',
    address: {
      street: '123 Tech Street',
      city: 'Innovation City',
      state: 'Tech State',
      zipCode: '12345',
      country: 'United States',
    },
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: true },
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    autoBackup: true,
    maintenanceMode: false,
    multiFactorAuth: true,
    sessionTimeout: '30',
    theme: 'light',
    language: 'en',
    timezone: 'UTC-5',
    currency: 'USD',
  });

  const businessTypes = [
    'Electronics Repair',
    'Appliance Repair',
    'Computer Repair',
    'Mobile Repair',
    'Automotive Repair',
    'General Repair Services',
    'Other',
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

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
  ];

  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6',
    'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1',
    'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8',
    'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12',
  ];

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    console.log('Settings saved:', { businessProfile, contactInfo, businessHours, preferences });
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Business Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Business />
            Business Profile
          </CardTitle>
          <CardDescription>
            Manage your business information and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={businessProfile.logo} alt="Business Logo" />
              <AvatarFallback>
                <Business />
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-sm text-gray-500 mt-1">
                Recommended: 120x120px, PNG or JPG
              </p>
            </div>
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Label>Business Name *</Label>
              <Input
                value={businessProfile.businessName}
                onChange={(e) => setBusinessProfile({
                  ...businessProfile,
                  businessName: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Business Type *</Label>
              <Select
                value={businessProfile.businessType}
                onValueChange={(value) => setBusinessProfile({
                  ...businessProfile,
                  businessType: value
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Registration Number</Label>
              <Input
                value={businessProfile.registrationNumber}
                onChange={(e) => setBusinessProfile({
                  ...businessProfile,
                  registrationNumber: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Tax ID</Label>
              <Input
                value={businessProfile.taxId}
                onChange={(e) => setBusinessProfile({
                  ...businessProfile,
                  taxId: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Website</Label>
              <Input
                value={businessProfile.website}
                onChange={(e) => setBusinessProfile({
                  ...businessProfile,
                  website: e.target.value
                })}
                disabled={!isEditing}
                placeholder="https://"
              />
            </Grid>
            <Grid item xs={12}>
              <Label>Business Description</Label>
              <Textarea
                value={businessProfile.description}
                onChange={(e) => setBusinessProfile({
                  ...businessProfile,
                  description: e.target.value
                })}
                disabled={!isEditing}
                rows={3}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone />
            Contact Information
          </CardTitle>
          <CardDescription>
            Manage your business contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Label>Primary Email *</Label>
              <Input
                type="email"
                value={contactInfo.primaryEmail}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  primaryEmail: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Secondary Email</Label>
              <Input
                type="email"
                value={contactInfo.secondaryEmail}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  secondaryEmail: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
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
              <Label>Fax</Label>
              <Input
                value={contactInfo.fax}
                onChange={(e) => setContactInfo({
                  ...contactInfo,
                  fax: e.target.value
                })}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>

          <Divider className="my-4" />
          <h4 className="font-semibold flex items-center gap-2">
            <LocationOn />
            Business Address
          </h4>

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

  const renderOperationalSettings = () => (
    <div className="space-y-6">
      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>
            Set your operating hours for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(businessHours).map(([day, hours]) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24 capitalize font-medium">{day}</div>
                <Switch
                  checked={!hours.closed}
                  onCheckedChange={(checked) => setBusinessHours({
                    ...businessHours,
                    [day]: { ...hours, closed: !checked }
                  })}
                  disabled={!isEditing}
                />
                {!hours.closed ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => setBusinessHours({
                        ...businessHours,
                        [day]: { ...hours, open: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="w-32"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => setBusinessHours({
                        ...businessHours,
                        [day]: { ...hours, close: e.target.value }
                      })}
                      disabled={!isEditing}
                      className="w-32"
                    />
                  </div>
                ) : (
                  <Chip label="Closed" variant="outlined" color="default" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings />
            System Preferences
          </CardTitle>
          <CardDescription>
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Label>Default Currency</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => setPreferences({
                  ...preferences,
                  currency: value
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences({
                  ...preferences,
                  timezone: value
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({
                  ...preferences,
                  language: value
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Session Timeout (minutes)</Label>
              <Select
                value={preferences.sessionTimeout}
                onValueChange={(value) => setPreferences({
                  ...preferences,
                  sessionTimeout: value
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
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
            </Grid>
          </Grid>

          <Divider className="my-4" />

          <div className="space-y-3">
            <h4 className="font-semibold">System Settings</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Auto Backup</Label>
                <Switch
                  checked={preferences.autoBackup}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    autoBackup: checked
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Maintenance Mode</Label>
                <Switch
                  checked={preferences.maintenanceMode}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    maintenanceMode: checked
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Multi-Factor Authentication</Label>
                <Switch
                  checked={preferences.multiFactorAuth}
                  onCheckedChange={(checked) => setPreferences({
                    ...preferences,
                    multiFactorAuth: checked
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Notifications />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences({
                ...preferences,
                emailNotifications: checked
              })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => setPreferences({
                ...preferences,
                smsNotifications: checked
              })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive push notifications in browser</p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => setPreferences({
                ...preferences,
                pushNotifications: checked
              })}
              disabled={!isEditing}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Marketing Emails</Label>
              <p className="text-sm text-gray-500">Receive product updates and marketing</p>
            </div>
            <Switch
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => setPreferences({
                ...preferences,
                marketingEmails: checked
              })}
              disabled={!isEditing}
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
          <h1 className="text-3xl font-bold">Business Settings</h1>
          <p className="text-gray-600">Manage your organization configuration and preferences</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Settings
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Business className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Operational
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Notifications className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {renderGeneralSettings()}
        </TabsContent>

        <TabsContent value="operational">
          {renderOperationalSettings()}
        </TabsContent>

        <TabsContent value="notifications">
          {renderNotificationSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
}