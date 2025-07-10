# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S advantage -u 1001

# Change ownership of app directory
RUN chown -R advantage:nodejs /app

# Switch to non-root user
USER advantage

# Start the application
CMD ["npx", "expo", "start", "--web", "--port", "3000"] 