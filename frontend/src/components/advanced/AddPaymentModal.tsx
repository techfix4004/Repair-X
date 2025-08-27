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
import { Textarea } from '../ui/textarea';
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
  Chip,
  FormControlLabel,
  Checkbox,
  Switch,
  Divider,
  Alert,
} from '@mui/material';
import {
  Close,
  Clear,
  CalendarToday,
  AttachMoney,
  Payment,
  CreditCard,
  AccountBalance,
  Smartphone,
} from '@mui/icons-material';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData?: {
    jobId: string;
    customer: string;
    assignee: string;
    status: string;
    payableAmount: number;
    remainingAmount: number;
  };
  onSubmit?: (paymentData: PaymentData) => void;
}

interface PaymentData {
  paymentMode: string;
  amount: number;
  status: string;
  assigneeName: string;
  paymentReceivedDate: string;
  isAdvancePayment: boolean;
  comment?: string;
  termsAndConditions?: string;
  alerts: {
    mail: boolean;
    sms: boolean;
    inApp: boolean;
    whatsApp: boolean;
  };
}

export function AddPaymentModal({ isOpen, onClose, jobData, onSubmit }: AddPaymentModalProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentMode: '',
    amount: 0,
    status: 'Completed and Delivered',
    assigneeName: 'Azeez',
    paymentReceivedDate: new Date().toISOString().split('T')[0],
    isAdvancePayment: false,
    comment: '',
    termsAndConditions: '',
    alerts: {
      mail: false,
      sms: false,
      inApp: false,
      whatsApp: false,
    },
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const paymentModes = [
    { value: 'cash', label: 'Cash', icon: <AttachMoney /> },
    { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard /> },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: <AccountBalance /> },
    { value: 'digital_wallet', label: 'Digital Wallet', icon: <Smartphone /> },
    { value: 'cheque', label: 'Cheque', icon: <Payment /> },
  ];

  const assignees = [
    'Azeez',
    'John Smith', 
    'Sarah Johnson',
    'Mike Wilson',
    'Emma Davis'
  ];

  const statusOptions = [
    'Pending',
    'Processing',
    'Completed and Delivered',
    'Failed',
    'Refunded'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!paymentData.paymentMode) {
      newErrors.paymentMode = 'Payment mode is required';
    }
    
    if (paymentData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (jobData && paymentData.amount > jobData.remainingAmount) {
      newErrors.amount = 'Amount cannot exceed remaining amount';
    }
    
    if (!paymentData.assigneeName) {
      newErrors.assigneeName = 'Assignee is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setPaymentData({ ...paymentData, amount });
    
    // Check if payment is complete
    if (jobData) {
      setIsPaymentComplete(amount === jobData.remainingAmount);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit?.(paymentData);
      onClose();
      // Reset form
      setPaymentData({
        paymentMode: '',
        amount: 0,
        status: 'Completed and Delivered',
        assigneeName: 'Azeez',
        paymentReceivedDate: new Date().toISOString().split('T')[0],
        isAdvancePayment: false,
        comment: '',
        termsAndConditions: '',
        alerts: { mail: false, sms: false, inApp: false, whatsApp: false },
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Payment
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
                  <Label className="font-medium">Assignee:</Label>
                  <span className="ml-2">{jobData.assignee}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount Info */}
          {jobData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Payable Amount:</Label>
                <div className="text-lg font-bold text-green-600">₹{jobData.payableAmount}</div>
              </div>
              <div>
                <Label className="font-medium">Remaining Amount:</Label>
                <div className="text-lg font-bold text-orange-600">₹{jobData.remainingAmount}</div>
              </div>
            </div>
          )}

          {/* Payment Mode */}
          <div className="space-y-2">
            <Label>Payment Mode <span className="text-red-500">*</span></Label>
            <Select 
              value={paymentData.paymentMode} 
              onValueChange={(value) => setPaymentData({ ...paymentData, paymentMode: value })}
            >
              <SelectTrigger className={errors.paymentMode ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select payment mode" />
                {paymentData.paymentMode && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentData({ ...paymentData, paymentMode: '' });
                    }}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                )}
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    <div className="flex items-center gap-2">
                      {mode.icon}
                      {mode.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMode && (
              <div className="text-red-500 text-sm">{errors.paymentMode}</div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                type="number"
                value={paymentData.amount || ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className={errors.amount ? 'border-red-500' : ''}
                min="0"
                step="0.01"
              />
              {paymentData.amount > 0 && (
                <IconButton
                  size="small"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setPaymentData({ ...paymentData, amount: 0 })}
                >
                  <Clear fontSize="small" />
                </IconButton>
              )}
            </div>
            {isPaymentComplete && (
              <Alert severity="success" className="text-sm">
                Payment Complete
              </Alert>
            )}
            {errors.amount && (
              <div className="text-red-500 text-sm">{errors.amount}</div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={paymentData.status} 
              onValueChange={(value) => setPaymentData({ ...paymentData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge 
                      variant={status === 'Completed and Delivered' ? 'default' : 'secondary'}
                    >
                      {status}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Name */}
          <div className="space-y-2">
            <Label>Assignee Name</Label>
            <Select 
              value={paymentData.assigneeName} 
              onValueChange={(value) => setPaymentData({ ...paymentData, assigneeName: value })}
            >
              <SelectTrigger className={errors.assigneeName ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigneeName && (
              <div className="text-red-500 text-sm">{errors.assigneeName}</div>
            )}
          </div>

          {/* Payment Received Date */}
          <div className="space-y-2">
            <Label>Payment Received Date</Label>
            <div className="relative">
              <Input
                type="date"
                value={paymentData.paymentReceivedDate}
                onChange={(e) => setPaymentData({ 
                  ...paymentData, 
                  paymentReceivedDate: e.target.value 
                })}
              />
              <CalendarToday className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Advance Payment Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={paymentData.isAdvancePayment}
              onChange={(e) => setPaymentData({ 
                ...paymentData, 
                isAdvancePayment: e.target.checked 
              })}
            />
            <Label>Advance Payment</Label>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea
              value={paymentData.comment}
              onChange={(e) => setPaymentData({ ...paymentData, comment: e.target.value })}
              placeholder="Type text here"
              rows={3}
            />
            <div className="text-sm text-gray-500">Max Allowed Characters 50000</div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <Label>Terms and Conditions</Label>
            <Textarea
              value={paymentData.termsAndConditions}
              onChange={(e) => setPaymentData({ 
                ...paymentData, 
                termsAndConditions: e.target.value 
              })}
              placeholder="Type text here"
              rows={3}
            />
          </div>

          {/* Send Alert */}
          <div className="space-y-3">
            <Label>Send Alert</Label>
            <div className="flex gap-4">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={paymentData.alerts.mail}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      alerts: { ...paymentData.alerts, mail: e.target.checked }
                    })}
                  />
                }
                label="Mail"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={paymentData.alerts.sms}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      alerts: { ...paymentData.alerts, sms: e.target.checked }
                    })}
                  />
                }
                label="SMS"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={paymentData.alerts.inApp}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      alerts: { ...paymentData.alerts, inApp: e.target.checked }
                    })}
                  />
                }
                label="In App"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={paymentData.alerts.whatsApp}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      alerts: { ...paymentData.alerts, whatsApp: e.target.checked }
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
              Add Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}