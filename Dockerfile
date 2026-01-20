FROM node:18-alpine

WORKDIR /app

# Install agent-service
COPY agent-service/package*.json ./agent-service/
WORKDIR /app/agent-service
RUN npm install --production=false
COPY agent-service/ .
COPY agent-service/.env* ./
RUN npm run build

# Install frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --production=false
COPY frontend/ .
COPY frontend/.env* ./
RUN npm run build

WORKDIR /app

EXPOSE 3000

CMD PORT=3001 node /app/agent-service/dist/server.js & cd /app/frontend && npm start -- -p 3000
