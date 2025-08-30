# --- Builder Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install basic build dependencies
RUN apk update && apk add --no-cache python3 make g++ pkgconfig cairo-dev jpeg-dev pango-dev giflib-dev

# Ensure data directory exists and is accessible for all stages
RUN mkdir -p /app/data && chmod 777 /app/data

# Set Puppeteer to skip download (not needed for production API)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install all dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then npm install --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copy source files (including prisma/)
COPY . .

# Generate Prisma client (after code and dependencies are in place)
RUN npx prisma generate

# Build for production (compiles TypeScript to dist/)
RUN npm run build

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Install only essential runtime dependencies
RUN apk add --no-cache ca-certificates && rm -rf /var/cache/apk/*

# Ensure data directory exists and is owned by nodejs
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy only production dependencies and build output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --legacy-peer-deps && npm cache clean --force; fi

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/uploads ./uploads

# Copy data directory with correct ownership (optional if using volume, but safe)
COPY --from=builder --chown=nodejs:nodejs /app/data ./data

# --- CRITICAL: Copy generated Prisma client from builder ---
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# Change to non-root user
USER nodejs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/index.js"]
