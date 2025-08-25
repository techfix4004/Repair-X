# RepairX Deployment Guide

## Prerequisites
- Node.js 20+
- npm 10+
- MongoDB or PostgreSQL
- Redis (optional, for caching)

## Environment Setup
1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Configure environment variables
4. Run database migrations
5. Start the application: `npm run dev:all`

## Production Deployment
1. Run production build: `npm run build:all`
2. Execute deployment pipeline: `./production-deployment-pipeline.sh`
3. Verify health checks: `curl http://localhost:3001/api/health`

## Mobile App Deployment
1. Configure app store credentials
2. Generate screenshots: `node scripts/generate-mobile-screenshots.js`
3. Submit to stores: `./deploy-mobile-apps.sh`

## Monitoring
- Six Sigma quality metrics: `npm run quality:check`
- Visual testing: `npm run visual:test`
- Health monitoring: Available at `/api/health`
