# RepairX Technical Specification - Business Management Features

## Database Schema Design

### Core Business Tables

#### 1. Job Sheets Management
```sql
-- Job sheets with complete lifecycle tracking
CREATE TABLE job_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    technician_id UUID REFERENCES employees(id),
    status job_status_enum NOT NULL DEFAULT 'CREATED',
    device_type VARCHAR(100),
    device_model VARCHAR(100),
    issue_description TEXT,
    diagnosis_notes TEXT,
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5)
);

-- Job status enum with 12-state workflow
CREATE TYPE job_status_enum AS ENUM (
    'CREATED',
    'IN_DIAGNOSIS', 
    'AWAITING_APPROVAL',
    'APPROVED',
    'IN_PROGRESS',
    'PARTS_ORDERED',
    'TESTING',
    'QUALITY_CHECK',
    'COMPLETED',
    'CUSTOMER_APPROVED',
    'DELIVERED',
    'CANCELLED'
);

-- Job state transitions audit trail
CREATE TABLE job_state_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES job_sheets(id),
    from_state job_status_enum,
    to_state job_status_enum NOT NULL,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    automated BOOLEAN DEFAULT FALSE
);
```

#### 2. Customer Relationship Management
```sql
-- Enhanced customer profiles with CRM capabilities
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    gstin VARCHAR(15), -- For GST compliance
    customer_type customer_type_enum DEFAULT 'INDIVIDUAL',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- Days
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TYPE customer_type_enum AS ENUM ('INDIVIDUAL', 'BUSINESS', 'ENTERPRISE');

-- Customer service history tracking
CREATE TABLE customer_service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    job_id UUID REFERENCES job_sheets(id),
    service_date DATE,
    device_type VARCHAR(100),
    service_type VARCHAR(100),
    amount_paid DECIMAL(10,2),
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    notes TEXT
);
```

#### 3. Financial Management
```sql
-- Quotations with approval workflow
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    job_id UUID REFERENCES job_sheets(id),
    customer_id UUID REFERENCES customers(id),
    version INTEGER DEFAULT 1,
    status quote_status_enum DEFAULT 'DRAFT',
    subtotal DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    valid_until DATE,
    terms_conditions TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE quote_status_enum AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- Invoices with GST compliance
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    job_id UUID REFERENCES job_sheets(id),
    customer_id UUID REFERENCES customers(id),
    quotation_id UUID REFERENCES quotations(id),
    status invoice_status_enum DEFAULT 'DRAFT',
    subtotal DECIMAL(10,2),
    gst_rate DECIMAL(5,2),
    gst_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2) DEFAULT 0,
    due_amount DECIMAL(10,2),
    due_date DATE,
    payment_terms INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE invoice_status_enum AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED');
```

#### 4. Inventory Management
```sql
-- Parts inventory with supplier integration
CREATE TABLE inventory_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(100) UNIQUE NOT NULL,
    part_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    supplier_id UUID REFERENCES suppliers(id),
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    quantity_on_hand INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    reorder_quantity INTEGER DEFAULT 50,
    location VARCHAR(100),
    barcode VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock movements tracking
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID REFERENCES inventory_parts(id),
    movement_type movement_type_enum,
    quantity INTEGER,
    reference_id UUID, -- Job ID, Purchase Order ID, etc.
    reference_type VARCHAR(50),
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE movement_type_enum AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER');
```

## API Endpoints Design

### 1. Job Management APIs
```typescript
// Job creation and lifecycle management
POST /api/jobs - Create new job
GET /api/jobs - List jobs with filters
GET /api/jobs/:id - Get job details
PUT /api/jobs/:id/status - Update job status
POST /api/jobs/:id/photos - Upload job photos
GET /api/jobs/:id/timeline - Get job state history

// Job workflow actions
POST /api/jobs/:id/diagnose - Complete diagnosis
POST /api/jobs/:id/approve - Customer approval
POST /api/jobs/:id/start-work - Begin repair work
POST /api/jobs/:id/complete - Mark job complete
POST /api/jobs/:id/deliver - Mark job delivered
POST /api/jobs/:id/cancel - Cancel job
```

### 2. Customer Management APIs
```typescript
// Customer CRUD operations
POST /api/customers - Create customer
GET /api/customers - List customers with search/filter
GET /api/customers/:id - Get customer details
PUT /api/customers/:id - Update customer
DELETE /api/customers/:id - Deactivate customer

// Customer service history
GET /api/customers/:id/jobs - Get customer job history
GET /api/customers/:id/invoices - Get customer invoices
GET /api/customers/:id/loyalty - Get loyalty points
POST /api/customers/:id/check-in - Self check-in system
```

### 3. Financial Management APIs
```typescript
// Quotation management
POST /api/quotations - Create quotation
GET /api/quotations - List quotations
PUT /api/quotations/:id/approve - Approve quotation
POST /api/quotations/:id/convert - Convert to invoice

// Invoice management
POST /api/invoices - Create invoice
GET /api/invoices - List invoices
POST /api/invoices/:id/payment - Record payment
GET /api/invoices/:id/pdf - Generate invoice PDF

// Tax calculations
POST /api/tax/calculate - Calculate tax for amount
GET /api/tax/rates - Get tax rates by location
```

## Business Logic Implementation

### 1. Job Workflow State Machine
```typescript
interface JobWorkflow {
  validateTransition(from: JobStatus, to: JobStatus): boolean;
  executeTransition(jobId: string, to: JobStatus, userId: string): Promise<void>;
  getNextPossibleStates(current: JobStatus): JobStatus[];
  triggerAutomatedActions(jobId: string, newStatus: JobStatus): Promise<void>;
}

class JobWorkflowService implements JobWorkflow {
  private validTransitions = new Map([
    ['CREATED', ['IN_DIAGNOSIS', 'CANCELLED']],
    ['IN_DIAGNOSIS', ['AWAITING_APPROVAL', 'CANCELLED']],
    ['AWAITING_APPROVAL', ['APPROVED', 'CANCELLED', 'IN_DIAGNOSIS']],
    ['APPROVED', ['IN_PROGRESS', 'PARTS_ORDERED']],
    ['IN_PROGRESS', ['TESTING', 'PARTS_ORDERED', 'CANCELLED']],
    ['PARTS_ORDERED', ['IN_PROGRESS', 'CANCELLED']],
    ['TESTING', ['QUALITY_CHECK', 'IN_PROGRESS']],
    ['QUALITY_CHECK', ['COMPLETED', 'TESTING']],
    ['COMPLETED', ['CUSTOMER_APPROVED', 'DELIVERED']],
    ['CUSTOMER_APPROVED', ['DELIVERED']],
    ['DELIVERED', []],
    ['CANCELLED', []]
  ]);

  async executeTransition(jobId: string, to: JobStatus, userId: string): Promise<void> {
    // 1. Validate transition
    // 2. Update job status
    // 3. Log transition in audit trail
    // 4. Trigger automated notifications
    // 5. Update business metrics
    // 6. Execute status-specific business logic
  }
}
```

### 2. Tax Calculation Engine
```typescript
interface TaxCalculator {
  calculateGST(amount: number, location: string): TaxBreakdown;
  calculateVAT(amount: number, location: string): TaxBreakdown;
  validateGSTIN(gstin: string): boolean;
  generateTaxReport(startDate: Date, endDate: Date): TaxReport;
}

class MultiJurisdictionTaxService implements TaxCalculator {
  async calculateGST(amount: number, location: string): Promise<TaxBreakdown> {
    // Implement GST calculation logic
    // CGST + SGST for intra-state
    // IGST for inter-state
    // Handle tax exemptions
  }

  async validateGSTIN(gstin: string): Promise<boolean> {
    // Validate GSTIN format
    // Optional: API call to GST portal for verification
  }
}
```

### 3. Communication Management
```typescript
interface CommunicationService {
  sendSMS(to: string, template: string, variables: Record<string, any>): Promise<void>;
  sendEmail(to: string, template: string, variables: Record<string, any>): Promise<void>;
  scheduleReminder(type: string, entityId: string, delay: number): Promise<void>;
  trackDelivery(messageId: string): Promise<DeliveryStatus>;
}

class AutomatedCommunicationService implements CommunicationService {
  async sendJobStatusUpdate(jobId: string, status: JobStatus): Promise<void> {
    // Get job and customer details
    // Select appropriate template
    // Send SMS and email notifications
    // Log communication history
  }
}
```

### 4. Business Settings Management
```typescript
interface BusinessSettingsService {
  getSettings(category: string): Promise<BusinessSettings>;
  updateSettings(category: string, settings: BusinessSettings): Promise<void>;
  validateSettings(category: string, settings: BusinessSettings): ValidationResult;
  getAvailableCategories(): string[];
}

const SETTINGS_CATEGORIES = [
  'TAX_SETTINGS',
  'INVOICE_SETTINGS', 
  'EMPLOYEE_MANAGEMENT',
  'CUSTOMER_DATABASE',
  'WORKFLOW_CONFIGURATION',
  'EMAIL_SETTINGS',
  'SMS_SETTINGS',
  'PAYMENT_SETTINGS',
  // ... 20+ categories as defined in roadmap
];
```

## Mobile Application Integration

### Technician Mobile Interface
```typescript
// Field operations API for mobile
GET /api/mobile/technician/jobs - Get assigned jobs
POST /api/mobile/technician/jobs/:id/start - Start job
POST /api/mobile/technician/jobs/:id/photos - Upload photos
POST /api/mobile/technician/jobs/:id/time - Log time entry
POST /api/mobile/technician/jobs/:id/parts - Record parts usage
POST /api/mobile/technician/jobs/:id/complete - Complete job

// Offline synchronization
POST /api/mobile/sync/upload - Upload offline data
GET /api/mobile/sync/download - Download latest data
```

### Customer Portal APIs
```typescript
// Self-service APIs
POST /api/customer/check-in - QR code check-in
GET /api/customer/jobs - Get customer jobs
POST /api/customer/jobs/:id/approve - Approve quotation
GET /api/customer/jobs/:id/status - Real-time job status
POST /api/customer/jobs/:id/feedback - Submit feedback
```

## Quality Metrics and Monitoring

### Six Sigma Implementation
```typescript
interface QualityMetrics {
  trackDefect(jobId: string, defectType: string, severity: string): Promise<void>;
  calculateDPMO(timeRange: TimeRange): Promise<number>;
  generateQualityReport(timeRange: TimeRange): Promise<QualityReport>;
  triggerProcessImprovement(defectPattern: DefectPattern): Promise<void>;
}

class SixSigmaQualityService implements QualityMetrics {
  async trackDefect(jobId: string, defectType: string, severity: string): Promise<void> {
    // Record defect in quality tracking system
    // Analyze for patterns and trends
    // Trigger corrective actions if threshold exceeded
    // Update quality metrics dashboard
  }
}
```

## Security and Compliance

### Authentication and Authorization
```typescript
interface SecurityService {
  authenticateUser(credentials: UserCredentials): Promise<AuthResult>;
  authorizeOperation(userId: string, operation: string, resource: string): Promise<boolean>;
  auditLog(userId: string, action: string, resource: string, details: any): Promise<void>;
  encryptSensitiveData(data: any): Promise<string>;
  decryptSensitiveData(encryptedData: string): Promise<any>;
}
```

### Compliance Automation
```typescript
interface ComplianceService {
  validateGDPRCompliance(dataRequest: DataRequest): Promise<boolean>;
  generatePrivacyReport(customerId: string): Promise<PrivacyReport>;
  handleDataDeletionRequest(customerId: string): Promise<void>;
  auditDataAccess(userId: string, customerId: string): Promise<void>;
}
```

---

**Implementation Priority**: Job Management → Financial Management → Communication → Customer Relations → Advanced Features
**Quality Standard**: Six Sigma compliance with automated quality tracking
**Security**: Enterprise-grade with comprehensive audit trails
**Compliance**: GDPR/CCPA, GST/VAT, SOX reporting automation