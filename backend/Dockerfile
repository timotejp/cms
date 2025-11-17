FROM node:18-alpine

# Install wget for health checks (Portainer 2.33.3 compatible)
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Health check endpoint available at /health
# Start server
CMD ["npm", "start"]

