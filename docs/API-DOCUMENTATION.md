# RepairX API Documentation

## Overview

The RepairX API is a comprehensive REST API that powers the entire RepairX platform. It provides endpoints for user management, job processing, payments, analytics, and business intelligence.

**Base URL**: `https://api.repairx.com/v1`
**Authentication**: JWT Bearer tokens
**Content Type**: `application/json`

## Authentication

### POST /auth/login
Authenticate user and receive JWT token.

**Request**:
```json
{
  "email": "user@example.com", 
  "password": "securepassword",
  "remember": true
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "usr_123456789",
    "email": "user@example.com",
    "role": "customer",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    }
  },
  "expiresIn": 86400
}
```

### POST /auth/register
Register new user account.

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword", 
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "customer",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown", 
    "state": "CA",
    "zipCode": "12345"
  }
}
```

### POST /auth/refresh
Refresh authentication token.

### POST /auth/logout
Invalidate current session.

---

## User Management

### GET /users/profile
Get current user profile.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "id": "usr_123456789",
  "email": "user@example.com",
  "role": "customer",
  "profile": {
    "firstName": "John",
    "lastName": "Doe", 
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA", 
      "zipCode": "12345"
    },
    "avatar": "https://s3.amazonaws.com/repairx/avatars/usr_123456789.jpg"
  },
  "preferences": {
    "notifications": true,
    "smsUpdates": true,
    "emailUpdates": true
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-08-27T09:15:00Z"
}
```

### PUT /users/profile
Update user profile.

### GET /users/technicians
Get available technicians (for job assignment).

**Query Parameters**:
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in miles (default: 25)
- `skills`: Comma-separated skill list
- `availability`: Available now (true/false)

**Response**:
```json
{
  "technicians": [
    {
      "id": "tech_987654321",
      "name": "Mike Johnson", 
      "rating": 4.8,
      "completedJobs": 247,
      "skills": ["electrical", "plumbing", "hvac"],
      "distance": 2.3,
      "available": true,
      "estimatedArrival": "30-45 minutes",
      "hourlyRate": 75,
      "avatar": "https://s3.amazonaws.com/repairx/avatars/tech_987654321.jpg"
    }
  ]
}
```

---

## Job Management

### GET /jobs
Get jobs based on user role.

**Query Parameters**:
- `status`: Job status filter (pending, assigned, in_progress, completed, cancelled)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sort`: Sort field (createdAt, updatedAt, priority)
- `order`: Sort order (asc, desc)

**Response**:
```json
{
  "jobs": [
    {
      "id": "job_abc123456",
      "title": "Kitchen Sink Repair",
      "description": "Leaky faucet needs repair",
      "category": "plumbing",
      "status": "assigned",
      "priority": "medium",
      "customer": {
        "id": "usr_123456789",
        "name": "John Doe",
        "phone": "+1234567890"
      },
      "technician": {
        "id": "tech_987654321", 
        "name": "Mike Johnson",
        "phone": "+1987654321"
      },
      "location": {
        "address": "123 Main St, Anytown, CA 12345",
        "lat": 37.7749,
        "lng": -122.4194
      },
      "pricing": {
        "estimate": 150,
        "final": null,
        "currency": "USD"
      },
      "scheduledAt": "2024-08-27T14:00:00Z",
      "createdAt": "2024-08-27T10:30:00Z",
      "updatedAt": "2024-08-27T11:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### POST /jobs
Create new service request.

**Request**:
```json
{
  "title": "Washing Machine Repair",
  "description": "Machine won't start, no lights on display",
  "category": "appliances",
  "subcategory": "laundry",
  "priority": "high",
  "location": {
    "address": "123 Main St, Anytown, CA 12345",
    "lat": 37.7749,
    "lng": -122.4194,
    "accessInstructions": "Ring doorbell, garage code is 1234"
  },
  "preferredTime": {
    "start": "2024-08-27T09:00:00Z",
    "end": "2024-08-27T17:00:00Z"
  },
  "attachments": [
    {
      "type": "image",
      "url": "https://s3.amazonaws.com/repairx/jobs/job_abc123456/photo1.jpg",
      "description": "Control panel not working"
    }
  ]
}
```

### GET /jobs/:id
Get specific job details.

### PUT /jobs/:id
Update job status or details.

**Request**:
```json
{
  "status": "in_progress",
  "notes": "Diagnosed the issue, replacing water pump",
  "estimatedCompletion": "2024-08-27T16:00:00Z",
  "attachments": [
    {
      "type": "image", 
      "url": "https://s3.amazonaws.com/repairx/jobs/job_abc123456/progress1.jpg",
      "description": "Removed old pump"
    }
  ]
}
```

### POST /jobs/:id/assign
Assign technician to job.

### POST /jobs/:id/complete
Mark job as completed.

---

## Payment Management

### POST /payments/process
Process payment for completed job.

**Request**:
```json
{
  "jobId": "job_abc123456",
  "amount": 175.50,
  "currency": "USD",
  "paymentMethod": {
    "type": "card",
    "cardId": "card_def789456"
  },
  "tip": 20.00,
  "notes": "Great service, very professional"
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": "pay_xyz987654",
    "amount": 195.50,
    "currency": "USD",
    "status": "completed",
    "method": "card",
    "last4": "4242",
    "receipt": "https://receipts.repairx.com/pay_xyz987654.pdf",
    "processedAt": "2024-08-27T15:30:00Z"
  }
}
```

### GET /payments/history
Get payment history.

### POST /payments/refund
Process refund.

### GET /payments/methods
Get user's saved payment methods.

### POST /payments/methods
Add new payment method.

---

## Business Intelligence

### GET /analytics/dashboard
Get dashboard analytics.

**Query Parameters**:
- `period`: Time period (today, week, month, quarter, year)
- `businessId`: Business ID (for business owners)

**Response**:
```json
{
  "period": "month",
  "summary": {
    "totalJobs": 247,
    "completedJobs": 231,
    "revenue": 34567.89,
    "averageJobValue": 149.64,
    "customerSatisfaction": 4.7,
    "technicianUtilization": 0.82
  },
  "trends": {
    "jobsGrowth": 12.5,
    "revenueGrowth": 18.2,
    "satisfactionTrend": 0.3
  },
  "topServices": [
    {
      "category": "plumbing",
      "jobs": 89,
      "revenue": 12450.32
    },
    {
      "category": "electrical", 
      "jobs": 67,
      "revenue": 9876.54
    }
  ],
  "performance": {
    "averageResponseTime": 18,
    "averageCompletionTime": 127,
    "firstTimeFixRate": 0.89
  }
}
```

### GET /analytics/reports
Generate custom reports.

### GET /analytics/technician-performance
Get technician performance metrics.

---

## Real-Time Updates

### WebSocket Connection
Connect to WebSocket for real-time updates.

**Endpoint**: `wss://api.repairx.com/v1/ws`
**Authentication**: Send JWT token in connection query: `?token=<jwt_token>`

**Message Types**:

#### Job Status Update
```json
{
  "type": "job_status_update",
  "data": {
    "jobId": "job_abc123456",
    "status": "in_progress",
    "message": "Technician has arrived and started diagnosis",
    "timestamp": "2024-08-27T14:15:00Z"
  }
}
```

#### Technician Location Update
```json
{
  "type": "technician_location",
  "data": {
    "jobId": "job_abc123456",
    "technicianId": "tech_987654321",
    "location": {
      "lat": 37.7749,
      "lng": -122.4194
    },
    "estimatedArrival": "15 minutes",
    "timestamp": "2024-08-27T14:10:00Z"
  }
}
```

#### New Message
```json
{
  "type": "new_message",
  "data": {
    "jobId": "job_abc123456",
    "from": "tech_987654321",
    "message": "I'm running 10 minutes late due to traffic",
    "timestamp": "2024-08-27T14:05:00Z"
  }
}
```

---

## File Upload

### POST /upload
Upload files (images, documents).

**Request**: Multipart form data
- `file`: File to upload
- `type`: File type (avatar, job_photo, document)
- `jobId`: Associated job ID (if applicable)

**Response**:
```json
{
  "success": true,
  "file": {
    "id": "file_abc123",
    "url": "https://s3.amazonaws.com/repairx/uploads/file_abc123.jpg",
    "type": "job_photo",
    "size": 2048576,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-08-27T14:20:00Z"
  }
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-08-27T14:25:00Z"
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED`: Missing or invalid authentication
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request data validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `PAYMENT_FAILED`: Payment processing failed
- `BUSINESS_LOGIC_ERROR`: Business rule violation

---

## Rate Limits

### Standard Limits
- **Authenticated Users**: 1000 requests per hour
- **Business Accounts**: 5000 requests per hour
- **Enterprise Accounts**: 10000 requests per hour

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1724756400
```

---

## Webhooks

### Configuration
Configure webhook endpoints in your business dashboard.

### Supported Events
- `job.created`: New job created
- `job.assigned`: Job assigned to technician
- `job.started`: Technician started work
- `job.completed`: Job completed
- `payment.processed`: Payment completed
- `payment.failed`: Payment failed

### Webhook Payload Example
```json
{
  "event": "job.completed",
  "data": {
    "jobId": "job_abc123456",
    "status": "completed",
    "completedAt": "2024-08-27T16:00:00Z",
    "customer": {
      "id": "usr_123456789",
      "email": "customer@example.com"
    },
    "technician": {
      "id": "tech_987654321",
      "email": "tech@example.com"
    },
    "payment": {
      "amount": 175.50,
      "status": "completed"
    }
  },
  "timestamp": "2024-08-27T16:00:05Z"
}
```

---

## SDK and Libraries

### Official SDKs
- **JavaScript/Node.js**: `npm install @repairx/sdk`
- **Python**: `pip install repairx-sdk`
- **PHP**: `composer require repairx/sdk`
- **Java**: Available on Maven Central

### Example Usage (JavaScript)
```javascript
import RepairX from '@repairx/sdk';

const client = new RepairX({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Create a job
const job = await client.jobs.create({
  title: 'Kitchen Sink Repair',
  description: 'Leaky faucet needs repair',
  category: 'plumbing'
});

// Get job status
const status = await client.jobs.get(job.id);
```

---

## Testing

### Sandbox Environment
**Base URL**: `https://api-sandbox.repairx.com/v1`

### Test Credentials
```json
{
  "customer": {
    "email": "customer@test.repairx.com",
    "password": "test123456"
  },
  "technician": {
    "email": "technician@test.repairx.com", 
    "password": "test123456"
  },
  "business": {
    "email": "business@test.repairx.com",
    "password": "test123456"
  }
}
```

### Test Payment Methods
- **Test Card**: 4242424242424242 (Visa)
- **Declined Card**: 4000000000000002
- **Insufficient Funds**: 4000000000009995

---

## Support

### Technical Support
- **Email**: api-support@repairx.com
- **Documentation**: [docs.repairx.com](https://docs.repairx.com)
- **Status Page**: [status.repairx.com](https://status.repairx.com)

### API Versioning
- Current Version: v1
- Version included in URL path
- Backwards compatibility maintained for 12 months
- Deprecation notices provided 6 months in advance

---

*For the most up-to-date API documentation, visit [docs.repairx.com](https://docs.repairx.com)*