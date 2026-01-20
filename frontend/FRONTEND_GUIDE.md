# 🚀 Cronos AI Vault Platform - Frontend User Guide

## Overview

The Cronos AI Vault Platform frontend is a fully functional Web3 application that allows users to interact with the SimpleVault smart contract on Cronos Testnet. It integrates MetaMask wallet connection, real-time blockchain data, and AI-powered agent recommendations.

---

## 🌟 Features

### 1. **Wallet Integration**
- **MetaMask Connection**: One-click wallet connection
- **Network Detection**: Automatically detects if you're on Cronos Testnet
- **Network Switching**: Prompts to switch or add Cronos Testnet if needed
- **Account Display**: Shows connected wallet address
- **Auto-fill**: Automatically fills user address in agent console

### 2. **Vault Interaction** (Dashboard)
- **Real-time Balance**: View your vault balance from the blockchain
- **Recommended Limit**: See AI-recommended withdrawal limits
- **Deposit**: Deposit TCRO into the vault
- **Withdraw**: Withdraw TCRO from the vault
- **Transaction Tracking**: View transactions on Cronos Explorer
- **Auto-refresh**: Refresh vault data after transactions

### 3. **Agent Console**
- **AI Agent Execution**: Run AI-powered agents with real user data
- **Multiple Agents**:
  - Portfolio Rebalancer AI
  - Withdrawal Risk Sentinel
  - Settlement Batch Optimizer
  - Emergency Brake
- **Real-time Decisions**: Get AI recommendations based on blockchain state
- **Parameter Input**: Customize agent parameters (amount, risk triggers)
- **Decision Results**: View detailed agent decisions and reasoning

### 4. **Settlement Workflows**
- **x402 Settlement**: Execute settlement workflows
- **Batch Processing**: Process multiple settlements efficiently

---

## 🔧 Setup Instructions

### Prerequisites
1. **MetaMask** browser extension installed
2. **Cronos Testnet** configured in MetaMask
3. **Test CRO** tokens in your wallet ([Get from faucet](https://cronos.org/faucet))

### Installation
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will be available at: **http://localhost:3001**

---

## 📱 How to Use

### Step 1: Connect Your Wallet
1. Click **"Connect Wallet"** button in the top-right corner
2. Approve MetaMask connection
3. If not on Cronos Testnet, click **"Switch to Cronos Testnet"**
4. Your wallet address will appear once connected

### Step 2: Interact with the Vault (Dashboard)
1. Navigate to the **Dashboard** (home page)
2. View your current vault balance and recommended limit
3. **To Deposit**:
   - Enter amount in TCRO
   - Click "Deposit"
   - Approve transaction in MetaMask
   - Wait for confirmation
4. **To Withdraw**:
   - Enter amount in TCRO
   - Click "Withdraw"
   - Approve transaction in MetaMask
   - Wait for confirmation
5. Click **"Refresh"** to update balances

### Step 3: Use the Agent Console
1. Navigate to **"Agent Console"** from the menu
2. Your wallet address is auto-filled
3. Select an agent from the list
4. Enter parameters:
   - **Requested Amount**: Amount you want to withdraw (optional)
   - **Risk Trigger**: Select risk level (NONE, LOW, MEDIUM, HIGH, CRITICAL)
5. Click **"Execute Agent"**
6. View the decision result:
   - Recommended limit
   - Decision reasoning
   - Risk assessment
   - AI insights (if AI mode enabled)

### Step 4: Run Settlements
1. Navigate to **"Settlements"**
2. Enter settlement parameters
3. Click **"Run Settlement"**
4. View settlement results

---

## 🔗 Contract Information

- **SimpleVault Address**: `0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a`
- **Network**: Cronos Testnet (Chain ID: 338)
- **RPC URL**: `https://evm-t3.cronos.org`
- **Explorer**: [https://explorer.cronos.org/testnet](https://explorer.cronos.org/testnet)

---

## 🎨 Pages Overview

### 1. Dashboard (`/`)
- Service status indicators
- Wallet connection
- Vault interaction (deposit/withdraw)
- Available agents overview
- Quick action links

### 2. Agent Console (`/agents`)
- Wallet connection
- Agent selection
- Parameter input
- Real-time execution
- Decision results with AI reasoning

### 3. Settlements (`/settlements`)
- Settlement workflow execution
- Batch processing
- Transaction history

---

## 🛠️ Technical Stack

- **Framework**: Next.js 14
- **Web3 Library**: ethers.js v6
- **Styling**: Custom CSS with responsive design
- **API Client**: Axios
- **Wallet**: MetaMask integration
- **Blockchain**: Cronos Testnet

---

## 🔐 Security Notes

1. **Testnet Only**: This application is configured for Cronos Testnet
2. **No Real Funds**: Only use test CRO tokens
3. **Transaction Approval**: Always review transactions in MetaMask
4. **Private Keys**: Never share your private keys or seed phrase

---

## 🐛 Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed and unlocked
- Refresh the page and try again
- Check browser console for errors

### Wrong Network
- Click "Switch to Cronos Testnet" button
- Manually add Cronos Testnet in MetaMask if needed

### Transaction Fails
- Ensure you have enough TCRO for gas fees
- Check if you have sufficient vault balance for withdrawals
- Verify withdrawal amount doesn't exceed recommended limit

### Balance Not Updating
- Click the "Refresh" button
- Wait a few seconds for blockchain confirmation
- Check transaction on Cronos Explorer

---

## 📊 Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SIMPLE_VAULT_ADDRESS=0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
NEXT_PUBLIC_CRONOS_TESTNET_RPC=https://evm-t3.cronos.org
NEXT_PUBLIC_CRONOS_TESTNET_CHAIN_ID=338
```

---

## 🎯 Next Steps

1. **Get Test CRO**: Visit [Cronos Faucet](https://cronos.org/faucet)
2. **Deposit Funds**: Use the vault interaction to deposit TCRO
3. **Run Agents**: Execute AI agents to get withdrawal recommendations
4. **Test Withdrawals**: Try withdrawing within recommended limits

---

## 📞 Support

For issues or questions:
- Check the browser console for error messages
- Verify all services are running (agent-service on port 3000)
- Ensure MetaMask is properly configured

---

**Happy Testing! 🎉**

