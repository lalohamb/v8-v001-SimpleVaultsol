# 🚀 SENTINEL Platform - Running Services

## ✅ Currently Running

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Terminal**: 5
- **Features**:
  - Dashboard with Overview, Agents, Vault, x402, Monitoring, Architecture pages
  - Wallet Connect button (top navigation)
  - Real-time data from agent-service
  - Real-time vault balance from smart contracts

### Agent Service (Backend API)
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Terminal**: 10
- **Endpoints**:
  - `GET /agents/list` - List all agents
  - `POST /agents/apply` - Execute an agent
  - `POST /settlement/run` - Run settlement (x402 protected)
  - `POST /settlement/pay` - Process payment
  - `GET /health` - Health check

## 🔧 Configuration

### Frontend Environment (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # Points to agent-service
NEXT_PUBLIC_SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
NEXT_PUBLIC_SETTLEMENT_PAYMENT_ADDRESS=0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0
NEXT_PUBLIC_CHAIN_ID=338
NEXT_PUBLIC_CHAIN_NAME=Cronos Testnet
NEXT_PUBLIC_RPC_URL=https://evm-t3.cronos.org
NEXT_PUBLIC_EXPLORER_URL=https://explorer.cronos.org/testnet
```

### Agent Service
- Runs on port 3001 (configured via `PORT=3001`)
- Connected to Cronos Testnet
- AI enabled (OpenAI integration)

## 📊 How to Use

### 1. Access the Frontend
Open your browser to: **http://localhost:3000**

### 2. Connect Your Wallet
1. Click **"Connect Wallet"** in the top navigation
2. Approve MetaMask connection
3. Switch to Cronos Testnet (automatic)
4. Your address will be displayed

### 3. View AI Agents
1. Click **"AI Agents"** in the sidebar
2. You should see 4 agents:
   - Settlement Batch Optimizer (Deterministic)
   - Withdrawal Risk Sentinel (Deterministic)
   - Emergency Brake (Deterministic)
   - 02 Portfolio Rebalancer (AI-Powered)

### 4. Check Overview
1. Click **"Overview"** in the sidebar
2. See your real vault balance (if connected)
3. View system health status
4. Monitor agent states

## 🛠️ Troubleshooting

### "Failed to load agents"
- ✅ **Fixed!** Agent-service is now running on port 3001
- Refresh the browser to see agents

### "Connect wallet to view balance"
- Click "Connect Wallet" in top navigation
- Make sure MetaMask is installed
- Switch to Cronos Testnet

### Services Not Running
If you need to restart:

**Frontend:**
```bash
cd frontend-main
npm run dev
# Runs on http://localhost:3000
```

**Agent Service:**
```bash
cd agent-service
PORT=3001 npm start
# Runs on http://localhost:3001
```

## 🎯 What's Working

✅ **Frontend** - All pages load correctly  
✅ **Wallet Connect** - MetaMask integration working  
✅ **Agent Service** - API responding correctly  
✅ **AI Agents Page** - Shows real agent list from backend  
✅ **Overview Page** - Shows real vault balance  
✅ **System Health** - Monitoring working  

## 📝 Next Steps

To fully test the integration:

1. **Deposit to Vault**
   - Go to Vault page (needs implementation)
   - Or use Hardhat console to deposit

2. **Execute an Agent**
   - Go to AI Agents page
   - Click on an agent
   - Execute (needs UI implementation)

3. **Test x402 Payment**
   - Go to x402 Transactions page
   - Try settlement workflow (needs implementation)

## 🔄 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Agent Service | 3001 | http://localhost:3001 |
| Cronos Testnet RPC | - | https://evm-t3.cronos.org |

## 🎉 Success!

Both services are running and integrated! 

**Refresh your browser now to see the AI Agents working!** 🚀

