# --- Builder Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install only the dependencies needed for building
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copy source files
COPY . .

# If using Prisma, generate client (remove this if not using Prisma)
RUN npx prisma generate || true

# Build for production (e.g., compiles TypeScript to dist/)
RUN npm run build

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy only production dependencies and build output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/.env ./.env

# Expose app port (customize if needed)
EXPOSE 3001

# Start your server (customize if entrypoint is different)
CMD ["node", "dist/index.js"]
