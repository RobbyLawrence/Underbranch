# Use a base image (e.g., Ubuntu, Alpine, Node.js)
FROM ubuntu:latest

# Set working directory
WORKDIR /app

# Copy application files (if any)
COPY . .

# Install dependencies (example for a Node.js app)
# RUN npm install

# Expose ports (if your application listens on a specific port)
# EXPOSE 8080

# Define the command to run when the container starts
CMD ["echo", "Hello from Docker!"]
