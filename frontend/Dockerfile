# Use a slim Node image
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the Next.js production application
RUN npm run build

# Next.js runs on port 3000 by default
EXPOSE 3000

# Start the application server
CMD ["npm", "run", "start"]