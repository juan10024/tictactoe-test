# frontend/Dockerfile
# This Dockerfile creates a production-optimized image for the React frontend.
# It leverages a multi-stage build to first create a production build of the React app
# using Node.js and then serves the resulting static files with a lightweight Nginx server.
# This approach ensures a small and secure final image without Node.js dependencies.

# --- Build Stage ---
# Use a specific version of the Node.js Alpine image for building the application.
FROM node:20-alpine AS builder

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker's layer caching.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Build the application for production. This creates an optimized 'dist' directory.
RUN npm run build

# --- Final Stage ---
# Use a lightweight Nginx image to serve the static content.
FROM nginx:1.25-alpine

# Copy the static build output from the builder stage to the Nginx public directory.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80, which is the default port Nginx listens on.
EXPOSE 80

# The default Nginx entrypoint will start the server automatically.
CMD ["nginx", "-g", "daemon off;"]

