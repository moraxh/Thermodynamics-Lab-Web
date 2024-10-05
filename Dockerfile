# Base image of node.js
FROM node:18

# Set the workdir
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Expose the port
EXPOSE 3000
EXPOSE 35729

# Startup command
CMD ["npm", "run", "dev"]