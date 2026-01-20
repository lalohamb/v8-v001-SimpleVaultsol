# 🎬 Cronos AI Vault Platform - Demo Walkthrough

## 🚀 Quick Start Demo

This guide walks you through a complete demonstration of the fully functional frontend with real blockchain interactions.

---

## 📋 Prerequisites

Before starting the demo:
- ✅ MetaMask browser extension installed
- ✅ Cronos Testnet added to MetaMask
- ✅ Test CRO tokens in your wallet ([Get from faucet](https://cronos.org/faucet))
- ✅ Both services running:
  - Agent service on http://localhost:3000
  - Frontend on http://localhost:3001

---

## 🎯 Demo Scenario: Complete User Journey

### **Scene 1: Initial Setup** (2 minutes)

1. **Open the Application**
   - Navigate to http://localhost:3001
   - You'll see the dashboard with service status

2. **Connect Your Wallet**
   - Click "Connect Wallet" button (top-right)
   - MetaMask popup appears
   - Click "Next" → "Connect"
   - Your wallet address appears in the header

3. **Switch to Cronos Testnet** (if needed)
   - If you see a yellow warning: "Wrong Network"
   - Click "Switch to Cronos Testnet"
   - MetaMask will prompt to switch networks
   - Approve the switch

**Expected Result**: 
- ✅ Wallet connected
- ✅ Green "Cronos Testnet" indicator visible
- ✅ Your address displayed (e.g., `0x1234...5678`)

---

### **Scene 2: Vault Interaction** (5 minutes)

4. **View Your Vault Balance**
   - Look at the left side of the dashboard
   - You'll see two cards:
     - **Balance**: Your current vault balance (initially 0 TCRO)
     - **Recommended Limit**: AI-recommended withdrawal limit

5. **Deposit TCRO into Vault**
   - In the "Deposit" section, enter: `10`
   - Click "Deposit" button
   - MetaMask popup appears showing:
     - Amount: 10 TCRO
     - Gas fee: ~0.0001 TCRO
   - Click "Confirm"
   - Wait for transaction confirmation (~5 seconds)
   - Green success message appears with transaction hash
   - Click the explorer link to view on Cronos Explorer

6. **Verify Balance Updated**
   - Balance card now shows: `10.000000 TCRO`
   - Recommended Limit may update based on AI analysis

7. **Withdraw TCRO from Vault**
   - In the "Withdraw" section, enter: `2`
   - Click "Withdraw" button
   - MetaMask popup appears
   - Click "Confirm"
   - Wait for confirmation
   - Balance updates to: `8.000000 TCRO`

**Expected Result**:
- ✅ Deposit successful
- ✅ Balance shows 8 TCRO
- ✅ Transaction visible on Cronos Explorer
- ✅ All data is real from blockchain

---

### **Scene 3: AI Agent Execution** (5 minutes)

8. **Navigate to Agent Console**
   - Click "Agent Console" in the navigation menu
   - Your wallet address is auto-filled in the "User Address" field

9. **Select an Agent**
   - Choose "Portfolio Rebalancer AI" from the dropdown
   - Read the agent description

10. **Configure Parameters**
    - **User Address**: Already filled (your wallet)
    - **Requested Amount**: Enter `5` (5 TCRO)
    - **Risk Trigger**: Select "MEDIUM"

11. **Execute the Agent**
    - Click "Execute Agent" button
    - Wait 2-3 seconds for AI processing
    - Decision result appears below

12. **Review AI Decision**
    - **Recommended Limit**: e.g., `3.500000 TCRO`
    - **Decision**: "APPROVED" or "DENIED"
    - **Reasoning**: AI explanation of the decision
    - **Risk Assessment**: Risk level analysis
    - **AI Insights**: Additional AI-generated insights

**Expected Result**:
- ✅ Agent executes successfully
- ✅ Real-time decision based on your vault balance
- ✅ AI reasoning explains the recommendation
- ✅ Decision considers your actual blockchain state

---

### **Scene 4: Testing Different Scenarios** (5 minutes)

13. **Test Emergency Brake Agent**
    - Select "Emergency Brake" agent
    - Set Risk Trigger to "CRITICAL"
    - Execute agent
    - Observe how it responds to critical risk

14. **Test Withdrawal Risk Sentinel**
    - Select "Withdrawal Risk Sentinel"
    - Enter a large withdrawal amount: `100`
    - Execute agent
    - See how it denies risky withdrawals

15. **Test with Different Risk Levels**
    - Try the same withdrawal with different risk triggers:
      - NONE
      - LOW
      - MEDIUM
      - HIGH
      - CRITICAL
    - Observe how recommendations change

**Expected Result**:
- ✅ Different agents provide different insights
- ✅ Risk levels affect recommendations
- ✅ All decisions are based on real vault state

---

### **Scene 5: Real-time Updates** (3 minutes)

16. **Make Another Deposit**
    - Go back to Dashboard
    - Deposit another 5 TCRO
    - Balance updates to 13 TCRO

17. **Re-run Agent with New Balance**
    - Go to Agent Console
    - Execute the same agent again
    - Notice how recommendations change based on new balance

18. **Verify On-Chain**
    - Click any transaction hash link
    - View transaction on Cronos Explorer
    - Confirm all data matches

**Expected Result**:
- ✅ Agents adapt to new balance
- ✅ Recommendations update in real-time
- ✅ All transactions verifiable on-chain

---

## 🎭 Demo Script (For Presentation)

### **Opening** (30 seconds)
> "Welcome to the Cronos AI Vault Platform. This is a fully functional Web3 application that combines AI-powered decision-making with real blockchain interactions on Cronos Testnet. Let me show you how it works."

### **Wallet Connection** (1 minute)
> "First, I'll connect my MetaMask wallet. [Click Connect] As you can see, it automatically detects I'm on the wrong network and prompts me to switch to Cronos Testnet. [Click Switch] Perfect, now I'm connected."

### **Vault Interaction** (2 minutes)
> "Here on the dashboard, I can see my vault balance is currently zero. Let me deposit 10 TCRO. [Enter amount, click Deposit] MetaMask pops up to confirm the transaction. [Approve] And within seconds, my balance updates to 10 TCRO. This is real data from the blockchain, not a simulation."

### **AI Agent Demo** (3 minutes)
> "Now let's see the AI in action. I'll navigate to the Agent Console. Notice my wallet address is automatically filled in. I'll select the Portfolio Rebalancer AI and request to withdraw 5 TCRO with a medium risk level. [Execute] The AI analyzes my vault state and provides a recommendation. It suggests I can safely withdraw 3.5 TCRO based on my balance and risk profile. The reasoning explains why."

### **Different Scenarios** (2 minutes)
> "Let me try a risky scenario. I'll request to withdraw 100 TCRO - way more than I have. [Execute] As expected, the Withdrawal Risk Sentinel denies this and explains the risk. Now let me try the Emergency Brake with a critical risk trigger. [Execute] It immediately locks down withdrawals to protect the vault."

### **Closing** (30 seconds)
> "As you can see, this is a fully functional platform where users can interact with a real smart contract, get AI-powered recommendations, and execute transactions on Cronos Testnet. All data is real, all transactions are on-chain, and the AI adapts to real-time blockchain state."

---

## 📊 Key Demo Points to Highlight

1. **Real Blockchain Integration**
   - All data comes from the live contract
   - Transactions are executed on-chain
   - Verifiable on Cronos Explorer

2. **AI-Powered Decisions**
   - Multiple specialized agents
   - Real-time analysis of vault state
   - Adaptive recommendations

3. **User Experience**
   - One-click wallet connection
   - Automatic network switching
   - Real-time balance updates
   - Clear transaction feedback

4. **Security Features**
   - Risk-based recommendations
   - Emergency brake functionality
   - Withdrawal limits enforcement

---

## 🎥 Recording Tips

- **Screen Resolution**: 1920x1080 for best clarity
- **Browser Zoom**: 100% or 110% for visibility
- **MetaMask**: Have it unlocked before starting
- **Test CRO**: Ensure you have at least 20 TCRO
- **Network**: Confirm Cronos Testnet is added
- **Timing**: Each scene takes 2-5 minutes
- **Total Demo**: 15-20 minutes for full walkthrough

---

## ✅ Demo Checklist

Before starting the demo:
- [ ] Agent service running on port 3000
- [ ] Frontend running on port 3001
- [ ] MetaMask installed and unlocked
- [ ] Cronos Testnet configured
- [ ] Test CRO in wallet (at least 20 TCRO)
- [ ] Browser console closed (for clean UI)
- [ ] All previous transactions cleared (optional)

---

**Ready to Demo! 🚀**

