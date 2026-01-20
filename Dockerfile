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

EXPOSE 3001

CMD ["sh", "-c", "cd /app/agent-service && npm start & cd /app/frontend && npm start"]
