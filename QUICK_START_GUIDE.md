# 🚀 SENTINEL - Quick Start Guide

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ MetaMask browser extension installed
- ✅ Git installed

---

## ⚡ Quick Start (5 minutes)

### 1. Start Agent Service (Terminal 1)
```bash
cd agent-service
npm install  # First time only
PORT=3001 npm start
```

**Expected Output**:
```
Agent Service running on port 3001
```

**Verify**: http://localhost:3001/health should return `{"status":"ok"}`

---

### 2. Start Frontend (Terminal 2)
```bash
cd frontend-main
npm install  # First time only
npm run dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully in 2.2s
```

**Verify**: http://localhost:3000 should load the dashboard

---

### 3. Configure MetaMask

#### Add Cronos Testnet (Auto or Manual)

**Option A: Automatic** (Recommended)
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Approve "Add Network" prompt
5. Done! ✅

**Option B: Manual**
1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter details:
   - **Network Name**: Cronos Testnet
   - **RPC URL**: https://evm-t3.cronos.org
   - **Chain ID**: 338
   - **Currency Symbol**: TCRO
   - **Block Explorer**: https://explorer.cronos.org/testnet
4. Click "Save"

#### Get Test CRO (Optional)
1. Visit: https://cronos.org/faucet
2. Enter your wallet address
3. Request testnet CRO
4. Wait ~30 seconds

---

## 🎯 Using the Dashboard

### Overview Page
- **View vault balance**: Connect wallet first
- **Monitor system health**: Auto-updates every 30s
- **Check agent states**: See active/paused counts
- **Review recent events**: Latest operations

### AI Agents Page
- **View all agents**: 4 agents (3 deterministic + 1 AI)
- **Click agent card**: See details in side panel
- **Override agent**: Manual intervention (requires confirmation)

### Vault Controls Page
- **Emergency Brake**: Toggle to halt all operations
- **Request Withdrawal**: Enter amount and submit
- **Adjust Limits**: Modify withdrawal limits
- **Auto-Execution**: Enable/disable automated actions

### x402 Transactions Page
- **View lifecycle**: 5-step payment-gated flow
- **See HTTP 402 example**: Protocol demonstration
- **Transaction history**: All payment operations

### Monitoring & Logs Page
- **Filter logs**: By severity, agent, or subsystem
- **Export logs**: Download as JSON
- **Real-time view**: System events

### Architecture Page
- **System overview**: Component diagram
- **Tech stack**: All technologies used
- **Security measures**: Safety mechanisms

---

## 🔧 Troubleshooting

### Frontend won't start
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart
cd frontend-main
npm run dev
```

### Agent service won't start
```bash
# Kill any process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart
cd agent-service
PORT=3001 npm start
```

### "No agents available" error
1. Check agent-service is running: `curl http://localhost:3001/health`
2. Check `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. Restart frontend

### MetaMask network switch error
- **Fixed!** The "Cannot set chainId" error has been resolved
- If you still see it, refresh the page and try again

### Hydration errors in console
- **Fixed!** All hydration errors have been resolved
- If you see any, please report them

### Wallet won't connect
1. Make sure MetaMask is unlocked
2. Check you're on Cronos Testnet (or approve network switch)
3. Try disconnecting and reconnecting
4. Refresh the page

---

## 📊 Service Status Check

### Quick Health Check
```bash
# Frontend
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend DOWN"

# Agent Service
curl -s http://localhost:3001/health && echo "" && echo "✅ Agent Service OK" || echo "❌ Agent Service DOWN"
```

### View Running Processes
```bash
# Check what's running on ports
lsof -i :3000 -i :3001 | grep LISTEN
```

---

## 🎬 Demo Script

### 1. Overview (30 seconds)
1. Open http://localhost:3000
2. Point out: "This is SENTINEL, a mission-critical vault monitoring system"
3. Show: Vault balance, system health, agent states
4. Highlight: "Real-time data from Cronos blockchain"

### 2. AI Agents (1 minute)
1. Click "AI Agents" in sidebar
2. Show: 4 agents (3 deterministic + 1 AI)
3. Click: Settlement Batch Optimizer
4. Explain: "Hybrid intelligence - deterministic rules + AI advisor"
5. Show: Guardrails and decision history

### 3. Vault Controls (1 minute)
1. Click "Vault Controls"
2. Show: Emergency Brake
3. Explain: "Circuit breaker for all operations"
4. Show: Withdrawal request form
5. Explain: "All actions require confirmation and risk assessment"

### 4. x402 Transactions (1 minute)
1. Click "x402 Transactions"
2. Show: Transaction lifecycle diagram
3. Explain: "Payment-gated execution with HTTP 402 protocol"
4. Show: Transaction history
5. Click: A transaction to show details

### 5. Monitoring (30 seconds)
1. Click "Monitoring & Logs"
2. Show: Log filters
3. Demonstrate: Filter by severity
4. Show: Export functionality

### 6. Architecture (30 seconds)
1. Click "Architecture"
2. Show: System diagram
3. Explain: "Next.js frontend → Node.js backend → Solidity contracts → Cronos"
4. Highlight: x402 Payment Gate and Agent Layer

### 7. Wallet Integration (1 minute)
1. Click "Connect Wallet"
2. Approve MetaMask connection
3. Approve network switch
4. Show: Connected state with address
5. Go back to Overview
6. Show: Real vault balance now displayed

**Total Demo Time**: ~5-6 minutes

---

## 📁 Project Structure

```
v3 v001 SimpleVaultsol/
├── frontend-main/          # Next.js frontend
│   ├── app/               # Pages (Next.js App Router)
│   ├── components/        # React components
│   ├── lib/               # Utilities and services
│   ├── public/            # Static assets
│   └── .env.local         # Environment variables
├── agent-service/         # Backend API
│   ├── src/               # Source code
│   └── package.json       # Dependencies
├── contracts/             # Solidity smart contracts
└── docs/                  # Documentation
```

---

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main dashboard |
| Agent Service | http://localhost:3001 | Backend API |
| Health Check | http://localhost:3001/health | Service status |
| Agents List | http://localhost:3001/agents/list | Agent data |
| Cronos Testnet | https://evm-t3.cronos.org | RPC endpoint |
| Block Explorer | https://explorer.cronos.org/testnet | Blockchain explorer |
| Faucet | https://cronos.org/faucet | Get test CRO |

---

## 📚 Documentation

| Document | Description | Location |
|----------|-------------|----------|
| **Frontend Summary** | Complete feature overview | `frontend-main/FRONTEND_SUMMARY.md` |
| **Test Checklist** | Manual testing guide | `frontend-main/TEST_CHECKLIST.md` |
| **Test Report** | Automated test results | `FRONTEND_TEST_REPORT.md` |
| **Quick Start** | This guide | `QUICK_START_GUIDE.md` |

---

## 🆘 Support

### Common Issues

**Q: Frontend shows "No agents available"**  
A: Make sure agent-service is running on port 3001

**Q: Wallet won't connect**  
A: Check MetaMask is installed and unlocked

**Q: Network switch fails**  
A: Manually add Cronos Testnet to MetaMask

**Q: Page won't load**  
A: Check both services are running, refresh browser

**Q: Console shows errors**  
A: Most errors are non-critical. Check if functionality works.

---

## ✅ Pre-Demo Checklist

- [ ] Both services running (frontend + agent-service)
- [ ] MetaMask installed and unlocked
- [ ] Cronos Testnet added to MetaMask
- [ ] Test CRO in wallet (optional)
- [ ] Browser at http://localhost:3000
- [ ] Console open (F12) to show no errors
- [ ] Wallet connected and showing balance
- [ ] All pages tested and working

---

**Ready to go!** 🚀

**Last Updated**: 2026-01-18  
**Version**: 1.0.0

