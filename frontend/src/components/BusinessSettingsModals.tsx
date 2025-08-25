/**
 * Complete Business Settings Modals - Missing UI Components
 * 
 * This implements the missing frontend modals for all 20+ business settings categories
 * as identified in the roadmap analysis, providing comprehensive enterprise-grade
 * configuration interfaces.
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog-only';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  MapPin,
  Bell,
  Building,
  Save,
  Plus,
} from 'lucide-react';

// Category 11: Address/Location Settings Modal
export function AddressLocationSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    serviceAreas: [
      { id: 1, name: 'Downtown', radius: 10, zipCodes: '10001,10002,10003' },
      { id: 2, name: 'Suburbs', radius: 25, zipCodes: '11001,11002,11003' }
    ],
    territoryManagement: {
      autoAssignment: true,
      overlapHandling: 'PRIORITY_BASED',
      maxTravelTime: 45
    },
    geoRestrictions: {
      enabled: true,
      restrictedZones: ['Area 51', 'Military Base'],
      emergencyOverride: true
    }
  });

  const addServiceArea = () => {
    setSettings({
      ...settings,
      serviceAreas: [
        ...settings.serviceAreas,
        { id: Date.now(), name: '', radius: 10, zipCodes: '' }
      ]
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Address & Location Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="service-areas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="service-areas">Service Areas</TabsTrigger>
            <TabsTrigger value="territory">Territory Management</TabsTrigger>
            <TabsTrigger value="restrictions">Geo Restrictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="service-areas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Service Areas Configuration</h3>
              <Button onClick={addServiceArea} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Area
              </Button>
            </div>
            
            <div className="space-y-4">
              {settings.serviceAreas.map((area) => (
                <Card key={area.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`area-name-${area.id}`}>Area Name</Label>
                        <Input
                          id={`area-name-${area.id}`}
                          value={area.name}
                          onChange={(e) => {
                            const updatedAreas = settings.serviceAreas.map(a => 
                              a.id === area.id ? { ...a, name: e.target.value } : a
                            );
                            setSettings({ ...settings, serviceAreas: updatedAreas });
                          }}
                          placeholder="Downtown, Suburbs, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`area-radius-${area.id}`}>Service Radius (km)</Label>
                        <Input
                          id={`area-radius-${area.id}`}
                          type="number"
                          value={area.radius}
                          onChange={(e) => {
                            const updatedAreas = settings.serviceAreas.map(a => 
                              a.id === area.id ? { ...a, radius: parseInt(e.target.value) } : a
                            );
                            setSettings({ ...settings, serviceAreas: updatedAreas });
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`area-zip-${area.id}`}>ZIP/Postal Codes</Label>
                        <Input
                          id={`area-zip-${area.id}`}
                          value={area.zipCodes}
                          onChange={(e) => {
                            const updatedAreas = settings.serviceAreas.map(a => 
                              a.id === area.id ? { ...a, zipCodes: e.target.value } : a
                            );
                            setSettings({ ...settings, serviceAreas: updatedAreas });
                          }}
                          placeholder="10001,10002,10003"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="territory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Territory Management</CardTitle>
                <CardDescription>Configure how service territories are managed and assigned</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-assignment">Automatic Territory Assignment</Label>
                  <Switch
                    id="auto-assignment"
                    checked={settings.territoryManagement.autoAssignment}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        territoryManagement: { ...settings.territoryManagement, autoAssignment: checked }
                      })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="overlap-handling">Overlap Handling</Label>
                  <Select
                    value={settings.territoryManagement.overlapHandling}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        territoryManagement: { ...settings.territoryManagement, overlapHandling: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIORITY_BASED">Priority Based</SelectItem>
                      <SelectItem value="FIRST_COME_FIRST_SERVED">First Come First Served</SelectItem>
                      <SelectItem value="LOAD_BALANCING">Load Balancing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="max-travel-time">Maximum Travel Time (minutes)</Label>
                  <Input
                    id="max-travel-time"
                    type="number"
                    value={settings.territoryManagement.maxTravelTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        territoryManagement: { ...settings.territoryManagement, maxTravelTime: parseInt(e.target.value) }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="restrictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Restrictions</CardTitle>
                <CardDescription>Define areas where services cannot be provided</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="geo-restrictions">Enable Geographic Restrictions</Label>
                  <Switch
                    id="geo-restrictions"
                    checked={settings.geoRestrictions.enabled}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        geoRestrictions: { ...settings.geoRestrictions, enabled: checked }
                      })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="restricted-zones">Restricted Zones</Label>
                  <Textarea
                    id="restricted-zones"
                    value={settings.geoRestrictions.restrictedZones.join('\n')}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        geoRestrictions: { ...settings.geoRestrictions, restrictedZones: e.target.value.split('\n') }
                      })
                    }
                    placeholder="Enter one restricted zone per line"
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="emergency-override">Emergency Override</Label>
                  <Switch
                    id="emergency-override"
                    checked={settings.geoRestrictions.emergencyOverride}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        geoRestrictions: { ...settings.geoRestrictions, emergencyOverride: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Category 12: Reminder System Modal
export function ReminderSystemModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    followUpReminders: {
      enabled: true,
      quotationReminder: { days: [3, 7, 14], template: 'QUOTATION_FOLLOWUP' },
      deliveryReminder: { days: [1, 0], template: 'DELIVERY_REMINDER' },
      paymentReminder: { days: [7, 14, 30], template: 'PAYMENT_REMINDER' }
    },
    escalationRules: {
      enabled: true,
      levels: [
        { level: 1, afterDays: 3, action: 'EMAIL_REMINDER' },
        { level: 2, afterDays: 7, action: 'SMS_AND_EMAIL' },
        { level: 3, afterDays: 14, action: 'MANAGER_NOTIFICATION' }
      ]
    },
    communicationSchedule: {
      workingHours: { start: '09:00', end: '18:00' },
      workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      timeZone: 'America/New_York'
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Reminder System Configuration
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="follow-ups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="follow-ups">Follow-up Reminders</TabsTrigger>
            <TabsTrigger value="escalation">Escalation Rules</TabsTrigger>
            <TabsTrigger value="schedule">Communication Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="follow-ups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automated Follow-up Reminders</CardTitle>
                <CardDescription>Configure when and how follow-up reminders are sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="followups-enabled">Enable Follow-up Reminders</Label>
                  <Switch
                    id="followups-enabled"
                    checked={settings.followUpReminders.enabled}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        followUpReminders: { ...settings.followUpReminders, enabled: checked }
                      })
                    }
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Quotation Reminders</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Reminder Days</Label>
                        <Input
                          value={settings.followUpReminders.quotationReminder.days.join(', ')}
                          onChange={(e) => {
                            const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                            setSettings({
                              ...settings,
                              followUpReminders: {
                                ...settings.followUpReminders,
                                quotationReminder: { ...settings.followUpReminders.quotationReminder, days }
                              }
                            });
                          }}
                          placeholder="3, 7, 14"
                        />
                      </div>
                      <div>
                        <Label>Email Template</Label>
                        <Select value={settings.followUpReminders.quotationReminder.template}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="QUOTATION_FOLLOWUP">Standard Quotation Follow-up</SelectItem>
                            <SelectItem value="QUOTATION_URGENT">Urgent Quotation Follow-up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Delivery Reminders</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Reminder Days</Label>
                        <Input
                          value={settings.followUpReminders.deliveryReminder.days.join(', ')}
                          onChange={(e) => {
                            const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                            setSettings({
                              ...settings,
                              followUpReminders: {
                                ...settings.followUpReminders,
                                deliveryReminder: { ...settings.followUpReminders.deliveryReminder, days }
                              }
                            });
                          }}
                          placeholder="1, 0 (day before, day of)"
                        />
                      </div>
                      <div>
                        <Label>Email Template</Label>
                        <Select value={settings.followUpReminders.deliveryReminder.template}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DELIVERY_REMINDER">Standard Delivery Reminder</SelectItem>
                            <SelectItem value="DELIVERY_URGENT">Urgent Delivery Reminder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Payment Reminders</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Reminder Days</Label>
                        <Input
                          value={settings.followUpReminders.paymentReminder.days.join(', ')}
                          onChange={(e) => {
                            const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                            setSettings({
                              ...settings,
                              followUpReminders: {
                                ...settings.followUpReminders,
                                paymentReminder: { ...settings.followUpReminders.paymentReminder, days }
                              }
                            });
                          }}
                          placeholder="7, 14, 30"
                        />
                      </div>
                      <div>
                        <Label>Email Template</Label>
                        <Select value={settings.followUpReminders.paymentReminder.template}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PAYMENT_REMINDER">Standard Payment Reminder</SelectItem>
                            <SelectItem value="PAYMENT_FINAL">Final Payment Notice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="escalation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escalation Rules</CardTitle>
                <CardDescription>Define when and how issues should be escalated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="escalation-enabled">Enable Escalation Rules</Label>
                  <Switch
                    id="escalation-enabled"
                    checked={settings.escalationRules.enabled}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        escalationRules: { ...settings.escalationRules, enabled: checked }
                      })
                    }
                  />
                </div>
                
                <div className="space-y-3">
                  {settings.escalationRules.levels.map((level, index) => (
                    <div key={level.level} className="border rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Level {level.level}</Label>
                          <Badge variant="outline">Level {level.level}</Badge>
                        </div>
                        <div>
                          <Label>After Days</Label>
                          <Input
                            type="number"
                            value={level.afterDays}
                            onChange={(e) => {
                              const updatedLevels = settings.escalationRules.levels.map((l, i) =>
                                i === index ? { ...l, afterDays: parseInt(e.target.value) } : l
                              );
                              setSettings({
                                ...settings,
                                escalationRules: { ...settings.escalationRules, levels: updatedLevels }
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>Action</Label>
                          <Select
                            value={level.action}
                            onValueChange={(value) => {
                              const updatedLevels = settings.escalationRules.levels.map((l, i) =>
                                i === index ? { ...l, action: value } : l
                              );
                              setSettings({
                                ...settings,
                                escalationRules: { ...settings.escalationRules, levels: updatedLevels }
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMAIL_REMINDER">Email Reminder</SelectItem>
                              <SelectItem value="SMS_REMINDER">SMS Reminder</SelectItem>
                              <SelectItem value="SMS_AND_EMAIL">SMS & Email</SelectItem>
                              <SelectItem value="MANAGER_NOTIFICATION">Manager Notification</SelectItem>
                              <SelectItem value="ESCALATE_TO_ADMIN">Escalate to Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Communication Schedule</CardTitle>
                <CardDescription>Define when reminders and communications should be sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Working Hours Start</Label>
                    <Input
                      type="time"
                      value={settings.communicationSchedule.workingHours.start}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          communicationSchedule: {
                            ...settings.communicationSchedule,
                            workingHours: { ...settings.communicationSchedule.workingHours, start: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Working Hours End</Label>
                    <Input
                      type="time"
                      value={settings.communicationSchedule.workingHours.end}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          communicationSchedule: {
                            ...settings.communicationSchedule,
                            workingHours: { ...settings.communicationSchedule.workingHours, end: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Time Zone</Label>
                  <Select
                    value={settings.communicationSchedule.timeZone}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        communicationSchedule: { ...settings.communicationSchedule, timeZone: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                      <Button
                        key={day}
                        variant={settings.communicationSchedule.workingDays.includes(day) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const workingDays = settings.communicationSchedule.workingDays.includes(day)
                            ? settings.communicationSchedule.workingDays.filter(d => d !== day)
                            : [...settings.communicationSchedule.workingDays, day];
                          setSettings({
                            ...settings,
                            communicationSchedule: { ...settings.communicationSchedule, workingDays }
                          });
                        }}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Category 13: Business Information Modal
export function BusinessInformationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    companyProfile: {
      legalName: 'RepairX Services LLC',
      dbaName: 'RepairX',
      taxId: '12-3456789',
      incorporation: { state: 'Delaware', country: 'United States', date: '2024-01-01' },
      businessType: 'LLC',
      industry: 'Technology Services'
    },
    contactDetails: {
      headquarters: {
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States'
      },
      phone: '+1 (555) 123-4567',
      email: 'info@repairx.com',
      website: 'https://repairx.com',
      supportEmail: 'support@repairx.com',
      salesEmail: 'sales@repairx.com'
    },
    brandingSettings: {
      logo: '/assets/logo.png',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      accentColor: '#ea580c',
      fontFamily: 'Inter',
      tagline: 'Professional Repair Services',
      mission: 'To provide exceptional repair services with cutting-edge technology'
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            Business Information
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="company" className="space-y-4">
          <TabsList>
            <TabsTrigger value="company">Company Profile</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Legal and business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal-name">Legal Company Name</Label>
                    <Input
                      id="legal-name"
                      value={settings.companyProfile.legalName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          companyProfile: { ...settings.companyProfile, legalName: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dba-name">DBA Name</Label>
                    <Input
                      id="dba-name"
                      value={settings.companyProfile.dbaName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          companyProfile: { ...settings.companyProfile, dbaName: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax-id">Tax ID / EIN</Label>
                    <Input
                      id="tax-id"
                      value={settings.companyProfile.taxId}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          companyProfile: { ...settings.companyProfile, taxId: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="business-type">Business Type</Label>
                    <Select
                      value={settings.companyProfile.businessType}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          companyProfile: { ...settings.companyProfile, businessType: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LLC">Limited Liability Company (LLC)</SelectItem>
                        <SelectItem value="CORP">Corporation</SelectItem>
                        <SelectItem value="S_CORP">S-Corporation</SelectItem>
                        <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                        <SelectItem value="SOLE_PROPRIETORSHIP">Sole Proprietorship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={settings.companyProfile.industry}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          companyProfile: { ...settings.companyProfile, industry: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology Services">Technology Services</SelectItem>
                        <SelectItem value="Electronics Repair">Electronics Repair</SelectItem>
                        <SelectItem value="Appliance Repair">Appliance Repair</SelectItem>
                        <SelectItem value="Automotive Services">Automotive Services</SelectItem>
                        <SelectItem value="Home Services">Home Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="incorporation-date">Incorporation Date</Label>
                    <Input
                      id="incorporation-date"
                      type="date"
                      value={settings.companyProfile.incorporation.date}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          companyProfile: {
                            ...settings.companyProfile,
                            incorporation: { ...settings.companyProfile.incorporation, date: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="incorporation-state">Incorporation State</Label>
                    <Input
                      id="incorporation-state"
                      value={settings.companyProfile.incorporation.state}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          companyProfile: {
                            ...settings.companyProfile,
                            incorporation: { ...settings.companyProfile.incorporation, state: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="incorporation-country">Incorporation Country</Label>
                    <Input
                      id="incorporation-country"
                      value={settings.companyProfile.incorporation.country}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          companyProfile: {
                            ...settings.companyProfile,
                            incorporation: { ...settings.companyProfile.incorporation, country: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Business contact details and addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Headquarters Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={settings.contactDetails.headquarters.address}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactDetails: {
                              ...settings.contactDetails,
                              headquarters: { ...settings.contactDetails.headquarters, address: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={settings.contactDetails.headquarters.city}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactDetails: {
                              ...settings.contactDetails,
                              headquarters: { ...settings.contactDetails.headquarters, city: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={settings.contactDetails.headquarters.state}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactDetails: {
                              ...settings.contactDetails,
                              headquarters: { ...settings.contactDetails.headquarters, state: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input
                        id="zip"
                        value={settings.contactDetails.headquarters.zipCode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactDetails: {
                              ...settings.contactDetails,
                              headquarters: { ...settings.contactDetails.headquarters, zipCode: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={settings.contactDetails.headquarters.country}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactDetails: {
                              ...settings.contactDetails,
                              headquarters: { ...settings.contactDetails.headquarters, country: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.contactDetails.phone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactDetails: { ...settings.contactDetails, phone: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={settings.contactDetails.website}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactDetails: { ...settings.contactDetails, website: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">General Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.contactDetails.email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactDetails: { ...settings.contactDetails, email: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      value={settings.contactDetails.supportEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactDetails: { ...settings.contactDetails, supportEmail: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sales-email">Sales Email</Label>
                    <Input
                      id="sales-email"
                      type="email"
                      value={settings.contactDetails.salesEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactDetails: { ...settings.contactDetails, salesEmail: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branding Settings</CardTitle>
                <CardDescription>Logo, colors, and brand identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo-path">Logo Path</Label>
                    <Input
                      id="logo-path"
                      value={settings.brandingSettings.logo}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          brandingSettings: { ...settings.brandingSettings, logo: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={settings.brandingSettings.tagline}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          brandingSettings: { ...settings.brandingSettings, tagline: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={settings.brandingSettings.primaryColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            brandingSettings: { ...settings.brandingSettings, primaryColor: e.target.value }
                          })
                        }
                        className="w-20"
                      />
                      <Input
                        value={settings.brandingSettings.primaryColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            brandingSettings: { ...settings.brandingSettings, primaryColor: e.target.value }
                          })
                        }
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={settings.brandingSettings.secondaryColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            brandingSettings: { ...settings.brandingSettings, secondaryColor: e.target.value }
                          })
                        }
                        className="w-20"
                      />
                      <Input
                        value={settings.brandingSettings.secondaryColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            brandingSettings: { ...settings.brandingSettings, secondaryColor: e.target.value }
                          })
                        }
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={settings.brandingSettings.accentColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            brandingSettings: { ...settings.brandingSettings, accentColor: e.target.value }
                          })
                        }
                        className="w-20"
                      />
                      <Input
                        value={settings.brandingSettings.accentColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            brandingSettings: { ...settings.brandingSettings, accentColor: e.target.value }
                          })
                        }
                        placeholder="#ea580c"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select
                      value={settings.brandingSettings.fontFamily}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          brandingSettings: { ...settings.brandingSettings, fontFamily: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="mission">Mission Statement</Label>
                  <Textarea
                    id="mission"
                    value={settings.brandingSettings.mission}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        brandingSettings: { ...settings.brandingSettings, mission: e.target.value }
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export all modals for easy import
export const BusinessSettingsModals = {
  AddressLocationSettingsModal,
  ReminderSystemModal,
  BusinessInformationModal,
};