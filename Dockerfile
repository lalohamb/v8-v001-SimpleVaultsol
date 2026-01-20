FROM node:18-alpine

WORKDIR /app

# Build agent-service
COPY agent-service/package*.json ./agent-service/
WORKDIR /app/agent-service
RUN npm install --production
COPY agent-service/ .
RUN npm install -D typescript tsx && npm run build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --production
COPY frontend/ ./
RUN npm run build

WORKDIR /app

EXPOSE 3000 3001

CMD ["/bin/sh", "-c", "cd /app/agent-service && node dist/server.js & cd /app/frontend && exec next start -p 3000"]
