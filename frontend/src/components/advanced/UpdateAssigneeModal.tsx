'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog-only';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import {
  IconButton,
  Avatar,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  Box,
} from '@mui/material';
import {
  Close,
  Person,
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

interface UpdateAssigneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData?: {
    jobId: string;
    customer: string;
    currentAssignee: string;
    status: string;
    priority: string;
    dueDate: string;
  };
  onSubmit?: (assigneeData: AssigneeUpdateData) => void;
}

interface AssigneeUpdateData {
  newAssignee: string;
  reason: string;
  priority: string;
  dueDate: string;
  notifyOldAssignee: boolean;
  notifyNewAssignee: boolean;
  notifyCustomer: boolean;
  alerts: {
    mail: boolean;
    sms: boolean;
    inApp: boolean;
    whatsApp: boolean;
  };
}

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  skillLevel: string;
  workload: number;
  rating: number;
  avatar?: string;
}

export function UpdateAssigneeModal({ isOpen, onClose, jobData, onSubmit }: UpdateAssigneeModalProps) {
  const [assigneeData, setAssigneeData] = useState<AssigneeUpdateData>({
    newAssignee: '',
    reason: '',
    priority: jobData?.priority || 'Medium',
    dueDate: jobData?.dueDate || new Date().toISOString().split('T')[0],
    notifyOldAssignee: true,
    notifyNewAssignee: true,
    notifyCustomer: false,
    alerts: {
      mail: true,
      sms: false,
      inApp: true,
      whatsApp: false,
    },
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const technicians: Technician[] = [
    {
      id: '1',
      name: 'Azeez',
      email: 'azeez@repairx.com',
      phone: '+1 (555) 123-4567',
      department: 'Mobile Repair',
      skillLevel: 'Senior',
      workload: 75,
      rating: 4.8,
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '2',
      name: 'Mike Wilson',
      email: 'mike.wilson@repairx.com',
      phone: '+1 (555) 234-5678',
      department: 'Laptop Repair',
      skillLevel: 'Expert',
      workload: 60,
      rating: 4.9,
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@repairx.com',
      phone: '+1 (555) 345-6789',
      department: 'General Electronics',
      skillLevel: 'Senior',
      workload: 40,
      rating: 4.7,
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '4',
      name: 'Tom Smith',
      email: 'tom.smith@repairx.com',
      phone: '+1 (555) 456-7890',
      department: 'Computer Repair',
      skillLevel: 'Intermediate',
      workload: 85,
      rating: 4.5,
      avatar: '/api/placeholder/40/40',
    },
    {
      id: '5',
      name: 'Emma Davis',
      email: 'emma.davis@repairx.com',
      phone: '+1 (555) 567-8901',
      department: 'Tablet Repair',
      skillLevel: 'Senior',
      workload: 55,
      rating: 4.6,
      avatar: '/api/placeholder/40/40',
    },
  ];

  const reasons = [
    'Workload Redistribution',
    'Skill Set Match',
    'Availability Issue',
    'Customer Request',
    'Escalation Required',
    'Technical Expertise Needed',
    'Training Opportunity',
    'Other',
  ];

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!assigneeData.newAssignee) {
      newErrors.newAssignee = 'Please select a new assignee';
    }
    
    if (!assigneeData.reason) {
      newErrors.reason = 'Please provide a reason for reassignment';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit?.(assigneeData);
      onClose();
      // Reset form
      setAssigneeData({
        newAssignee: '',
        reason: '',
        priority: 'Medium',
        dueDate: new Date().toISOString().split('T')[0],
        notifyOldAssignee: true,
        notifyNewAssignee: true,
        notifyCustomer: false,
        alerts: { mail: true, sms: false, inApp: true, whatsApp: false },
      });
      setErrors({});
    }
  };

  const getSelectedTechnician = () => {
    return technicians.find(t => t.id === assigneeData.newAssignee);
  };

  const getWorkloadColor = (workload: number) => {
    if (workload < 50) return 'success';
    if (workload < 80) return 'warning';
    return 'error';
  };

  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel) {
      case 'Expert': return 'primary';
      case 'Senior': return 'success';
      case 'Intermediate': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Assignment />
              Update Assignee
            </div>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Information */}
          {jobData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Job:</Label>
                  <span className="ml-2 text-blue-600 font-semibold">{jobData.jobId}</span>
                </div>
                <div>
                  <Label className="font-medium">Status:</Label>
                  <Badge 
                    variant={jobData.status === 'Completed and Delivered' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {jobData.status}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Customer:</Label>
                  <span className="ml-2">{jobData.customer}</span>
                </div>
                <div>
                  <Label className="font-medium">Current Assignee:</Label>
                  <span className="ml-2">{jobData.currentAssignee}</span>
                </div>
              </div>
            </div>
          )}

          {/* New Assignee Selection */}
          <div className="space-y-4">
            <div>
              <Label>New Assignee <span className="text-red-500">*</span></Label>
              <Select 
                value={assigneeData.newAssignee} 
                onValueChange={(value) => setAssigneeData({ ...assigneeData, newAssignee: value })}
              >
                <SelectTrigger className={errors.newAssignee ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      <div className="flex items-center gap-3 py-2">
                        <Avatar className="w-8 h-8">
                          <img src={tech.avatar} alt={tech.name} />
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{tech.name}</div>
                          <div className="text-sm text-gray-500">{tech.department}</div>
                        </div>
                        <div className="flex gap-1">
                          <Chip 
                            label={tech.skillLevel} 
                            size="small" 
                            color={getSkillLevelColor(tech.skillLevel) as any}
                            variant="outlined"
                          />
                          <Chip 
                            label={`${tech.workload}%`} 
                            size="small" 
                            color={getWorkloadColor(tech.workload) as any}
                            variant="outlined"
                          />
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.newAssignee && (
                <div className="text-red-500 text-sm mt-1">{errors.newAssignee}</div>
              )}
            </div>

            {/* Selected Technician Info */}
            {getSelectedTechnician() && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <img src={getSelectedTechnician()?.avatar} alt={getSelectedTechnician()?.name} />
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{getSelectedTechnician()?.name}</h4>
                    <p className="text-gray-600">{getSelectedTechnician()?.department}</p>
                    <div className="flex gap-2 mt-2">
                      <Chip 
                        label={`${getSelectedTechnician()?.skillLevel} Level`} 
                        size="small" 
                        color={getSkillLevelColor(getSelectedTechnician()?.skillLevel || '') as any}
                      />
                      <Chip 
                        label={`${getSelectedTechnician()?.workload}% Workload`} 
                        size="small" 
                        color={getWorkloadColor(getSelectedTechnician()?.workload || 0) as any}
                      />
                      <Chip 
                        label={`⭐ ${getSelectedTechnician()?.rating}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Contact</div>
                    <div className="text-sm">{getSelectedTechnician()?.email}</div>
                    <div className="text-sm">{getSelectedTechnician()?.phone}</div>
                  </div>
                </div>
                
                {/* Workload Warning */}
                {getSelectedTechnician() && getSelectedTechnician()!.workload > 80 && (
                  <Alert severity="warning" className="mt-3">
                    <Warning />
                    High workload detected. This technician may be overloaded.
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Reassignment Details */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Label>Reason for Reassignment <span className="text-red-500">*</span></Label>
              <Select 
                value={assigneeData.reason} 
                onValueChange={(value) => setAssigneeData({ ...assigneeData, reason: value })}
              >
                <SelectTrigger className={errors.reason ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason && (
                <div className="text-red-500 text-sm mt-1">{errors.reason}</div>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Label>Priority</Label>
              <Select 
                value={assigneeData.priority} 
                onValueChange={(value) => setAssigneeData({ ...assigneeData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className="flex items-center gap-2">
                        {priority === 'Urgent' && <Warning className="w-4 h-4 text-red-500" />}
                        {priority === 'High' && <Warning className="w-4 h-4 text-orange-500" />}
                        {priority === 'Medium' && <Schedule className="w-4 h-4 text-blue-500" />}
                        {priority === 'Low' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {priority}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={assigneeData.dueDate}
                onChange={(e) => setAssigneeData({ 
                  ...assigneeData, 
                  dueDate: e.target.value 
                })}
              />
            </Grid>
          </Grid>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Notification Preferences</Label>
            
            <div className="space-y-3">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assigneeData.notifyOldAssignee}
                    onChange={(e) => setAssigneeData({
                      ...assigneeData,
                      notifyOldAssignee: e.target.checked
                    })}
                  />
                }
                label="Notify current assignee about reassignment"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assigneeData.notifyNewAssignee}
                    onChange={(e) => setAssigneeData({
                      ...assigneeData,
                      notifyNewAssignee: e.target.checked
                    })}
                  />
                }
                label="Notify new assignee about assignment"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assigneeData.notifyCustomer}
                    onChange={(e) => setAssigneeData({
                      ...assigneeData,
                      notifyCustomer: e.target.checked
                    })}
                  />
                }
                label="Notify customer about assignee change"
              />
            </div>
          </div>

          {/* Send Alert Options */}
          <div className="space-y-3">
            <Label>Send Alert Via</Label>
            <div className="flex gap-4">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assigneeData.alerts.mail}
                    onChange={(e) => setAssigneeData({
                      ...assigneeData,
                      alerts: { ...assigneeData.alerts, mail: e.target.checked }
                    })}
                  />
                }
                label="Mail"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assigneeData.alerts.sms}
                    onChange={(e) => setAssigneeData({
                      ...assigneeData,
                      alerts: { ...assigneeData.alerts, sms: e.target.checked }
                    })}
                  />
                }
                label="SMS"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assigneeData.alerts.inApp}
                    onChange={(e) => setAssigneeData({
                      ...assigneeData,
                      alerts: { ...assigneeData.alerts, inApp: e.target.checked }
                    })}
                  />
                }
                label="In App"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assigneeData.alerts.whatsApp}
                    onChange={(e) => setAssigneeData({
                      ...assigneeData,
                      alerts: { ...assigneeData.alerts, whatsApp: e.target.checked }
                    })}
                  />
                }
                label="WhatsApp"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Assignee
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}