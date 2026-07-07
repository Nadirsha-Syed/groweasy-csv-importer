# Use a slim Node image for a smaller footprint
FROM node:22-alpine

WORKDIR /app

# Copy package files first to leverage Docker's caching layers
COPY package*.json ./

# Install all dependencies (including devDependencies needed for building TypeScript)
RUN npm install

# Copy the rest of your application code
COPY . .

# Compile TypeScript down to JavaScript
RUN npm run build

# Expose the API port
EXPOSE 5000

# Run the production build
CMD ["npm", "run", "start"]