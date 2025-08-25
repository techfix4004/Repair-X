/**
 * Additional Business Settings Modals - Categories 14-20
 * 
 * This implements the remaining missing frontend modals for business settings
 * categories: Sequence Settings, Expense Management, Outsourcing Settings,
 * Quality Settings, Security Settings, and Integration Settings.
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
  Hash,
  DollarSign,
  CheckCircle,
  Shield,
  Zap,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Settings
} from 'lucide-react';

// Category 14: Sequence Settings Modal
export function SequenceSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    jobSequence: {
      prefix: 'JOB',
      startNumber: 1000,
      increment: 1,
      padding: 4,
      format: 'JOB-{YYYY}-{MM}-{####}',
      resetFrequency: 'YEARLY'
    },
    quoteSequence: {
      prefix: 'QUO',
      startNumber: 1000,
      increment: 1,
      padding: 4,
      format: 'QUO-{YYYY}-{####}',
      resetFrequency: 'YEARLY'
    },
    invoiceSequence: {
      prefix: 'INV',
      startNumber: 1000,
      increment: 1,
      padding: 4,
      format: 'INV-{YYYY}-{MM}-{####}',
      resetFrequency: 'MONTHLY'
    },
    receiptSequence: {
      prefix: 'RCT',
      startNumber: 1,
      increment: 1,
      padding: 6,
      format: 'RCT-{######}',
      resetFrequency: 'NEVER'
    }
  });

  const formatTokens = [
    { token: '{YYYY}', description: 'Full year (2024)' },
    { token: '{YY}', description: 'Short year (24)' },
    { token: '{MM}', description: 'Month with zero padding (01-12)' },
    { token: '{DD}', description: 'Day with zero padding (01-31)' },
    { token: '{####}', description: 'Number with padding' },
    { token: '{PREFIX}', description: 'Sequence prefix' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-600" />
            Sequence Settings Configuration
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Job Numbers</TabsTrigger>
            <TabsTrigger value="quotes">Quote Numbers</TabsTrigger>
            <TabsTrigger value="invoices">Invoice Numbers</TabsTrigger>
            <TabsTrigger value="receipts">Receipt Numbers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Number Sequence</CardTitle>
                <CardDescription>Configure how job numbers are generated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job-prefix">Prefix</Label>
                    <Input
                      id="job-prefix"
                      value={settings.jobSequence.prefix}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          jobSequence: { ...settings.jobSequence, prefix: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="job-start">Starting Number</Label>
                    <Input
                      id="job-start"
                      type="number"
                      value={settings.jobSequence.startNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          jobSequence: { ...settings.jobSequence, startNumber: parseInt(e.target.value) }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="job-increment">Increment</Label>
                    <Input
                      id="job-increment"
                      type="number"
                      value={settings.jobSequence.increment}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          jobSequence: { ...settings.jobSequence, increment: parseInt(e.target.value) }
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="job-padding">Number Padding</Label>
                    <Input
                      id="job-padding"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.jobSequence.padding}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          jobSequence: { ...settings.jobSequence, padding: parseInt(e.target.value) }
                        })
                      }
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="job-format">Number Format</Label>
                  <Input
                    id="job-format"
                    value={settings.jobSequence.format}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        jobSequence: { ...settings.jobSequence, format: e.target.value }
                      })
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Preview: {settings.jobSequence.format
                      .replace('{YYYY}', '2024')
                      .replace('{MM}', '01')
                      .replace('{####}', '1000'.padStart(settings.jobSequence.padding, '0'))
                    }
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="job-reset">Reset Frequency</Label>
                  <Select
                    value={settings.jobSequence.resetFrequency}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        jobSequence: { ...settings.jobSequence, resetFrequency: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEVER">Never</SelectItem>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Format Tokens Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formatTokens.map((token) => (
                    <div key={token.token} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <code className="text-sm font-mono">{token.token}</code>
                      <span className="text-sm text-gray-600">{token.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Similar tabs for quotes, invoices, receipts... */}
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

// Category 15: Expense Management Modal
export function ExpenseManagementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    categories: [
      { id: 1, name: 'Travel & Transportation', budget: 5000, color: '#3b82f6' },
      { id: 2, name: 'Parts & Materials', budget: 10000, color: '#10b981' },
      { id: 3, name: 'Tools & Equipment', budget: 3000, color: '#f59e0b' },
      { id: 4, name: 'Marketing & Advertising', budget: 2000, color: '#ef4444' }
    ],
    budgetControls: {
      enabled: true,
      warningThreshold: 80, // percentage
      hardLimit: true,
      monthlyReset: true
    },
    approvalWorkflows: {
      enabled: true,
      thresholds: [
        { amount: 100, approver: 'MANAGER' },
        { amount: 500, approver: 'DEPARTMENT_HEAD' },
        { amount: 1000, approver: 'FINANCE_DIRECTOR' }
      ]
    },
    expenseReporting: {
      requiredReceipts: true,
      autoMileageCalculation: true,
      currencyConversion: true,
      taxDeductibleTracking: true
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Expense Management Configuration
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Categories & Budget</TabsTrigger>
            <TabsTrigger value="approvals">Approval Workflows</TabsTrigger>
            <TabsTrigger value="reporting">Reporting Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Expense Categories
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Category
                  </Button>
                </CardTitle>
                <CardDescription>Configure expense categories and budgets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <Label>Category Name</Label>
                        <Input value={category.name} readOnly />
                      </div>
                      <div>
                        <Label>Monthly Budget ($)</Label>
                        <Input
                          type="number"
                          value={category.budget}
                          onChange={(e) => {
                            const updatedCategories = settings.categories.map(c =>
                              c.id === category.id ? { ...c, budget: parseInt(e.target.value) } : c
                            );
                            setSettings({ ...settings, categories: updatedCategories });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={category.color}
                            onChange={(e) => {
                              const updatedCategories = settings.categories.map(c =>
                                c.id === category.id ? { ...c, color: e.target.value } : c
                              );
                              setSettings({ ...settings, categories: updatedCategories });
                            }}
                            className="w-16"
                          />
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Budget Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="budget-enabled">Enable Budget Controls</Label>
                      <Switch
                        id="budget-enabled"
                        checked={settings.budgetControls.enabled}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            budgetControls: { ...settings.budgetControls, enabled: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="warning-threshold">Warning Threshold (%)</Label>
                      <Input
                        id="warning-threshold"
                        type="number"
                        min="1"
                        max="100"
                        value={settings.budgetControls.warningThreshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            budgetControls: { ...settings.budgetControls, warningThreshold: parseInt(e.target.value) }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hard-limit">Enforce Hard Limit</Label>
                      <Switch
                        id="hard-limit"
                        checked={settings.budgetControls.hardLimit}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            budgetControls: { ...settings.budgetControls, hardLimit: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="monthly-reset">Monthly Budget Reset</Label>
                      <Switch
                        id="monthly-reset"
                        checked={settings.budgetControls.monthlyReset}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            budgetControls: { ...settings.budgetControls, monthlyReset: checked }
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
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

// Category 18: Quality Settings Modal
export function QualitySettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    sixSigmaSettings: {
      enabled: true,
      targetDPMO: 3.4,
      processCapability: { cp: 1.33, cpk: 1.33 },
      defectTracking: true,
      continuousImprovement: true
    },
    qualityCheckpoints: [
      { id: 1, name: 'Initial Diagnosis', required: true, automated: false },
      { id: 2, name: 'Parts Quality Check', required: true, automated: true },
      { id: 3, name: 'Pre-Repair Testing', required: true, automated: false },
      { id: 4, name: 'Post-Repair Testing', required: true, automated: false },
      { id: 5, name: 'Final Quality Inspection', required: true, automated: false }
    ],
    auditConfiguration: {
      frequency: 'MONTHLY',
      randomSampling: true,
      samplePercentage: 10,
      auditCriteria: [
        'Technical Accuracy',
        'Timeliness',
        'Customer Satisfaction',
        'Documentation Quality'
      ]
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Quality Settings Configuration
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="six-sigma" className="space-y-4">
          <TabsList>
            <TabsTrigger value="six-sigma">Six Sigma</TabsTrigger>
            <TabsTrigger value="checkpoints">Quality Checkpoints</TabsTrigger>
            <TabsTrigger value="audits">Audit Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="six-sigma" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Six Sigma Quality Standards</CardTitle>
                <CardDescription>Configure quality metrics and targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="six-sigma-enabled">Enable Six Sigma Quality Management</Label>
                  <Switch
                    id="six-sigma-enabled"
                    checked={settings.sixSigmaSettings.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        sixSigmaSettings: { ...settings.sixSigmaSettings, enabled: checked }
                      })
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target-dpmo">Target DPMO (Defects Per Million Opportunities)</Label>
                    <Input
                      id="target-dpmo"
                      type="number"
                      step="0.1"
                      value={settings.sixSigmaSettings.targetDPMO}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sixSigmaSettings: { ...settings.sixSigmaSettings, targetDPMO: parseFloat(e.target.value) }
                        })
                      }
                    />
                    <p className="text-sm text-gray-500 mt-1">Six Sigma standard: 3.4 DPMO</p>
                  </div>
                  <div>
                    <Label>Process Capability Targets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="cp-target" className="text-sm">Cp Target</Label>
                        <Input
                          id="cp-target"
                          type="number"
                          step="0.01"
                          value={settings.sixSigmaSettings.processCapability.cp}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              sixSigmaSettings: {
                                ...settings.sixSigmaSettings,
                                processCapability: { ...settings.sixSigmaSettings.processCapability, cp: parseFloat(e.target.value) }
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpk-target" className="text-sm">Cpk Target</Label>
                        <Input
                          id="cpk-target"
                          type="number"
                          step="0.01"
                          value={settings.sixSigmaSettings.processCapability.cpk}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              sixSigmaSettings: {
                                ...settings.sixSigmaSettings,
                                processCapability: { ...settings.sixSigmaSettings.processCapability, cpk: parseFloat(e.target.value) }
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="defect-tracking">Enable Defect Tracking</Label>
                  <Switch
                    id="defect-tracking"
                    checked={settings.sixSigmaSettings.defectTracking}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        sixSigmaSettings: { ...settings.sixSigmaSettings, defectTracking: checked }
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="continuous-improvement">Continuous Improvement Program</Label>
                  <Switch
                    id="continuous-improvement"
                    checked={settings.sixSigmaSettings.continuousImprovement}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        sixSigmaSettings: { ...settings.sixSigmaSettings, continuousImprovement: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="checkpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Checkpoints</CardTitle>
                <CardDescription>Configure mandatory quality checkpoints in the repair process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.qualityCheckpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${checkpoint.required ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <h4 className="font-medium">{checkpoint.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={checkpoint.required ? 'default' : 'secondary'}>
                              {checkpoint.required ? 'Required' : 'Optional'}
                            </Badge>
                            <Badge variant={checkpoint.automated ? 'outline' : 'secondary'}>
                              {checkpoint.automated ? 'Automated' : 'Manual'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Switch
                          checked={checkpoint.required}
                          onCheckedChange={(checked) => {
                            const updatedCheckpoints = settings.qualityCheckpoints.map(c =>
                              c.id === checkpoint.id ? { ...c, required: checked } : c
                            );
                            setSettings({ ...settings, qualityCheckpoints: updatedCheckpoints });
                          }}
                        />
                        <Switch
                          checked={checkpoint.automated}
                          onCheckedChange={(checked) => {
                            const updatedCheckpoints = settings.qualityCheckpoints.map(c =>
                              c.id === checkpoint.id ? { ...c, automated: checked } : c
                            );
                            setSettings({ ...settings, qualityCheckpoints: updatedCheckpoints });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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

// Category 19: Security Settings Modal
export function SecuritySettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    accessControls: {
      mfaRequired: true,
      sessionTimeout: 30, // minutes
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiry: 90 // days
      }
    },
    auditTrails: {
      enabled: true,
      retentionPeriod: 2555, // days (7 years)
      logLevel: 'DETAILED',
      realTimeMonitoring: true
    },
    dataEncryption: {
      encryptionAtRest: true,
      encryptionInTransit: true,
      keyRotationFrequency: 90, // days
      backupEncryption: true
    },
    complianceSettings: {
      gdprCompliant: true,
      ccpaCompliant: true,
      pciDssCompliant: true,
      dataRetentionPolicies: true
    }
  });

  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Security Settings Configuration
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="access-control" className="space-y-4">
          <TabsList>
            <TabsTrigger value="access-control">Access Control</TabsTrigger>
            <TabsTrigger value="audit-trails">Audit Trails</TabsTrigger>
            <TabsTrigger value="encryption">Data Encryption</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="access-control" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Access Controls & Authentication</CardTitle>
                <CardDescription>Configure security policies and authentication requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mfa-required">Multi-Factor Authentication (MFA)</Label>
                    <p className="text-sm text-gray-500">Require MFA for all users</p>
                  </div>
                  <Switch
                    id="mfa-required"
                    checked={settings.accessControls.mfaRequired}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        accessControls: { ...settings.accessControls, mfaRequired: checked }
                      })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="5"
                    max="480"
                    value={settings.accessControls.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        accessControls: { ...settings.accessControls, sessionTimeout: parseInt(e.target.value) }
                      })
                    }
                  />
                </div>
                
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Password Policy</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasswordPolicy(!showPasswordPolicy)}
                      >
                        {showPasswordPolicy ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {showPasswordPolicy && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-length">Minimum Length</Label>
                          <Input
                            id="min-length"
                            type="number"
                            min="8"
                            max="50"
                            value={settings.accessControls.passwordPolicy.minLength}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                accessControls: {
                                  ...settings.accessControls,
                                  passwordPolicy: { ...settings.accessControls.passwordPolicy, minLength: parseInt(e.target.value) }
                                }
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                          <Input
                            id="password-expiry"
                            type="number"
                            min="30"
                            max="365"
                            value={settings.accessControls.passwordPolicy.passwordExpiry}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                accessControls: {
                                  ...settings.accessControls,
                                  passwordPolicy: { ...settings.accessControls.passwordPolicy, passwordExpiry: parseInt(e.target.value) }
                                }
                              })
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require-uppercase">Require Uppercase</Label>
                          <Switch
                            id="require-uppercase"
                            checked={settings.accessControls.passwordPolicy.requireUppercase}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                accessControls: {
                                  ...settings.accessControls,
                                  passwordPolicy: { ...settings.accessControls.passwordPolicy, requireUppercase: checked }
                                }
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require-lowercase">Require Lowercase</Label>
                          <Switch
                            id="require-lowercase"
                            checked={settings.accessControls.passwordPolicy.requireLowercase}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                accessControls: {
                                  ...settings.accessControls,
                                  passwordPolicy: { ...settings.accessControls.passwordPolicy, requireLowercase: checked }
                                }
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require-numbers">Require Numbers</Label>
                          <Switch
                            id="require-numbers"
                            checked={settings.accessControls.passwordPolicy.requireNumbers}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                accessControls: {
                                  ...settings.accessControls,
                                  passwordPolicy: { ...settings.accessControls.passwordPolicy, requireNumbers: checked }
                                }
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require-special">Require Special Characters</Label>
                          <Switch
                            id="require-special"
                            checked={settings.accessControls.passwordPolicy.requireSpecialChars}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                accessControls: {
                                  ...settings.accessControls,
                                  passwordPolicy: { ...settings.accessControls.passwordPolicy, requireSpecialChars: checked }
                                }
                              })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audit-trails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trails & Monitoring</CardTitle>
                <CardDescription>Configure audit logging and monitoring settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-enabled">Enable Audit Trails</Label>
                    <p className="text-sm text-gray-500">Log all system activities and user actions</p>
                  </div>
                  <Switch
                    id="audit-enabled"
                    checked={settings.auditTrails.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        auditTrails: { ...settings.auditTrails, enabled: checked }
                      })
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retention-period">Retention Period (days)</Label>
                    <Input
                      id="retention-period"
                      type="number"
                      min="365"
                      max="3650"
                      value={settings.auditTrails.retentionPeriod}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          auditTrails: { ...settings.auditTrails, retentionPeriod: parseInt(e.target.value) }
                        })
                      }
                    />
                    <p className="text-sm text-gray-500 mt-1">Legal requirement: 7 years (2555 days)</p>
                  </div>
                  <div>
                    <Label htmlFor="log-level">Log Level</Label>
                    <Select
                      value={settings.auditTrails.logLevel}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          auditTrails: { ...settings.auditTrails, logLevel: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BASIC">Basic</SelectItem>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="DETAILED">Detailed</SelectItem>
                        <SelectItem value="VERBOSE">Verbose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="real-time-monitoring">Real-time Security Monitoring</Label>
                    <p className="text-sm text-gray-500">Monitor for suspicious activities and security threats</p>
                  </div>
                  <Switch
                    id="real-time-monitoring"
                    checked={settings.auditTrails.realTimeMonitoring}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        auditTrails: { ...settings.auditTrails, realTimeMonitoring: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="encryption" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Encryption Settings</CardTitle>
                <CardDescription>Configure encryption policies for data protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="encryption-at-rest">Encryption at Rest</Label>
                        <p className="text-sm text-gray-500">Encrypt data stored in databases</p>
                      </div>
                      <Switch
                        id="encryption-at-rest"
                        checked={settings.dataEncryption.encryptionAtRest}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            dataEncryption: { ...settings.dataEncryption, encryptionAtRest: checked }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="encryption-in-transit">Encryption in Transit</Label>
                        <p className="text-sm text-gray-500">Encrypt data during transmission</p>
                      </div>
                      <Switch
                        id="encryption-in-transit"
                        checked={settings.dataEncryption.encryptionInTransit}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            dataEncryption: { ...settings.dataEncryption, encryptionInTransit: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key-rotation">Key Rotation Frequency (days)</Label>
                      <Input
                        id="key-rotation"
                        type="number"
                        min="30"
                        max="365"
                        value={settings.dataEncryption.keyRotationFrequency}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            dataEncryption: { ...settings.dataEncryption, keyRotationFrequency: parseInt(e.target.value) }
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="backup-encryption">Backup Encryption</Label>
                        <p className="text-sm text-gray-500">Encrypt backup files</p>
                      </div>
                      <Switch
                        id="backup-encryption"
                        checked={settings.dataEncryption.backupEncryption}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            dataEncryption: { ...settings.dataEncryption, backupEncryption: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Settings</CardTitle>
                <CardDescription>Configure regulatory compliance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="gdpr-compliant">GDPR Compliance</Label>
                      <p className="text-sm text-gray-500">General Data Protection Regulation</p>
                    </div>
                    <Switch
                      id="gdpr-compliant"
                      checked={settings.complianceSettings.gdprCompliant}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          complianceSettings: { ...settings.complianceSettings, gdprCompliant: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ccpa-compliant">CCPA Compliance</Label>
                      <p className="text-sm text-gray-500">California Consumer Privacy Act</p>
                    </div>
                    <Switch
                      id="ccpa-compliant"
                      checked={settings.complianceSettings.ccpaCompliant}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          complianceSettings: { ...settings.complianceSettings, ccpaCompliant: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pci-dss-compliant">PCI DSS Compliance</Label>
                      <p className="text-sm text-gray-500">Payment Card Industry Data Security</p>
                    </div>
                    <Switch
                      id="pci-dss-compliant"
                      checked={settings.complianceSettings.pciDssCompliant}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          complianceSettings: { ...settings.complianceSettings, pciDssCompliant: checked }
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-retention-policies">Data Retention Policies</Label>
                      <p className="text-sm text-gray-500">Automated data lifecycle management</p>
                    </div>
                    <Switch
                      id="data-retention-policies"
                      checked={settings.complianceSettings.dataRetentionPolicies}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          complianceSettings: { ...settings.complianceSettings, dataRetentionPolicies: checked }
                        })
                      }
                    />
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

// Category 20: Integration Settings Modal
export function IntegrationSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    apiSettings: {
      rateLimiting: { enabled: true, requestsPerHour: 1000 },
      authentication: { apiKeyRequired: true, oauthEnabled: true },
      webhook: { enabled: true, retryAttempts: 3, timeout: 30 }
    },
    thirdPartyIntegrations: [
      { id: 1, name: 'Stripe Payment Gateway', enabled: true, status: 'CONNECTED' },
      { id: 2, name: 'QuickBooks Accounting', enabled: true, status: 'CONNECTED' },
      { id: 3, name: 'Mailchimp Marketing', enabled: false, status: 'NOT_CONFIGURED' },
      { id: 4, name: 'Zapier Automation', enabled: true, status: 'CONNECTED' }
    ],
    dataSynchronization: {
      enabled: true,
      frequency: 'REALTIME',
      conflictResolution: 'MANUAL_REVIEW',
      backupEnabled: true
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Integration Settings Configuration
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="api" className="space-y-4">
          <TabsList>
            <TabsTrigger value="api">API Settings</TabsTrigger>
            <TabsTrigger value="third-party">Third-party Integrations</TabsTrigger>
            <TabsTrigger value="sync">Data Synchronization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Configure API access and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Rate Limiting</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="rate-limiting">Enable Rate Limiting</Label>
                        <Switch
                          id="rate-limiting"
                          checked={settings.apiSettings.rateLimiting.enabled}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              apiSettings: {
                                ...settings.apiSettings,
                                rateLimiting: { ...settings.apiSettings.rateLimiting, enabled: checked }
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="requests-per-hour">Requests per Hour</Label>
                        <Input
                          id="requests-per-hour"
                          type="number"
                          value={settings.apiSettings.rateLimiting.requestsPerHour}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              apiSettings: {
                                ...settings.apiSettings,
                                rateLimiting: { ...settings.apiSettings.rateLimiting, requestsPerHour: parseInt(e.target.value) }
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Authentication</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="api-key-required">API Key Required</Label>
                        <Switch
                          id="api-key-required"
                          checked={settings.apiSettings.authentication.apiKeyRequired}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              apiSettings: {
                                ...settings.apiSettings,
                                authentication: { ...settings.apiSettings.authentication, apiKeyRequired: checked }
                              }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="oauth-enabled">OAuth 2.0 Enabled</Label>
                        <Switch
                          id="oauth-enabled"
                          checked={settings.apiSettings.authentication.oauthEnabled}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              apiSettings: {
                                ...settings.apiSettings,
                                authentication: { ...settings.apiSettings.authentication, oauthEnabled: checked }
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Webhooks</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="webhook-enabled">Enable Webhooks</Label>
                        <Switch
                          id="webhook-enabled"
                          checked={settings.apiSettings.webhook.enabled}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              apiSettings: {
                                ...settings.apiSettings,
                                webhook: { ...settings.apiSettings.webhook, enabled: checked }
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="retry-attempts">Retry Attempts</Label>
                        <Input
                          id="retry-attempts"
                          type="number"
                          min="0"
                          max="10"
                          value={settings.apiSettings.webhook.retryAttempts}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              apiSettings: {
                                ...settings.apiSettings,
                                webhook: { ...settings.apiSettings.webhook, retryAttempts: parseInt(e.target.value) }
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-timeout">Timeout (seconds)</Label>
                        <Input
                          id="webhook-timeout"
                          type="number"
                          min="5"
                          max="120"
                          value={settings.apiSettings.webhook.timeout}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              apiSettings: {
                                ...settings.apiSettings,
                                webhook: { ...settings.apiSettings.webhook, timeout: parseInt(e.target.value) }
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="third-party" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Third-party Integrations</CardTitle>
                <CardDescription>Manage connections to external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.thirdPartyIntegrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge 
                              variant={integration.status === 'CONNECTED' ? 'default' : integration.status === 'NOT_CONFIGURED' ? 'secondary' : 'destructive'}
                            >
                              {integration.status.replace('_', ' ').toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(checked) => {
                            const updatedIntegrations = settings.thirdPartyIntegrations.map(i =>
                              i.id === integration.id ? { ...i, enabled: checked } : i
                            );
                            setSettings({ ...settings, thirdPartyIntegrations: updatedIntegrations });
                          }}
                        />
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full flex items-center gap-2" variant="outline">
                  <Plus className="w-4 h-4" />
                  Add New Integration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Synchronization</CardTitle>
                <CardDescription>Configure how data is synchronized between systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sync-enabled">Enable Data Synchronization</Label>
                    <p className="text-sm text-gray-500">Automatically sync data with connected systems</p>
                  </div>
                  <Switch
                    id="sync-enabled"
                    checked={settings.dataSynchronization.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        dataSynchronization: { ...settings.dataSynchronization, enabled: checked }
                      })
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sync-frequency">Synchronization Frequency</Label>
                    <Select
                      value={settings.dataSynchronization.frequency}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          dataSynchronization: { ...settings.dataSynchronization, frequency: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REALTIME">Real-time</SelectItem>
                        <SelectItem value="EVERY_5_MINUTES">Every 5 minutes</SelectItem>
                        <SelectItem value="EVERY_15_MINUTES">Every 15 minutes</SelectItem>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="conflict-resolution">Conflict Resolution</Label>
                    <Select
                      value={settings.dataSynchronization.conflictResolution}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          dataSynchronization: { ...settings.dataSynchronization, conflictResolution: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUTO_RESOLVE">Auto Resolve (Last Modified Wins)</SelectItem>
                        <SelectItem value="MANUAL_REVIEW">Manual Review Required</SelectItem>
                        <SelectItem value="SOURCE_PRIORITY">Source System Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="backup-enabled">Backup Before Sync</Label>
                    <p className="text-sm text-gray-500">Create backup before synchronizing data</p>
                  </div>
                  <Switch
                    id="backup-enabled"
                    checked={settings.dataSynchronization.backupEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        dataSynchronization: { ...settings.dataSynchronization, backupEnabled: checked }
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

// Export all additional modals
export const AdditionalBusinessSettingsModals = {
  SequenceSettingsModal,
  ExpenseManagementModal,
  QualitySettingsModal,
  SecuritySettingsModal,
  IntegrationSettingsModal,
};