FROM node:22-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies cleanly
RUN npm install --omit=dev

# Copy remaining project source code
COPY .. .

EXPOSE 3000

ENV HOST=0.0.0.0

CMD ["node", "src/server.js"]