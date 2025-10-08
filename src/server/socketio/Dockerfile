FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the socket server
COPY socket.js ./

# Expose the port
EXPOSE 58854

# Start the server
CMD ["node", "socket.js"]
