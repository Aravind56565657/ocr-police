# Use Node.js 18 (Alpine for smaller image, but Debian-based for easier GM/GS install)
FROM node:18-slim

# Install system dependencies for pdf2pic (GraphicsMagick and Ghostscript)
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    ghostscript \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
