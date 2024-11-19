# Base image of node.js
FROM node:18

# Set the workdir
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install project dependencies
RUN npm install 

# Copy files
COPY . .

RUN npx eslint

# Expose the port
EXPOSE 3000 3001 4000

# Startup command
CMD ["npm", "run", "dev"]