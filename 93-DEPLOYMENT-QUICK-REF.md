# Deployment Quick Reference

## 🚀 Quick Start

```bash
# Deploy all services
bash deploy-all.sh

# Stop all services
bash stop-all.sh
```

## 📋 What Gets Deployed

1. **Agent Service** (port 3000)
   - Backend API for AI agents
   - Blockchain interaction
   - Settlement processing

2. **Frontend** (port 3001)
   - User interface for vault management
   - Agent monitoring dashboard

3. **Frontend-Main** (port 3000 or alternative)
   - Main application interface
   - Wallet connection
   - Transaction management

## ⚙️ Configuration Required

Before deploying, ensure these files exist:

- `agent-service/.env`
- `frontend/.env.local`
- `frontend-main/.env.local`

Scripts will create them from examples if missing.

## 🔍 Verify Deployment

```bash
# Check agent service
curl http://localhost:3000/health

# Check running services
lsof -i:3000 -i:3001

# View logs
tail -f /tmp/deploy-test.log
```

## 🛑 Stop Services

```bash
# Stop all
bash stop-all.sh

# Or manually
kill $(lsof -ti:3000,3001)
```

## 📝 Notes

- Contracts are deployed manually (not in automated script)
- Services run in background
- Build time: ~30-60 seconds
- All scripts are in project root and service folders
