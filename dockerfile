FROM node:20-alpine as base

WORKDIR /app

# Development stage
FROM base as dev
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install --include=dev
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM base as prod
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
EXPOSE 5000

# Use a non-root user
USER node

CMD ["npm", "start"]
