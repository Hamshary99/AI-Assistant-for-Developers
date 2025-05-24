FROM node:20-alpine as base

WORKDIR /app

# Development stage
FROM base as dev
ENV NODE_ENV=development
COPY package*.json ./
# Install nodemon globally and then install dependencies
RUN npm install -g nodemon && npm install --include=dev
COPY . .
EXPOSE 5000
CMD ["nodemon", "--exec", "node", "src/app.js"]

# Production stage
FROM base as prod
ENV NODE_ENV=production
COPY package*.json ./
# Use ci for more reliable builds and clean cache
RUN npm ci --only=production && npm cache clean --force
COPY . .
EXPOSE 5000

# Use a non-root user for security
USER node

# Use direct node command instead of npm for production
CMD ["node", "src/app.js"]
