/**
 * Enhanced Business Settings Manager - Complete Modal Integration
 * 
 * This component integrates all business settings modals and provides
 * a comprehensive management interface for all 20+ categories.
 */

'use client';

import React, { useState } from 'react';
import { BusinessManagementSystem } from './BusinessManagementSystem';
import { 
  AddressLocationSettingsModal, 
  ReminderSystemModal, 
  BusinessInformationModal 
} from './BusinessSettingsModals';
import {
  SequenceSettingsModal,
  ExpenseManagementModal,
  QualitySettingsModal,
  SecuritySettingsModal,
  IntegrationSettingsModal
} from './AdditionalBusinessSettingsModals';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  MapPin,
  Bell,
  Building,
  Hash,
  DollarSign,
  CheckCircle,
  Shield,
  Zap,
  Settings,
  Mail,
  MessageSquare,
  Users,
  Receipt,
  FileText,
  CreditCard
} from 'lucide-react';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  implementation: 'COMPLETE' | 'PARTIAL' | 'PLANNED';
  modalComponent?: React.ComponentType<{ isOpen: boolean; onClose: () => void }>;
}

const businessCategories: BusinessCategory[] = [
  {
    id: 'tax-settings',
    name: 'Tax Settings',
    description: 'GST/VAT/HST configuration and automated tax calculations',
    icon: Receipt,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'print-settings',
    name: 'Print Settings & Templates',
    description: 'Customizable job sheets, invoices, quotations, receipts',
    icon: FileText,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'workflow-configuration',
    name: 'Workflow Configuration',
    description: 'Visual business process designer with automation rules',
    icon: Settings,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'email-settings',
    name: 'Email Settings',
    description: 'SMTP configuration, automated templates, delivery tracking',
    icon: Mail,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'sms-settings',
    name: 'SMS Settings',
    description: 'SMS gateway integration, credit management, automated notifications',
    icon: MessageSquare,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'employee-management',
    name: 'Employee Management',
    description: 'Staff onboarding, role assignments, performance tracking',
    icon: Users,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'customer-database',
    name: 'Customer Database',
    description: 'CRM configuration, profile fields, data management',
    icon: Users,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'invoice-settings',
    name: 'Invoice Settings',
    description: 'Automated generation, compliance rules, numbering sequences',
    icon: Receipt,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'quotation-settings',
    name: 'Quotation Settings',
    description: 'Multi-approval workflows, terms, conversion rules',
    icon: FileText,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'payment-settings',
    name: 'Payment Settings',
    description: 'Gateway configuration, collection rules, reminder schedules',
    icon: CreditCard,
    priority: 'HIGH',
    implementation: 'COMPLETE'
  },
  {
    id: 'address-location-settings',
    name: 'Address/Location Settings',
    description: 'Service areas, territory management, geo-restrictions',
    icon: MapPin,
    priority: 'MEDIUM',
    implementation: 'COMPLETE',
    modalComponent: AddressLocationSettingsModal
  },
  {
    id: 'reminder-system',
    name: 'Reminder System',
    description: 'Automated follow-ups, escalation rules, communication schedules',
    icon: Bell,
    priority: 'MEDIUM',
    implementation: 'COMPLETE',
    modalComponent: ReminderSystemModal
  },
  {
    id: 'business-information',
    name: 'Business Information',
    description: 'Company profiles, contact details, branding settings',
    icon: Building,
    priority: 'MEDIUM',
    implementation: 'COMPLETE',
    modalComponent: BusinessInformationModal
  },
  {
    id: 'sequence-settings',
    name: 'Sequence Settings',
    description: 'Automated numbering for jobs, quotes, invoices with custom formats',
    icon: Hash,
    priority: 'MEDIUM',
    implementation: 'COMPLETE',
    modalComponent: SequenceSettingsModal
  },
  {
    id: 'expense-management',
    name: 'Expense Management',
    description: 'Category configuration, budget controls, approval workflows',
    icon: DollarSign,
    priority: 'MEDIUM',
    implementation: 'COMPLETE',
    modalComponent: ExpenseManagementModal
  },
  {
    id: 'parts-inventory-settings',
    name: 'Parts Inventory Settings',
    description: 'Stock management, supplier integration, reorder automation',
    icon: Settings,
    priority: 'MEDIUM',
    implementation: 'COMPLETE'
  },
  {
    id: 'outsourcing-settings',
    name: 'Outsourcing Settings',
    description: 'External provider network, commission rates, performance metrics',
    icon: Users,
    priority: 'LOW',
    implementation: 'PLANNED'
  },
  {
    id: 'quality-settings',
    name: 'Quality Settings',
    description: 'Six Sigma checkpoints, quality standards, audit configurations',
    icon: CheckCircle,
    priority: 'HIGH',
    implementation: 'COMPLETE',
    modalComponent: QualitySettingsModal
  },
  {
    id: 'security-settings',
    name: 'Security Settings',
    description: 'Access controls, audit trails, compliance configurations',
    icon: Shield,
    priority: 'HIGH',
    implementation: 'COMPLETE',
    modalComponent: SecuritySettingsModal
  },
  {
    id: 'integration-settings',
    name: 'Integration Settings',
    description: 'Third-party APIs, marketplace connections, data synchronization',
    icon: Zap,
    priority: 'MEDIUM',
    implementation: 'COMPLETE',
    modalComponent: IntegrationSettingsModal
  }
];

interface EnhancedBusinessSettingsProps {
  tenantId?: string;
}

export function EnhancedBusinessSettings({ tenantId = 'default' }: EnhancedBusinessSettingsProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (categoryId: string) => {
    setActiveModal(categoryId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const getImplementationColor = (implementation: string) => {
    switch (implementation) {
      case 'COMPLETE': return 'default';
      case 'PARTIAL': return 'secondary';
      case 'PLANNED': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Settings Management</h2>
          <p className="text-gray-600 mt-2">
            Configure all aspects of your repair business with our comprehensive 20+ category system
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default">{businessCategories.filter(c => c.implementation === 'COMPLETE').length} Complete</Badge>
          <Badge variant="secondary">{businessCategories.filter(c => c.implementation === 'PARTIAL').length} Partial</Badge>
          <Badge variant="outline">{businessCategories.filter(c => c.implementation === 'PLANNED').length} Planned</Badge>
        </div>
      </div>

      {/* Original Business Management System */}
      <BusinessManagementSystem tenantId={tenantId} />

      {/* Enhanced Category Grid */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">All Business Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={getImplementationColor(category.implementation) as 'default' | 'secondary' | 'outline'}
                            className="text-xs"
                          >
                            {category.implementation}
                          </Badge>
                          <span className={`text-xs font-medium ${getPriorityColor(category.priority)}`}>
                            {category.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => category.modalComponent && openModal(category.id)}
                    disabled={!category.modalComponent}
                  >
                    {category.modalComponent ? 'Configure' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Render Active Modal */}
      {businessCategories.map((category) => {
        const ModalComponent = category.modalComponent;
        if (!ModalComponent) return null;
        
        return (
          <ModalComponent
            key={category.id}
            isOpen={activeModal === category.id}
            onClose={closeModal}
          />
        );
      })}
    </div>
  );
}