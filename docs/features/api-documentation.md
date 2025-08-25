# RepairX API Documentation - Business Management Features

## API Overview
This document defines the comprehensive API endpoints for RepairX business management features, focusing on the core functionality required for repair business operations.

## Authentication
All API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Core Business APIs

### 1. Job Management API

#### Create Job
```http
POST /api/v1/jobs
Content-Type: application/json

{
  "customerId": "uuid",
  "deviceType": "smartphone",
  "deviceModel": "iPhone 13",
  "issueDescription": "Screen cracked, not responding to touch",
  "estimatedCost": 150.00,
  "priority": "normal"
}

Response 201:
{
  "id": "uuid",
  "jobNumber": "JOB-2024-001",
  "status": "CREATED",
  "customerId": "uuid",
  "deviceType": "smartphone",
  "deviceModel": "iPhone 13",
  "issueDescription": "Screen cracked, not responding to touch",
  "estimatedCost": 150.00,
  "createdAt": "2024-01-15T10:30:00Z",
  "assignedTechnician": null
}
```

#### Update Job Status
```http
PUT /api/v1/jobs/{jobId}/status
Content-Type: application/json

{
  "status": "IN_DIAGNOSIS",
  "notes": "Starting initial evaluation of device",
  "estimatedCompletionTime": "2024-01-16T14:00:00Z"
}

Response 200:
{
  "id": "uuid",
  "jobNumber": "JOB-2024-001",
  "status": "IN_DIAGNOSIS",
  "statusHistory": [
    {
      "fromStatus": "CREATED",
      "toStatus": "IN_DIAGNOSIS",
      "changedAt": "2024-01-15T11:00:00Z",
      "changedBy": "technician-uuid",
      "notes": "Starting initial evaluation of device"
    }
  ]
}
```

#### Get Job Details with Full Timeline
```http
GET /api/v1/jobs/{jobId}

Response 200:
{
  "id": "uuid",
  "jobNumber": "JOB-2024-001",
  "status": "IN_DIAGNOSIS",
  "customer": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+1-555-0123",
    "email": "john@example.com"
  },
  "device": {
    "type": "smartphone",
    "model": "iPhone 13",
    "serialNumber": "ABC123XYZ"
  },
  "workflow": {
    "currentState": "IN_DIAGNOSIS",
    "possibleNextStates": ["AWAITING_APPROVAL", "CANCELLED"],
    "timeline": [
      {
        "state": "CREATED",
        "timestamp": "2024-01-15T10:30:00Z",
        "duration": "30 minutes",
        "completedBy": "system"
      },
      {
        "state": "IN_DIAGNOSIS", 
        "timestamp": "2024-01-15T11:00:00Z",
        "duration": "ongoing",
        "completedBy": "tech-uuid"
      }
    ]
  },
  "financials": {
    "estimatedCost": 150.00,
    "actualCost": null,
    "partsCost": 0,
    "laborCost": 0,
    "taxAmount": 0,
    "totalAmount": 0
  },
  "photos": [],
  "documents": []
}
```

### 2. Customer Management API

#### Create Customer
```http
POST /api/v1/customers
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "address": {
    "line1": "123 Main St",
    "city": "Anytown",
    "state": "ST",
    "postalCode": "12345",
    "country": "US"
  },
  "customerType": "INDIVIDUAL",
  "gstin": null,
  "paymentTerms": 30
}

Response 201:
{
  "id": "uuid",
  "customerNumber": "CUST-2024-001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "customerType": "INDIVIDUAL",
  "creditLimit": 0,
  "totalSpent": 0,
  "loyaltyPoints": 0,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### Customer Service History
```http
GET /api/v1/customers/{customerId}/service-history

Response 200:
{
  "customerId": "uuid",
  "totalJobs": 15,
  "totalSpent": 2450.00,
  "averageSatisfaction": 4.7,
  "lastServiceDate": "2024-01-10T00:00:00Z",
  "serviceHistory": [
    {
      "jobId": "uuid",
      "jobNumber": "JOB-2024-001",
      "serviceDate": "2024-01-10T00:00:00Z",
      "deviceType": "smartphone",
      "serviceType": "Screen Repair",
      "status": "DELIVERED",
      "amount": 150.00,
      "satisfaction": 5,
      "warrantyUntil": "2024-07-10T00:00:00Z"
    }
  ]
}
```

### 3. Financial Management API

#### Create Quotation
```http
POST /api/v1/quotations
Content-Type: application/json

{
  "jobId": "uuid",
  "customerId": "uuid",
  "items": [
    {
      "description": "Screen replacement",
      "quantity": 1,
      "unitPrice": 120.00,
      "totalPrice": 120.00
    },
    {
      "description": "Labor charges",
      "quantity": 1,
      "unitPrice": 50.00,
      "totalPrice": 50.00
    }
  ],
  "subtotal": 170.00,
  "taxRate": 0.18,
  "taxAmount": 30.60,
  "totalAmount": 200.60,
  "validUntil": "2024-01-30T23:59:59Z",
  "termsConditions": "30-day warranty on parts and labor"
}

Response 201:
{
  "id": "uuid",
  "quoteNumber": "QUO-2024-001",
  "jobId": "uuid",
  "customerId": "uuid",
  "version": 1,
  "status": "DRAFT",
  "subtotal": 170.00,
  "taxAmount": 30.60,
  "totalAmount": 200.60,
  "validUntil": "2024-01-30T23:59:59Z",
  "createdAt": "2024-01-15T12:00:00Z"
}
```

#### Generate Invoice
```http
POST /api/v1/invoices
Content-Type: application/json

{
  "jobId": "uuid",
  "quotationId": "uuid",
  "customerId": "uuid",
  "items": [
    {
      "description": "Screen replacement - iPhone 13",
      "hsnCode": "85171200",
      "quantity": 1,
      "unitPrice": 120.00,
      "totalPrice": 120.00,
      "gstRate": 18
    }
  ],
  "subtotal": 170.00,
  "gstBreakdown": {
    "cgst": 15.30,
    "sgst": 15.30,
    "igst": 0
  },
  "totalAmount": 200.60,
  "dueDate": "2024-02-14T23:59:59Z"
}

Response 201:
{
  "id": "uuid",
  "invoiceNumber": "INV-2024-001",
  "jobId": "uuid",
  "customerId": "uuid",
  "status": "SENT",
  "subtotal": 170.00,
  "gstAmount": 30.60,
  "totalAmount": 200.60,
  "paidAmount": 0,
  "dueAmount": 200.60,
  "dueDate": "2024-02-14T23:59:59Z",
  "gstCompliant": true,
  "createdAt": "2024-01-15T15:00:00Z"
}
```

### 4. Inventory Management API

#### Get Inventory Status
```http
GET /api/v1/inventory/parts?lowStock=true

Response 200:
{
  "totalParts": 1250,
  "lowStockItems": 15,
  "outOfStockItems": 3,
  "parts": [
    {
      "id": "uuid",
      "partNumber": "SCREEN-IP13-BLK",
      "partName": "iPhone 13 Screen Assembly - Black",
      "category": "Screens",
      "quantityOnHand": 5,
      "reorderPoint": 10,
      "reorderQuantity": 25,
      "unitCost": 95.00,
      "sellingPrice": 120.00,
      "supplier": "TechParts Inc",
      "location": "A-15-B",
      "lastRestocked": "2024-01-10T00:00:00Z",
      "status": "LOW_STOCK"
    }
  ]
}
```

#### Record Parts Usage
```http
POST /api/v1/inventory/movements
Content-Type: application/json

{
  "partId": "uuid",
  "movementType": "OUT",
  "quantity": 1,
  "referenceId": "job-uuid",
  "referenceType": "JOB",
  "unitCost": 95.00,
  "totalCost": 95.00,
  "notes": "Used for iPhone 13 screen repair - Job JOB-2024-001"
}

Response 201:
{
  "id": "uuid",
  "partId": "uuid",
  "movementType": "OUT",
  "quantity": 1,
  "newQuantityOnHand": 4,
  "unitCost": 95.00,
  "totalCost": 95.00,
  "createdAt": "2024-01-15T13:30:00Z"
}
```

### 5. Communication Management API

#### Send SMS Notification
```http
POST /api/v1/communications/sms
Content-Type: application/json

{
  "to": "+1-555-0123",
  "templateId": "job-status-update",
  "variables": {
    "customerName": "John Doe",
    "jobNumber": "JOB-2024-001",
    "status": "Ready for pickup",
    "pickupTime": "2024-01-16 2:00 PM"
  }
}

Response 202:
{
  "messageId": "sms-uuid",
  "to": "+1-555-0123",
  "message": "Hi John Doe, your repair JOB-2024-001 is ready for pickup at 2:00 PM on 2024-01-16",
  "status": "QUEUED",
  "creditsUsed": 1,
  "remainingCredits": 249,
  "scheduledAt": "2024-01-15T14:00:00Z"
}
```

#### Track Message Delivery
```http
GET /api/v1/communications/sms/{messageId}/status

Response 200:
{
  "messageId": "sms-uuid",
  "status": "DELIVERED",
  "deliveredAt": "2024-01-15T14:02:35Z",
  "creditsUsed": 1,
  "deliveryReport": {
    "provider": "Twilio",
    "providerMessageId": "SM1234567890",
    "deliveryStatus": "delivered",
    "errorCode": null
  }
}
```

### 6. Business Settings API

#### Get Tax Settings
```http
GET /api/v1/settings/tax

Response 200:
{
  "category": "tax",
  "settings": {
    "gstEnabled": true,
    "defaultGstRate": 18,
    "gstRates": {
      "electronics": 18,
      "services": 18,
      "parts": 18
    },
    "gstin": "27AABCU9603R1ZW",
    "stateCode": "27",
    "placeOfSupply": "Maharashtra",
    "taxExemptions": [
      {
        "category": "warranty_repair",
        "exemptionRate": 0,
        "conditions": ["warranty_valid", "original_invoice_available"]
      }
    ]
  },
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Update Business Settings
```http
PUT /api/v1/settings/{category}
Content-Type: application/json

{
  "settings": {
    "smsCredits": 500,
    "smsProvider": "Twilio",
    "smsSettings": {
      "accountSid": "AC123...",
      "authToken": "encrypted_token",
      "fromNumber": "+1-555-REPAIR"
    },
    "autoTopup": {
      "enabled": true,
      "threshold": 50,
      "topupAmount": 200
    }
  }
}

Response 200:
{
  "category": "sms",
  "settings": {
    "smsCredits": 500,
    "smsProvider": "Twilio",
    "autoTopup": {
      "enabled": true,
      "threshold": 50,
      "topupAmount": 200
    }
  },
  "updatedAt": "2024-01-15T16:00:00Z"
}
```

### 7. Analytics and Reporting API

#### Business Dashboard Metrics
```http
GET /api/v1/analytics/dashboard?period=30d

Response 200:
{
  "period": "30d",
  "metrics": {
    "revenue": {
      "total": 47890.50,
      "growth": 18.2,
      "target": 50000.00,
      "achievement": 95.78
    },
    "activeJobs": {
      "total": 127,
      "todayIncrease": 12,
      "byStatus": {
        "IN_DIAGNOSIS": 8,
        "AWAITING_APPROVAL": 5,
        "IN_PROGRESS": 12,
        "TESTING": 3,
        "COMPLETED": 7
      }
    },
    "customerSatisfaction": {
      "average": 4.8,
      "growth": 0.2,
      "totalResponses": 156
    },
    "completionRate": {
      "rate": 94.5,
      "growth": 2.1,
      "target": 95.0
    }
  },
  "trends": {
    "dailyRevenue": [
      {"date": "2024-01-01", "revenue": 1580.00},
      {"date": "2024-01-02", "revenue": 1750.00}
    ],
    "jobVolume": [
      {"date": "2024-01-01", "jobs": 8},
      {"date": "2024-01-02", "jobs": 12}
    ]
  }
}
```

### 8. Mobile API Endpoints

#### Technician Mobile - Get Assigned Jobs
```http
GET /api/v1/mobile/technician/jobs?status=assigned&date=today

Response 200:
{
  "jobs": [
    {
      "id": "uuid",
      "jobNumber": "JOB-2024-001",
      "status": "IN_PROGRESS",
      "customer": {
        "name": "John Doe",
        "phone": "+1-555-0123",
        "address": "123 Main St, Anytown"
      },
      "device": {
        "type": "smartphone",
        "model": "iPhone 13"
      },
      "estimatedTime": 90,
      "priority": "normal",
      "scheduledTime": "2024-01-15T14:00:00Z"
    }
  ],
  "totalJobs": 5,
  "completedToday": 2,
  "remainingJobs": 3
}
```

#### Customer Portal - Self Check-in
```http
POST /api/v1/customer/check-in
Content-Type: application/json

{
  "qrCode": "QR_CODE_DATA",
  "customerPhone": "+1-555-0123",
  "deviceInfo": {
    "type": "smartphone",
    "model": "iPhone 13",
    "serialNumber": "ABC123XYZ",
    "issueDescription": "Screen cracked"
  }
}

Response 201:
{
  "jobId": "uuid",
  "jobNumber": "JOB-2024-001",
  "estimatedWaitTime": "30 minutes",
  "queuePosition": 3,
  "trackingUrl": "https://repairx.com/track/JOB-2024-001"
}
```

## Webhook Events

### Job Status Change
```http
POST [webhook_url]
Content-Type: application/json

{
  "event": "job.status.changed",
  "timestamp": "2024-01-15T14:00:00Z",
  "data": {
    "jobId": "uuid",
    "jobNumber": "JOB-2024-001",
    "fromStatus": "IN_PROGRESS",
    "toStatus": "COMPLETED",
    "customerId": "uuid",
    "technicianId": "uuid"
  }
}
```

### Payment Received
```http
POST [webhook_url]
Content-Type: application/json

{
  "event": "payment.received",
  "timestamp": "2024-01-15T15:30:00Z",
  "data": {
    "paymentId": "uuid",
    "invoiceId": "uuid",
    "amount": 200.60,
    "method": "card",
    "status": "success",
    "customerId": "uuid"
  }
}
```

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "phone",
        "message": "Phone number is required"
      }
    ],
    "timestamp": "2024-01-15T14:00:00Z",
    "requestId": "req-uuid"
  }
}
```

## Rate Limiting

- Authentication: 1000 requests per hour
- Business Operations: 500 requests per hour per endpoint
- SMS/Email: 100 requests per hour
- File Uploads: 50 requests per hour

## API Versioning

All endpoints include version in the URL path: `/api/v1/`
Backward compatibility maintained for at least 2 major versions.