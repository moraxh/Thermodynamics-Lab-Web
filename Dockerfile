# Base image of node.js
FROM node:18

# Set the workdir
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install
COPY . .

# Install nodemon
RUN npm install --save-dev nodemon

# Expose the port
EXPOSE 3000
EXPOSE 35729

# Startup command
CMD ["npm", "run", "dev"]