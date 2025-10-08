#!/bin/sh

# Change to the app directory
cd /app

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --omit=dev
fi

# Start the socket server
echo "Starting Socket.IO server on port ${NEXT_PUBLIC_SOCKET_PORT:-58854}"
node socket.js
