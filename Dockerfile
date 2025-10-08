# Build he root eproc app

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
