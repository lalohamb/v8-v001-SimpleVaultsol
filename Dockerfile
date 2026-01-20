FROM node:18-alpine

WORKDIR /app

# Install agent-service
COPY agent-service/package*.json ./agent-service/
WORKDIR /app/agent-service
RUN npm install --production=false
COPY agent-service/ .
RUN npm run build

# Install frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --production=false
COPY frontend/ .
RUN npm run build

WORKDIR /app

EXPOSE 3000 3001

CMD ["/bin/sh", "-c", "cd /app/agent-service && PORT=3001 node dist/server.js & cd /app/frontend && exec next start -p 3000"]
