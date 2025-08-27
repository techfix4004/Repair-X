'use client';

import React, { useState, useRef } from 'react';
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
  Tooltip,
  Chip,
  FormControlLabel,
  Checkbox,
  Box,
  Divider,
} from '@mui/material';
import {
  Close,
  Undo,
  Redo,
  FormatBold,
  FormatItalic,
  StrikethroughS,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  MoreHoriz,
  CloudUpload,
  AttachFile,
} from '@mui/icons-material';

interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData?: {
    jobId: string;
    customer: string;
    assignee: string;
    status: string;
  };
  onSubmit?: (commentData: CommentData) => void;
}

interface CommentData {
  comment: string;
  savedResponses?: string[];
  fileAttachments?: File[];
  alerts: {
    mail: boolean;
    sms: boolean;
    inApp: boolean;
    whatsApp: boolean;
  };
}

export function AddCommentModal({ isOpen, onClose, jobData, onSubmit }: AddCommentModalProps) {
  const [comment, setComment] = useState('');
  const [selectedResponse, setSelectedResponse] = useState('');
  const [alerts, setAlerts] = useState({
    mail: false,
    sms: false,
    inApp: false,
    whatsApp: false,
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedResponses = [
    'Thank you for your inquiry',
    'Your repair is in progress',
    'Parts have arrived',
    'Quality check completed',
    'Ready for pickup',
    'Custom response...'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp', 'application/pdf'];
    const maxSize = 20 * 1024 * 1024; // 20MB
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File size must be less than 20MB`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const commentData: CommentData = {
      comment,
      savedResponses: selectedResponse ? [selectedResponse] : [],
      fileAttachments: attachments,
      alerts,
    };
    
    onSubmit?.(commentData);
    
    // Reset form
    setComment('');
    setSelectedResponse('');
    setAttachments([]);
    setAlerts({ mail: false, sms: false, inApp: false, whatsApp: false });
    onClose();
  };

  const formatText = (format: string) => {
    // Basic text formatting implementation
    const textArea = document.getElementById('comment-textarea') as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const selectedText = comment.substring(start, end);
      
      let formattedText = '';
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'underline':
          formattedText = `__${selectedText}__`;
          break;
        case 'strikethrough':
          formattedText = `~~${selectedText}~~`;
          break;
        default:
          formattedText = selectedText;
      }
      
      const newComment = comment.substring(0, start) + formattedText + comment.substring(end);
      setComment(newComment);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Comment
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

          {/* Saved Responses */}
          <div className="space-y-2">
            <Label>Saved Responses</Label>
            <Select value={selectedResponse} onValueChange={setSelectedResponse}>
              <SelectTrigger>
                <SelectValue placeholder="Select a saved response" />
              </SelectTrigger>
              <SelectContent>
                {savedResponses.map((response, index) => (
                  <SelectItem key={index} value={response}>
                    {response}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment Text Editor */}
          <div className="space-y-2">
            <Label>Comment <span className="text-red-500">*</span></Label>
            
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border rounded-t-md bg-gray-50">
              <Tooltip title="Undo">
                <IconButton size="small">
                  <Undo fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Redo">
                <IconButton size="small">
                  <Redo fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Select defaultValue="normal-text">
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal-text">Normal text</SelectItem>
                  <SelectItem value="heading">Heading</SelectItem>
                  <SelectItem value="subheading">Subheading</SelectItem>
                </SelectContent>
              </Select>

              <Divider orientation="vertical" flexItem />

              <Tooltip title="Bold">
                <IconButton size="small" onClick={() => formatText('bold')}>
                  <FormatBold fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Italic">
                <IconButton size="small" onClick={() => formatText('italic')}>
                  <FormatItalic fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Strikethrough">
                <IconButton size="small" onClick={() => formatText('strikethrough')}>
                  <StrikethroughS fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Underline">
                <IconButton size="small" onClick={() => formatText('underline')}>
                  <FormatUnderlined fontSize="small" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem />

              <Tooltip title="Align Left">
                <IconButton size="small">
                  <FormatAlignLeft fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Align Center">
                <IconButton size="small">
                  <FormatAlignCenter fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="More options">
                <IconButton size="small">
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>

            <Textarea
              id="comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type text here"
              className="min-h-32 border-t-0 rounded-t-none focus:ring-0"
              rows={6}
            />
            <div className="text-sm text-gray-500">
              Max Allowed Characters 50000
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload className="mx-auto h-12 w-12 text-blue-400 mb-2" />
              <p className="text-blue-600 font-medium">Take A Photo With Your Camera Or Choose A File From Your Device</p>
              <p className="text-sm text-gray-500 mt-1">
                JPEG, PNG, BMP, WEBP, AND PDF FILES – MAX SIZE: 20MB / FILE
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.bmp,.webp,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Attached Files ({attachments.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => removeAttachment(index)}
                      icon={<AttachFile />}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send Alert */}
          <div className="space-y-3">
            <Label>Send Alert</Label>
            <div className="flex gap-4">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={alerts.mail}
                    onChange={(e) => setAlerts({ ...alerts, mail: e.target.checked })}
                  />
                }
                label="Mail"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={alerts.sms}
                    onChange={(e) => setAlerts({ ...alerts, sms: e.target.checked })}
                  />
                }
                label="SMS"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={alerts.inApp}
                    onChange={(e) => setAlerts({ ...alerts, inApp: e.target.checked })}
                  />
                }
                label="In App"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={alerts.whatsApp}
                    onChange={(e) => setAlerts({ ...alerts, whatsApp: e.target.checked })}
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
              disabled={!comment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Comment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}