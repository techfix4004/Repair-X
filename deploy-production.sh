#!/bin/bash

# RepairX Production Deployment Script
# Six Sigma Quality Assured Deployment

set -e

echo "🚀 Starting RepairX Production Deployment"
echo "=========================================="

BUILD_ID=$(date +%s)
DEPLOYMENT_LOG="/tmp/repairx-deployment-${BUILD_ID}.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DEPLOYMENT_LOG"
}

# Pre-deployment quality checks
log "📊 Running Six Sigma quality validation..."

# Run comprehensive test suite
cd backend
npm test 2>&1 | tee -a "$DEPLOYMENT_LOG"
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    log "❌ Tests failed - deployment aborted"
    exit 1
fi

# Build frontend
log "🏗️ Building frontend..."
cd ../frontend
npm run build 2>&1 | tee -a "$DEPLOYMENT_LOG"
if [ $? -ne 0 ]; then
    log "❌ Frontend build failed - deployment aborted"
    exit 1
fi

# Validate bundle size
BUNDLE_SIZE=$(du -s .next | cut -f1)
if [ $BUNDLE_SIZE -gt 200000 ]; then
    log "⚠️ Warning: Bundle size (${BUNDLE_SIZE}KB) exceeds recommended limit"
fi

log "✅ Quality checks passed - proceeding with deployment"

# Production deployment
log "🚀 Deploying to production environment..."
log "Build ID: $BUILD_ID"

# Create deployment backup
log "💾 Creating deployment backup..."
mkdir -p /opt/repairx/backups
tar -czf "/opt/repairx/backups/backup-$BUILD_ID.tar.gz" /opt/repairx/current 2>/dev/null || true

# Deploy new version
log "📦 Deploying new version..."
rsync -av --delete ../frontend/.next/ /opt/repairx/frontend/
rsync -av --delete ../backend/dist/ /opt/repairx/backend/

# Restart services
log "🔄 Restarting application services..."
systemctl restart repairx-backend || true
systemctl restart repairx-frontend || true

# Health check
log "🩺 Running post-deployment health checks..."
sleep 10

# Check frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    log "✅ Frontend health check passed"
else
    log "❌ Frontend health check failed"
    exit 1
fi

# Check backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
    log "✅ Backend health check passed"
else
    log "❌ Backend health check failed"
    exit 1
fi

log "🎉 Deployment completed successfully!"
log "Build ID: $BUILD_ID"
log "Deployment log: $DEPLOYMENT_LOG"

# Send success notification
echo "RepairX deployed successfully with Build ID: $BUILD_ID" | mail -s "RepairX Deployment Success" admin@repairx.com 2>/dev/null || true

echo "✅ RepairX production deployment complete!"