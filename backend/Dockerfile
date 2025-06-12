# backend/Dockerfile
# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# We need devDependencies like typescript for the build process
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project
# This will use the "build": "tsc" script from package.json
# and output to the "dist" folder as specified in tsconfig.json
RUN npm run build

# After building, prune development dependencies
# This leaves only production dependencies in node_modules
RUN npm prune --omit=dev


# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy the built application (dist folder) from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the pruned production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json (might be needed for some runtimes or utilities)
COPY --from=builder /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 8000

# Set the Node environment to production
ENV NODE_ENV=production

# Command to run the application
# This will execute dist/index.js, which is the compiled output of src/index.ts
CMD ["node", "dist/index.js"]
