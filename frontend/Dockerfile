# --- Builder Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for build)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copy the rest of the source code
COPY . .

# Build the Next.js app (standalone output if configured, see next.config.js)
RUN npm run build

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only copy necessary files for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js* ./
COPY --from=builder /app/next.config.ts* ./
COPY --from=builder /app/node_modules ./node_modules

# Set port (Next.js default)
EXPOSE 3000

# Start Next.js production server
CMD ["npm", "run", "start"]
