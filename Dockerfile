FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
ENV HOST=0.0.0.0
CMD ["node", "src/server.js"]