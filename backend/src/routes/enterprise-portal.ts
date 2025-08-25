/**
 * Enterprise Customer Portal System
 * Advanced customer management for large accounts with dedicated features
 * Advanced Features from RepairX roadmap
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Enterprise Customer Schemas
const EnterpriseCustomerSchema = z.object({
  _id: z.string().optional(),
  _companyName: z.string().min(1, 'Company name is required'),
  _businessType: z.enum(['CORPORATION', 'LLC', 'PARTNERSHIP', 'GOVERNMENT', 'NON_PROFIT', 'EDUCATIONAL']),
  _industry: z.string().min(1, 'Industry is required'),
  _size: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']),
  _annualRevenue: z.number().optional(),
  _employeeCount: z.number().min(1),
  _headquarters: z.object({
    address: z.string(),
    _city: z.string(),
    _state: z.string(),
    _country: z.string(),
    _zipCode: z.string(),
    _phone: z.string(),
  }),
  _primaryContact: z.object({
    name: z.string().min(1),
    _title: z.string(),
    _email: z.string().email(),
    _phone: z.string(),
    _department: z.string().optional(),
  }),
  _accountManager: z.object({
    assignedSalesRep: z.string().optional(),
    _assignedAccountManager: z.string().optional(),
    _territoryManager: z.string().optional(),
  }),
  _contractDetails: z.object({
    contractType: z.enum(['STANDARD', 'PREMIUM', 'CUSTOM', 'GOVERNMENT']),
    _startDate: z.string(),
    _endDate: z.string().optional(),
    _autoRenewal: z.boolean().default(true),
    _paymentTerms: z.enum(['NET_30', 'NET_45', 'NET_60', 'PREPAID', 'QUARTERLY', 'ANNUAL']).default('NET_30'),
    _creditLimit: z.number().min(0).default(50000),
    _discountTier: z.number().min(0).max(50).default(0), // percentage
  }),
  _serviceAgreement: z.object({
    slaLevel: z.enum(['STANDARD', 'PREMIUM', 'PLATINUM', 'CUSTOM']).default('STANDARD'),
    _responseTime: z.object({
      critical: z.number().default(4), // hours
      _high: z.number().default(24),
      _medium: z.number().default(72),
      _low: z.number().default(168),
    }),
    _coverageHours: z.enum(['BUSINESS_HOURS', '24_7', 'EXTENDED', 'CUSTOM']).default('BUSINESS_HOURS'),
    _onSiteSupport: z.boolean().default(false),
    _dedicatedTechnicians: z.array(z.string()).default([]),
    _escalationContacts: z.array(z.object({
      level: z.number(),
      _name: z.string(),
      _email: z.string().email(),
      _phone: z.string(),
    })).default([]),
  }),
  _preferences: z.object({
    communicationChannels: z.array(z.enum(['EMAIL', 'PHONE', 'SMS', 'PORTAL', 'SLACK'])).default(['EMAIL', 'PORTAL']),
    _reportingFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).default('MONTHLY'),
    _customBranding: z.boolean().default(false),
    _singleSignOn: z.boolean().default(false),
    _apiAccess: z.boolean().default(false),
    _dataExport: z.boolean().default(true),
  }),
  _billingInfo: z.object({
    billingContact: z.object({
      name: z.string(),
      _email: z.string().email(),
      _phone: z.string(),
      _department: z.string().default('Accounting'),
    }),
    _invoiceDelivery: z.enum(['EMAIL', 'PORTAL', 'MAIL', 'EDI']).default('EMAIL'),
    _consolidatedBilling: z.boolean().default(true),
    _purchaseOrderRequired: z.boolean().default(false),
    _taxExempt: z.boolean().default(false),
    _taxId: z.string().optional(),
  }),
  _status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL', 'PROSPECT']).default('PROSPECT'),
  _tenantId: z.string().optional(),
});

const EnterpriseBranchSchema = z.object({
  _id: z.string().optional(),
  _enterpriseCustomerId: z.string(),
  _branchName: z.string().min(1),
  _branchCode: z.string().min(1),
  _address: z.object({
    street: z.string(),
    _city: z.string(),
    _state: z.string(),
    _country: z.string(),
    _zipCode: z.string(),
  }),
  _contactInfo: z.object({
    phone: z.string(),
    _email: z.string().email(),
    _manager: z.string(),
  }),
  _operatingHours: z.object({
    timezone: z.string().default('UTC'),
    _hours: z.array(z.object({
      day: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
      _open: z.string(),
      _close: z.string(),
      _closed: z.boolean().default(false),
    })),
  }),
  _serviceTypes: z.array(z.string()).default([]),
  _deviceInventory: z.number().min(0).default(0),
  _isActive: z.boolean().default(true),
});

const EnterpriseTicketSchema = z.object({
  _id: z.string().optional(),
  _ticketNumber: z.string(),
  _enterpriseCustomerId: z.string(),
  _branchId: z.string().optional(),
  _title: z.string().min(1),
  _description: z.string().min(1),
  _category: z.enum([
    'DEVICE_REPAIR',
    'BULK_SERVICE',
    'MAINTENANCE_CONTRACT',
    'CONSULTATION',
    'EMERGENCY_SUPPORT',
    'TRAINING',
    'SOFTWARE_ISSUE',
    'HARDWARE_ISSUE',
    'NETWORK_ISSUE',
    'OTHER',
  ]),
  _priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  _severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  _status: z.enum([
    'OPEN',
    'IN_PROGRESS',
    'PENDING_CUSTOMER',
    'ESCALATED',
    'RESOLVED',
    'CLOSED',
    'CANCELLED',
  ]).default('OPEN'),
  _assignedTo: z.string().optional(),
  _createdBy: z.string(),
  _devices: z.array(z.object({
    deviceType: z.string(),
    _model: z.string(),
    _serialNumber: z.string().optional(),
    _assetTag: z.string().optional(),
    _quantity: z.number().min(1).default(1),
  })).default([]),
  _slaTarget: z.object({
    responseBy: z.string(),
    _resolveBy: z.string(),
  }).optional(),
  _estimatedCost: z.number().min(0).optional(),
  _actualCost: z.number().min(0).optional(),
  _attachments: z.array(z.string()).default([]),
  _workLog: z.array(z.object({
    timestamp: z.string(),
    _author: z.string(),
    _action: z.string(),
    _notes: z.string().optional(),
    _billableHours: z.number().min(0).optional(),
  })).default([]),
});

// Enterprise Customer Service
class EnterpriseCustomerService {
  private _enterpriseCustomers: Map<string, any> = new Map();
  private _branches: Map<string, any[]> = new Map();
  private _tickets: Map<string, any> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleCustomers = [
      {
        _id: 'ent-001',
        _companyName: 'TechCorp Solutions Inc.',
        _businessType: 'CORPORATION',
        _industry: 'Information Technology',
        _size: 'LARGE',
        _annualRevenue: 50000000,
        _employeeCount: 500,
        _headquarters: {
          address: '123 Corporate Blvd',
          _city: 'San Francisco',
          _state: 'CA',
          _country: 'US',
          _zipCode: '94105',
          _phone: '+1-555-123-4567',
        },
        _primaryContact: {
          name: 'John Smith',
          _title: 'IT Director',
          _email: 'john.smith@techcorp.com',
          _phone: '+1-555-123-4568',
          _department: 'Information Technology',
        },
        _accountManager: {
          assignedSalesRep: 'sales-001',
          _assignedAccountManager: 'am-001',
          _territoryManager: 'tm-001',
        },
        _contractDetails: {
          contractType: 'PREMIUM',
          _startDate: '2024-01-01T00:00:00Z',
          _endDate: '2024-12-31T23:59:59Z',
          _autoRenewal: true,
          _paymentTerms: 'NET_30',
          _creditLimit: 100000,
          _discountTier: 15,
        },
        _serviceAgreement: {
          slaLevel: 'PREMIUM',
          _responseTime: {
            critical: 2,
            _high: 8,
            _medium: 24,
            _low: 72,
          },
          _coverageHours: '24_7',
          _onSiteSupport: true,
          _dedicatedTechnicians: ['tech-001', 'tech-002'],
          _escalationContacts: [
            {
              level: 1,
              _name: 'Sarah Johnson',
              _email: 'sarah.johnson@techcorp.com',
              _phone: '+1-555-123-4569',
            },
            {
              _level: 2,
              _name: 'Michael Davis',
              _email: 'michael.davis@techcorp.com',
              _phone: '+1-555-123-4570',
            },
          ],
        },
        _preferences: {
          communicationChannels: ['EMAIL', 'PORTAL', 'PHONE'],
          _reportingFrequency: 'WEEKLY',
          _customBranding: true,
          _singleSignOn: true,
          _apiAccess: true,
          _dataExport: true,
        },
        _billingInfo: {
          billingContact: {
            name: 'Alice Chen',
            _email: 'alice.chen@techcorp.com',
            _phone: '+1-555-123-4571',
            _department: 'Finance',
          },
          _invoiceDelivery: 'PORTAL',
          _consolidatedBilling: true,
          _purchaseOrderRequired: true,
          _taxExempt: false,
        },
        _status: 'ACTIVE',
        _createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    const sampleBranches = [
      {
        _id: 'branch-001',
        _enterpriseCustomerId: 'ent-001',
        _branchName: 'TechCorp HQ',
        _branchCode: 'TC-HQ-01',
        _address: {
          street: '123 Corporate Blvd',
          _city: 'San Francisco',
          _state: 'CA',
          _country: 'US',
          _zipCode: '94105',
        },
        _contactInfo: {
          phone: '+1-555-123-4567',
          _email: 'hq@techcorp.com',
          _manager: 'John Smith',
        },
        _operatingHours: {
          timezone: 'America/Los_Angeles',
          _hours: [
            { day: 'MON', _open: '08:00', _close: '18:00', _closed: false },
            { _day: 'TUE', _open: '08:00', _close: '18:00', _closed: false },
            { _day: 'WED', _open: '08:00', _close: '18:00', _closed: false },
            { _day: 'THU', _open: '08:00', _close: '18:00', _closed: false },
            { _day: 'FRI', _open: '08:00', _close: '17:00', _closed: false },
            { _day: 'SAT', _open: '09:00', _close: '13:00', _closed: false },
            { _day: 'SUN', _open: '00:00', _close: '00:00', _closed: true },
          ],
        },
        _serviceTypes: ['DEVICE_REPAIR', 'BULK_SERVICE', 'EMERGENCY_SUPPORT'],
        _deviceInventory: 250,
        _isActive: true,
      },
      {
        _id: 'branch-002',
        _enterpriseCustomerId: 'ent-001',
        _branchName: 'TechCorp East Coast',
        _branchCode: 'TC-EC-01',
        _address: {
          street: '456 Business Ave',
          _city: 'New York',
          _state: 'NY',
          _country: 'US',
          _zipCode: '10001',
        },
        _contactInfo: {
          phone: '+1-555-987-6543',
          _email: 'eastcoast@techcorp.com',
          _manager: 'Sarah Johnson',
        },
        _operatingHours: {
          timezone: 'America/New_York',
          _hours: [
            { day: 'MON', _open: '07:00', _close: '19:00', _closed: false },
            { _day: 'TUE', _open: '07:00', _close: '19:00', _closed: false },
            { _day: 'WED', _open: '07:00', _close: '19:00', _closed: false },
            { _day: 'THU', _open: '07:00', _close: '19:00', _closed: false },
            { _day: 'FRI', _open: '07:00', _close: '18:00', _closed: false },
            { _day: 'SAT', _open: '00:00', _close: '00:00', _closed: true },
            { _day: 'SUN', _open: '00:00', _close: '00:00', _closed: true },
          ],
        },
        _serviceTypes: ['DEVICE_REPAIR', 'CONSULTATION'],
        _deviceInventory: 180,
        _isActive: true,
      },
    ];

    const sampleTickets = [
      {
        _id: 'ticket-001',
        _ticketNumber: 'TC-2024-001',
        _enterpriseCustomerId: 'ent-001',
        _branchId: 'branch-001',
        _title: 'Bulk laptop repairs needed urgently',
        _description: 'We have 25 laptops that need screen replacements and general maintenance before our quarterly meeting next week.',
        _category: 'BULK_SERVICE',
        _priority: 'HIGH',
        _severity: 'HIGH',
        _status: 'IN_PROGRESS',
        _assignedTo: 'tech-001',
        _createdBy: 'john.smith@techcorp.com',
        _devices: [
          {
            deviceType: 'Laptop',
            _model: 'Dell Latitude 5520',
            _serialNumber: 'DL5520-001',
            _assetTag: 'TC-LAP-001',
            _quantity: 15,
          },
          {
            _deviceType: 'Laptop',
            _model: 'HP EliteBook 850',
            _serialNumber: 'HE850-001',
            _assetTag: 'TC-LAP-002',
            _quantity: 10,
          },
        ],
        _slaTarget: {
          responseBy: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
          _resolveBy: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
        },
        _estimatedCost: 3750,
        _actualCost: 3200,
        _workLog: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            _author: 'tech-001',
            _action: 'STARTED_WORK',
            _notes: 'Received devices and started diagnostic evaluation',
            _billableHours: 2,
          },
          {
            _timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            _author: 'tech-001',
            _action: 'PROGRESS_UPDATE',
            _notes: 'Completed screen replacements on 10 Dell laptops, remaining 15 in progress',
            _billableHours: 6,
          },
        ],
        _createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

    sampleCustomers.forEach((_customer: unknown) => {
      this.enterpriseCustomers.set(customer.id, customer);
    });

    sampleBranches.forEach((_branch: unknown) => {
      const customerBranches = this.branches.get(branch.enterpriseCustomerId) || [];
      customerBranches.push(branch);
      this.branches.set(branch.enterpriseCustomerId, customerBranches);
    });

    sampleTickets.forEach((_ticket: unknown) => {
      this.tickets.set(ticket.id, ticket);
    });
  }

  // Enterprise Customer Management
  async getAllEnterpriseCustomers(filters?: { status?: string; size?: string; industry?: string }): Promise<any[]> {
    let customers = Array.from(this.enterpriseCustomers.values());

    if (filters) {
      if (filters.status) {
        customers = customers.filter((_customer: unknown) => customer.status === filters.status);
      }
      if (filters.size) {
        customers = customers.filter((_customer: unknown) => customer.size === filters.size);
      }
      if (filters.industry) {
        customers = customers.filter((_customer: unknown) => 
          customer.industry.toLowerCase().includes(filters.industry!.toLowerCase())
        );
      }
    }

    return customers.sort((a, b) => b.annualRevenue - a.annualRevenue);
  }

  async getEnterpriseCustomer(_customerId: string): Promise<any | null> {
    return this.enterpriseCustomers.get(customerId) || null;
  }

  async createEnterpriseCustomer(_customerData: unknown): Promise<any> {
    const validated = EnterpriseCustomerSchema.parse(customerData);
    const id = validated.id || `ent-${Date.now()}`;
    
    const customer = { 
      ...validated, 
      id, 
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };
    
    this.enterpriseCustomers.set(id, customer);
    
    return customer;
  }

  async updateEnterpriseCustomer(_customerId: string, _updateData: unknown): Promise<any> {
    const existingCustomer = this.enterpriseCustomers.get(customerId);
    if (!existingCustomer) {
      throw new Error('Enterprise customer not found');
    }

    const updated = { 
      ...existingCustomer, 
      ...updateData, 
      _updatedAt: new Date().toISOString() 
    };
    
    const validated = EnterpriseCustomerSchema.parse(updated);
    this.enterpriseCustomers.set(customerId, validated);
    
    return validated;
  }

  // Branch Management
  async getCustomerBranches(_customerId: string): Promise<any[]> {
    return this.branches.get(customerId) || [];
  }

  async createBranch(_branchData: unknown): Promise<any> {
    const validated = EnterpriseBranchSchema.parse(branchData);
    const id = validated.id || `branch-${Date.now()}`;
    
    const branch = { 
      ...validated, 
      id, 
      _createdAt: new Date().toISOString() 
    };
    
    const customerBranches = this.branches.get(validated.enterpriseCustomerId) || [];
    customerBranches.push(branch);
    this.branches.set(validated.enterpriseCustomerId, customerBranches);
    
    return branch;
  }

  // Ticket Management
  async getCustomerTickets(_customerId: string, _filters?: { 
    _status?: string; 
    _priority?: string; 
    _branchId?: string;
    _category?: string;
  }): Promise<any[]> {
    let tickets = Array.from(this.tickets.values()).filter(
      ticket => ticket.enterpriseCustomerId === customerId
    );

    if (filters) {
      if (filters.status) {
        tickets = tickets.filter((_ticket: unknown) => ticket.status === filters.status);
      }
      if (filters.priority) {
        tickets = tickets.filter((_ticket: unknown) => ticket.priority === filters.priority);
      }
      if (filters.branchId) {
        tickets = tickets.filter((_ticket: unknown) => ticket.branchId === filters.branchId);
      }
      if (filters.category) {
        tickets = tickets.filter((_ticket: unknown) => ticket.category === filters.category);
      }
    }

    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTicket(_ticketData: unknown): Promise<any> {
    const validated = EnterpriseTicketSchema.parse(ticketData);
    const id = validated.id || `ticket-${Date.now()}`;
    
    // Generate ticket number
    const customer = this.enterpriseCustomers.get(validated.enterpriseCustomerId);
    const customerCode = customer?.companyName.substring(0, 2).toUpperCase() || 'ENT';
    const ticketNumber = `${customerCode}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const ticket = { 
      ...validated, 
      id,
      ticketNumber,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };
    
    this.tickets.set(id, ticket);
    
    return ticket;
  }

  async updateTicket(_ticketId: string, _updateData: unknown): Promise<any> {
    const existingTicket = this.tickets.get(ticketId);
    if (!existingTicket) {
      throw new Error('Ticket not found');
    }

    const updated = { 
      ...existingTicket, 
      ...updateData, 
      _updatedAt: new Date().toISOString() 
    };
    
    this.tickets.set(ticketId, updated);
    return updated;
  }

  // Analytics
  async getCustomerAnalytics(_customerId: string): Promise<any> {
    const customer = this.enterpriseCustomers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const branches = this.branches.get(customerId) || [];
    const tickets = Array.from(this.tickets.values()).filter(
      ticket => ticket.enterpriseCustomerId === customerId
    );

    const analytics = {
      _customer: {
        name: customer.companyName,
        _contractValue: customer.contractDetails.creditLimit,
        _discountTier: customer.contractDetails.discountTier,
        _employeeCount: customer.employeeCount,
      },
      _branches: {
        total: branches.length,
        _active: branches.filter((b: unknown) => b.isActive).length,
        _totalDevices: branches.reduce((sum: unknown, _branch: unknown) => sum + branch.deviceInventory, 0),
      },
      _tickets: {
        total: tickets.length,
        _open: tickets.filter((t: unknown) => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length,
        _resolved: tickets.filter((t: unknown) => t.status === 'RESOLVED').length,
        _critical: tickets.filter((t: unknown) => t.priority === 'CRITICAL').length,
        _slaBreaches: tickets.filter((t: unknown) => 
          t.slaTarget && new Date(t.slaTarget.resolveBy) < new Date() && 
          !['RESOLVED', 'CLOSED'].includes(t.status)
        ).length,
      },
      _costs: {
        _totalEstimated: tickets.reduce((sum: unknown, _ticket: unknown) => sum + (ticket.estimatedCost || 0), 0),
        _totalActual: tickets.reduce((sum: unknown, _ticket: unknown) => sum + (ticket.actualCost || 0), 0),
        _averageTicketValue: tickets.length > 0 
          ? tickets.reduce((sum: unknown, _ticket: unknown) => sum + (ticket.actualCost || 0), 0) / tickets._length
          : 0,
      },
      _slaPerformance: this.calculateSLAPerformance(tickets),
    };

    return analytics;
  }

  private calculateSLAPerformance(_tickets: unknown[]): unknown {
    const slaTickets = tickets.filter((_t: unknown) => t.slaTarget);
    
    if (slaTickets.length === 0) {
      return { _responseRate: 0, _resolutionRate: 0, _averageResponseTime: 0 };
    }

    const responseOnTime = slaTickets.filter((t: unknown) => 
      t.workLog.length > 0 && 
      new Date(t.workLog[0].timestamp) <= new Date(t.slaTarget.responseBy)
    ).length;

    const resolvedOnTime = slaTickets.filter((_t: unknown) => 
      t.status === 'RESOLVED' && 
      new Date(t.updatedAt) <= new Date(t.slaTarget.resolveBy)
    ).length;

    return {
      _responseRate: Math.round((responseOnTime / slaTickets.length) * 100),
      _resolutionRate: Math.round((resolvedOnTime / slaTickets.length) * 100),
      _averageResponseTime: this.calculateAverageResponseTime(slaTickets),
    };
  }

  private calculateAverageResponseTime(_tickets: unknown[]): number {
    const responseTimes = tickets
      .filter((_t: unknown) => t.workLog.length > 0)
      .map((_t: unknown) => {
        const created = new Date(t.createdAt);
        const firstResponse = new Date(t.workLog[0].timestamp);
        return (firstResponse.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });

    return responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((_sum: unknown, _time: unknown) => sum + time, 0) / responseTimes.length)
      : 0;
  }

  async getPortalDashboard(_customerId: string): Promise<any> {
    const analytics = await this.getCustomerAnalytics(customerId);
    const recentTickets = await this.getCustomerTickets(customerId, { _status: 'OPEN' });
    const branches = await this.getCustomerBranches(customerId);

    return {
      analytics,
      _recentActivity: recentTickets.slice(0, 5),
      _branches: branches.slice(0, 10),
      _alerts: [
        ...(analytics.tickets.slaBreaches > 0 ? [{ 
          type: 'SLA_BREACH', 
          _message: `${analytics.tickets.slaBreaches} tickets are past SLA deadline`,
          _severity: 'HIGH' 
        }] : []),
        ...(analytics.tickets.critical > 0 ? [{ 
          _type: 'CRITICAL_TICKETS', 
          _message: `${analytics.tickets.critical} critical tickets need attention`,
          _severity: 'CRITICAL' 
        }] : []),
      ],
    };
  }
}

// Route Handlers
 
// eslint-disable-next-line max-lines-per-function
export async function enterprisePortalRoutes(_server: FastifyInstance): Promise<void> {
  const enterpriseService = new EnterpriseCustomerService();

  // Enterprise customer management
  server.get('/customers', async (request: FastifyRequest<{
    Querystring: { status?: string; size?: string; industry?: string }
  }>, reply: FastifyReply) => {
    try {
      const filters = request.query;
      const customers = await enterpriseService.getAllEnterpriseCustomers(filters);
      
      return reply.send({
        _success: true,
        _data: customers,
        _count: customers.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve enterprise customers',
        _error: error.message,
      });
    }
  });

  server.get('/customers/:customerId', async (request: FastifyRequest<{
    Params: { customerId: string }
  }>, reply: FastifyReply) => {
    try {
      const { customerId  } = (request.params as unknown);
      const customer = await enterpriseService.getEnterpriseCustomer(customerId);
      
      if (!customer) {
        return (reply as FastifyReply).status(404).send({
          _success: false,
          _message: 'Enterprise customer not found',
        });
      }
      
      return reply.send({
        _success: true,
        _data: customer,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve enterprise customer',
        _error: error.message,
      });
    }
  });

  server.post('/customers', async (request: FastifyRequest<{
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const customerData = request.body;
      const customer = await enterpriseService.createEnterpriseCustomer(customerData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: customer,
        _message: 'Enterprise customer created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create enterprise customer',
        _error: error.message,
      });
    }
  });

  // Branch management
  server.get('/customers/:customerId/branches', async (request: FastifyRequest<{
    Params: { customerId: string }
  }>, reply: FastifyReply) => {
    try {
      const { customerId  } = (request.params as unknown);
      const branches = await enterpriseService.getCustomerBranches(customerId);
      
      return reply.send({
        _success: true,
        _data: branches,
        _count: branches.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve branches',
        _error: error.message,
      });
    }
  });

  server.post('/customers/:customerId/branches', async (request: FastifyRequest<{
    Params: { customerId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { customerId  } = (request.params as unknown);
      const branchData = { ...(request.body as unknown), _enterpriseCustomerId: customerId };
      const branch = await enterpriseService.createBranch(branchData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: branch,
        _message: 'Branch created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create branch',
        _error: error.message,
      });
    }
  });

  // Ticket management
  server.get('/customers/:customerId/tickets', async (request: FastifyRequest<{
    Params: { customerId: string }
    Querystring: { status?: string; priority?: string; branchId?: string; category?: string }
  }>, reply: FastifyReply) => {
    try {
      const { customerId  } = (request.params as unknown);
      const filters = request.query;
      const tickets = await enterpriseService.getCustomerTickets(customerId, filters);
      
      return reply.send({
        _success: true,
        _data: tickets,
        _count: tickets.length,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve tickets',
        _error: error.message,
      });
    }
  });

  server.post('/customers/:customerId/tickets', async (request: FastifyRequest<{
    Params: { customerId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { customerId  } = (request.params as unknown);
      const ticketData = { ...(request.body as unknown), _enterpriseCustomerId: customerId };
      const ticket = await enterpriseService.createTicket(ticketData);
      
      return (reply as FastifyReply).status(201).send({
        _success: true,
        _data: ticket,
        _message: 'Ticket created successfully',
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(400).send({
        _success: false,
        _message: 'Failed to create ticket',
        _error: error.message,
      });
    }
  });

  server.put('/tickets/:ticketId', async (request: FastifyRequest<{
    Params: { ticketId: string }
    Body: unknown
  }>, reply: FastifyReply) => {
    try {
      const { ticketId  } = (request.params as unknown);
      const updateData = request.body;
      
      const ticket = await enterpriseService.updateTicket(ticketId, updateData);
      
      return reply.send({
        _success: true,
        _data: ticket,
        _message: 'Ticket updated successfully',
      });
    } catch (_error: unknown) {
      const status = error.message === 'Ticket not found' ? _404 : 400;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to update ticket',
        _error: error.message,
      });
    }
  });

  // Analytics and dashboard
  server.get('/customers/:customerId/analytics', async (request: FastifyRequest<{
    Params: { customerId: string }
  }>, reply: FastifyReply) => {
    try {
      const { customerId  } = (request.params as unknown);
      const analytics = await enterpriseService.getCustomerAnalytics(customerId);
      
      return reply.send({
        _success: true,
        _data: analytics,
      });
    } catch (_error: unknown) {
      const status = error.message === 'Customer not found' ? _404 : 500;
      return (reply as FastifyReply).status(status).send({
        _success: false,
        _message: 'Failed to retrieve analytics',
        _error: error.message,
      });
    }
  });

  server.get('/customers/:customerId/dashboard', async (request: FastifyRequest<{
    Params: { customerId: string }
  }>, reply: FastifyReply) => {
    try {
      const { customerId  } = (request.params as unknown);
      const dashboard = await enterpriseService.getPortalDashboard(customerId);
      
      return reply.send({
        _success: true,
        _data: dashboard,
      });
    } catch (_error: unknown) {
      return (reply as FastifyReply).status(500).send({
        _success: false,
        _message: 'Failed to retrieve dashboard',
        _error: error.message,
      });
    }
  });

  // Reference data
  server.get('/reference/business-types', async (request: FastifyRequest, reply: FastifyReply) => {
    const businessTypes = [
      { _id: 'CORPORATION', _name: 'Corporation', _description: 'Public or private corporation' },
      { _id: 'LLC', _name: 'Limited Liability Company', _description: 'LLC business structure' },
      { _id: 'PARTNERSHIP', _name: 'Partnership', _description: 'Business partnership' },
      { _id: 'GOVERNMENT', _name: 'Government', _description: 'Government entity' },
      { _id: 'NON_PROFIT', _name: 'Non-Profit', _description: 'Non-profit organization' },
      { _id: 'EDUCATIONAL', _name: 'Educational', _description: 'Educational institution' },
    ];

    return reply.send({
      _success: true,
      _data: businessTypes,
    });
  });

  server.get('/reference/sla-levels', async (request: FastifyRequest, reply: FastifyReply) => {
    const slaLevels = [
      {
        _id: 'STANDARD',
        _name: 'Standard SLA',
        _description: 'Standard support level',
        _responseTime: { critical: 24, _high: 48, _medium: 72, _low: 168 },
        _coverage: 'BUSINESS_HOURS',
      },
      {
        _id: 'PREMIUM',
        _name: 'Premium SLA',
        _description: 'Enhanced support with faster response',
        _responseTime: { critical: 4, _high: 24, _medium: 48, _low: 72 },
        _coverage: 'EXTENDED',
      },
      {
        _id: 'PLATINUM',
        _name: 'Platinum SLA',
        _description: 'Highest level of support',
        _responseTime: { critical: 2, _high: 8, _medium: 24, _low: 48 },
        _coverage: '24_7',
      },
    ];

    return reply.send({
      _success: true,
      _data: slaLevels,
    });
  });
}

export default enterprisePortalRoutes;