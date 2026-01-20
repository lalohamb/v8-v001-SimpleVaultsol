FROM node:18-alpine

WORKDIR /app

COPY agent-service/package*.json ./
RUN npm install --production
COPY agent-service/ .
RUN npm install -D typescript tsx && npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
