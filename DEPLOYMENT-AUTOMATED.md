# Automated Deployment Guide

This guide provides automated deployment scripts for the entire Cronos AI Platform.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Ubuntu/Linux environment
- Test wallet with Cronos testnet CRO tokens
- OpenAI API key

### One-Command Deployment

```bash
# Make scripts executable
chmod +x deploy-all.sh stop-all.sh
chmod +x agent-service/deploy.sh frontend/deploy.sh frontend-main/deploy.sh

# Stop any existing services first
./stop-all.sh

# Deploy everything
./deploy-all.sh
```

## Individual Service Deployment

### 1. Smart Contracts

```bash
cd contracts
cp .env.example .env
# Edit .env with your PRIVATE_KEY and CRONOS_TESTNET_RPC
npm install
npx hardhat compile
npm run deploy:testnet
```

### 2. Agent Service

```bash
cd agent-service
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Check for .env file
- Install dependencies
- Build TypeScript
- Start the service on port 3000

### 3. Frontend

```bash
cd frontend
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Check for .env.local file
- Install dependencies
- Build Next.js app
- Start the service on port 3001

### 4. Frontend-Main

```bash
cd frontend-main
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Check for .env.local file
- Install dependencies
- Build Next.js app
- Start the service on port 3000

## Configuration Files

### contracts/.env
```env
PRIVATE_KEY=0xyour_test_wallet_private_key
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
```

### agent-service/.env
```env
OPENAI_API_KEY=sk-...
CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
SIMPLE_VAULT_ADDRESS=0x...
PORT=3000
AGENT_PRIVATE_KEY=0x...
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_CRONOS_RPC=https://evm-t3.cronos.org
```

### frontend-main/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_CRONOS_RPC=https://evm-t3.cronos.org
```

## Service Management

### Stop All Services
```bash
./stop-all.sh
```

### Check Service Status
```bash
# Check if services are running
lsof -i:3000  # Agent service / Frontend-main
lsof -i:3001  # Frontend
```

### View Logs
```bash
# Agent service logs
cd agent-service && npm run dev

# Frontend logs
cd frontend && npm run dev

# Frontend-main logs
cd frontend-main && npm run dev
```

## Deployment Workflow

1. **Configure Environment Files**
   - Set up all .env files with proper values
   - Ensure PRIVATE_KEY has testnet CRO

2. **Deploy Contracts**
   - Deploys SimpleVault to Cronos testnet
   - Copy deployed address to service configs

3. **Deploy Backend**
   - Agent service starts on port 3000
   - Provides API endpoints for frontends

4. **Deploy Frontends**
   - Frontend on port 3001
   - Frontend-main on port 3000 (or different port)

5. **Verify Deployment**
   ```bash
   # Test agent service
   curl http://localhost:3000/health
   
   # Test frontend
   curl http://localhost:3001
   
   # Test frontend-main
   curl http://localhost:3000
   ```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start services with PM2
cd agent-service
pm2 start npm --name "agent-service" -- start

cd ../frontend
pm2 start npm --name "frontend" -- start

cd ../frontend-main
pm2 start npm --name "frontend-main" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker (Alternative)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'
services:
  agent-service:
    build: ./agent-service
    ports:
      - "3000:3000"
    env_file:
      - ./agent-service/.env
    
  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    env_file:
      - ./frontend/.env.local
    
  frontend-main:
    build: ./frontend-main
    ports:
      - "3002:3000"
    env_file:
      - ./frontend-main/.env.local
```

Then run:
```bash
docker-compose up -d
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Build Failures
```bash
# Clean and rebuild
cd agent-service
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Loading
- Ensure .env files are in correct locations
- Check file permissions: `chmod 600 .env`
- Verify no trailing spaces in values

### Contract Deployment Fails
- Ensure wallet has testnet CRO
- Check RPC endpoint is accessible
- Verify PRIVATE_KEY format (must start with 0x)

## Health Checks

```bash
# Agent service
curl http://localhost:3000/health

# Check vault endpoint
curl http://localhost:3000/vault/0xYourAddress

# Test AI agent
curl -X POST http://localhost:3000/agent \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello"}'
```

## Monitoring

### View All Running Services
```bash
ps aux | grep node
```

### Monitor Logs in Real-Time
```bash
# With PM2
pm2 logs

# Without PM2
tail -f agent-service/logs/*.log
```

## Security Notes

- Never commit .env files
- Use test wallets only for testnet
- Rotate API keys regularly
- Use HTTPS in production
- Enable CORS properly for production domains

## Next Steps

After successful deployment:
1. Test all API endpoints
2. Connect wallet to frontend
3. Perform test deposit
4. Verify AI agent recommendations
5. Test settlement flows

## Support

For issues or questions:
- Check logs in each service directory
- Review error messages carefully
- Ensure all prerequisites are met
- Verify network connectivity to Cronos testnet
