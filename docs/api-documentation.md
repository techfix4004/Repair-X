# RepairX API Documentation

## Overview
RepairX provides a comprehensive REST API for managing repair services, customer relationships, and business operations.

## Base URL
```
https://api.repairx.app/v1
```

## Authentication
All API requests require authentication using JWT tokens.

```javascript
Authorization: Bearer <your_jwt_token>
```

## Core Endpoints

### Health & System Status
- `GET /api/health` - System health check
- `GET /api/metrics` - Six Sigma quality metrics

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user profile

### Business Management
- `GET /api/business/categories` - Business settings categories
- `GET /api/business/settings/:category` - Category-specific settings
- `GET /api/business/quality-metrics` - Real-time quality dashboard

### Advanced Reporting
- `GET /api/advanced-reporting/dashboard/executive` - Executive dashboard
- `GET /api/advanced-reporting/reports/financial` - Financial reports
- `GET /api/advanced-reporting/analytics/customers` - Customer analytics
- `GET /api/advanced-reporting/analytics/operations` - Operational metrics

### Franchise Management
- `GET /api/franchise/locations` - Multi-location management
- `GET /api/franchise/control/dashboard` - Centralized control
- `GET /api/franchise/performance/:locationId` - Performance monitoring
- `GET /api/franchise/compliance/:locationId` - Compliance tracking

### Marketing Automation
- `GET /api/marketing/funnels` - Customer acquisition funnels
- `GET /api/marketing/leads/scoring` - Lead scoring & qualification
- `GET /api/marketing/ab-testing` - A/B testing results
- `GET /api/marketing/campaigns/performance` - Campaign analytics

## Error Handling
All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## Rate Limiting
API requests are limited to 1000 requests per hour per authenticated user.

## Support
For technical support, contact: support@repairx.app
