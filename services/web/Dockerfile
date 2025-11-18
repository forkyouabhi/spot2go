# --- Stage 1: Builder (Build Environment) ---
FROM node:20-alpine AS builder

# Next.js requires specific system libraries; apk add --no-cache is the Alpine way
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files first for layer caching
COPY package.json ./
COPY package-lock.json ./

# Install ALL dependencies (dev dependencies are required for building)
RUN npm install

# Copy source code and config files
COPY . .

# CRITICAL FIX: Add --max-old-space-size to prevent build failure due to memory limits
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# --- Stage 2: Runner (Lightweight Production Environment) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment (Next.js requirement)
ENV NODE_ENV=production

# 1. Copy only the essential files from the builder stage:
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Expose the application port
EXPOSE 3000

# Final start command
CMD npm start