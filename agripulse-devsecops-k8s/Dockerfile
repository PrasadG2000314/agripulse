# ==============================================================================
# Multi-Stage & Non-Root Hardened Dockerfile for AgriPulse (DevSecOps Best Practice)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Dependencies Resolution
# ------------------------------------------------------------------------------
FROM node:20-alpine AS dependencies

WORKDIR /usr/src/app

# Install dependencies needed for potential build tools and clean npm cache
COPY package*.json ./

# Install only production dependencies cleanly without optional scripts
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 2: Minimal, Hardened Non-Root Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Install dumb-init for proper PID 1 signal forwarding (SIGTERM / SIGINT)
RUN apk add --no-cache dumb-init

WORKDIR /app

# DevSecOps: Create a dedicated non-root system group & user with explicit UID/GID
RUN addgroup -g 10001 -S agriuser && \
    adduser -u 10001 -S -G agriuser agriuser

# Set standard production environment variables
ENV NODE_ENV=production \
    PORT=3000

# Copy node_modules from the dependencies stage with proper ownership
COPY --chown=agriuser:agriuser --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --chown=agriuser:agriuser package*.json ./
COPY --chown=agriuser:agriuser server.js ./

# Switch to the non-root user (DevSecOps Principle of Least Privilege)
USER 10001:10001

# Expose internal web application port
EXPOSE 3000

# Define container health check for automated orchestrator healing
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

# Utilize dumb-init as entrypoint to reap zombie processes
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run the smart farming application
CMD ["node", "server.js"]
