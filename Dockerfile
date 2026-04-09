# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy source and config files
COPY . .

# Compile TypeScript to JavaScript (dist folder)
RUN npm run build

# Stage 2: Run
FROM node:18-alpine

WORKDIR /app

# Only copy production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your Express app runs on (usually 3000 or 8080)
EXPOSE 3000

CMD ["npm", "start"]
