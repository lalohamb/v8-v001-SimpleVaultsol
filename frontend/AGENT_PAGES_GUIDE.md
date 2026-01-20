# 🤖 Individual Agent Pages - User Guide

## Overview

Each AI agent now has its own dedicated page with detailed information, parameter inputs, and execution capabilities. Users can explore agents individually and execute them with custom parameters.

---

## 📁 Page Structure

### **1. Agents Index Page** (`/agents`)
**URL**: http://localhost:3001/agents

**Features**:
- ✅ Overview of all available agents
- ✅ Agent statistics (total, AI-powered, deterministic)
- ✅ Agent library grid with cards
- ✅ Quick action shortcuts
- ✅ Category badges (AI-Powered, Risk Management, etc.)
- ✅ Feature tags for each agent
- ✅ Click any agent to view details

**What You See**:
- **Stats Bar**: Total agents, AI-powered count, deterministic count
- **Agent Cards**: Each agent displayed with icon, name, description, features
- **Quick Actions**: Direct links to popular agents

---

### **2. Individual Agent Pages** (`/agents/[agentId]`)

Each agent has a dedicated page with comprehensive information:

#### **Portfolio Rebalancer AI** (`/agents/02portfolio-rebalancer-ai`)
**Icon**: 🧠  
**Category**: AI-Powered

**About**:
Uses OpenAI GPT-4 to analyze your vault state and provide intelligent withdrawal limit recommendations. Falls back to deterministic rules (20% of balance) if AI is unavailable.

**Parameters**:
- **User Address** (required): Wallet address to analyze
- **Requested Amount** (optional): Amount you want to withdraw in TCRO
- **Risk Trigger** (optional): Current risk level (NONE, LOW, MEDIUM, HIGH, CRITICAL)

**Decision Logic**:
- AI Mode: Uses GPT-4 to analyze context and propose limits (confidence: 0.85)
- Fallback: 20% of balance (confidence: 0.6)

**Use Cases**:
- Portfolio rebalancing decisions
- Conservative withdrawal planning
- AI-powered risk assessment
- Dynamic limit adjustments

---

#### **Withdrawal Risk Sentinel** (`/agents/withdrawal-risk-sentinel`)
**Icon**: ⚠️  
**Category**: Risk Management

**About**:
Continuously monitors your vault and adjusts limits to reduce drain risk. Initial limit is 50% of balance, then tightens by 5% on each subsequent check to prevent rapid depletion.

**Parameters**:
- **User Address** (required): Wallet address to analyze
- **Requested Amount** (optional): Amount you're considering withdrawing in TCRO

**Decision Logic**:
- Initial: 50% of balance
- Subsequent: Tightens by 5% from current limit (confidence: 0.7)

**Use Cases**:
- Continuous risk monitoring
- Gradual limit tightening
- Drain risk prevention
- Dynamic safety adjustments

---

#### **Emergency Brake** (`/agents/emergency-brake`)
**Icon**: 🚨  
**Category**: Emergency Response

**About**:
Triggers emergency stops and aggressively clamps withdrawal limits during crisis situations. Responds to risk triggers by reducing limits to protect your vault.

**Parameters**:
- **User Address** (required): Wallet address to analyze
- **Risk Trigger** (required): Risk level triggering the emergency brake (NONE, LOW, MEDIUM, HIGH, CRITICAL)

**Decision Logic**:
- Severe risk (not NONE): 10% of balance (confidence: 0.85)
- Normal: 25% of balance (confidence: 0.6)

**Use Cases**:
- Emergency situations
- Market volatility protection
- Anomaly detection response
- Crisis management

---

#### **Settlement Batch Optimizer** (`/agents/settlement-batch-optimizer`)
**Icon**: 📦  
**Category**: Settlement

**About**:
Designed for x402 payment-gated settlement workflows. Computes safe caps for batch operations, ensuring settlements stay within conservative limits.

**Parameters**:
- **User Address** (required): Wallet address to analyze
- **Requested Amount** (optional): Settlement amount requested in TCRO
- **Job ID** (optional): Job ID for tracking settlement workflows

**Decision Logic**:
- Baseline: 40% of balance
- If amount requested: min(requested, baseline) (confidence: 0.75)

**Use Cases**:
- x402 settlement workflows
- Batch payment processing
- Multi-step settlements
- Gas optimization

---

## 🎯 How to Use

### **Step 1: Browse Agents**
1. Navigate to http://localhost:3001/agents
2. View all available agents in the library
3. Read descriptions and features
4. Click on any agent card to view details

### **Step 2: View Agent Details**
1. Click on an agent card
2. Read the detailed description
3. Review the decision logic
4. Check the use cases
5. See what parameters are required

### **Step 3: Execute an Agent**
1. Connect your wallet (if not already connected)
2. Your wallet address is auto-filled
3. Fill in optional parameters:
   - **Requested Amount**: Enter amount in TCRO
   - **Risk Trigger**: Select risk level
   - **Job ID**: Enter job ID (for settlement agent)
4. Click "Execute [Agent Name]" button
5. Wait for the decision result

### **Step 4: Review Results**
1. View the recommended withdrawal limit
2. Read the agent's reasoning
3. Check the confidence score
4. See AI insights (for AI-powered agents)
5. Review any clamp notes or safety adjustments

---

## 🎨 Page Features

### **Agent Index Page**
- **Statistics Dashboard**: Quick overview of agent counts
- **Agent Library Grid**: Visual cards with icons and features
- **Category Badges**: Identify agent types at a glance
- **Feature Tags**: See key capabilities
- **Quick Actions**: Shortcuts to popular agents
- **Hover Effects**: Interactive card animations

### **Individual Agent Pages**
- **Two-Column Layout**: Info on left, execution on right
- **Wallet Integration**: Auto-fill user address
- **Parameter Forms**: Dynamic forms based on agent requirements
- **Real-time Execution**: Execute agents with one click
- **Decision Display**: Comprehensive result visualization
- **Responsive Design**: Works on mobile and desktop

---

## 🔗 Navigation

### **From Dashboard**:
- Click "Agent Library" in quick actions
- Click any agent card in the "Registered Agents" section

### **From Agents Index**:
- Click any agent card
- Use quick action shortcuts at the bottom

### **From Individual Agent Page**:
- Click "← All Agents" to return to index
- Use navigation menu to go to Dashboard or Settlements

---

## 📊 Agent Comparison

| Agent | Type | Baseline | Confidence | Best For |
|-------|------|----------|------------|----------|
| Portfolio Rebalancer AI | AI-Powered | 20% | 0.85 (AI) / 0.6 (fallback) | Intelligent decisions |
| Withdrawal Risk Sentinel | Deterministic | 50% → 95% of current | 0.7 | Continuous monitoring |
| Emergency Brake | Deterministic | 10-25% | 0.85 (severe) / 0.6 (normal) | Crisis situations |
| Settlement Batch Optimizer | Deterministic | 40% | 0.75 | Settlement workflows |

---

## 🎯 Tips for Best Results

1. **Connect Wallet First**: Auto-fills your address and enables real data
2. **Start with Risk Sentinel**: Good for general monitoring
3. **Use AI Rebalancer**: For intelligent, context-aware decisions
4. **Emergency Brake**: Only when you detect actual risk
5. **Settlement Optimizer**: Specifically for x402 workflows

---

## 🚀 Example Workflows

### **Workflow 1: Check Safe Withdrawal**
1. Go to `/agents/withdrawal-risk-sentinel`
2. Connect wallet (address auto-fills)
3. Enter requested amount: `5` TCRO
4. Click "Execute"
5. Review recommended limit

### **Workflow 2: Get AI Recommendation**
1. Go to `/agents/02portfolio-rebalancer-ai`
2. Connect wallet
3. Enter requested amount: `10` TCRO
4. Select risk trigger: `MEDIUM`
5. Click "Execute"
6. Read AI reasoning and insights

### **Workflow 3: Emergency Protection**
1. Go to `/agents/emergency-brake`
2. Connect wallet
3. Select risk trigger: `CRITICAL`
4. Click "Execute"
5. See aggressive limit clamping (10%)

---

## 📁 File Structure

```
frontend/src/pages/
├── agents/
│   ├── index.tsx              # Agents library page
│   └── [agentId].tsx          # Dynamic individual agent pages
└── index.tsx                  # Dashboard (updated with links)
```

---

## ✅ What's New

- ✅ Individual page for each agent
- ✅ Detailed agent descriptions
- ✅ Parameter documentation
- ✅ Use case examples
- ✅ Decision logic explanations
- ✅ Dynamic parameter forms
- ✅ Agent library overview
- ✅ Quick action shortcuts
- ✅ Category and feature badges
- ✅ Responsive design
- ✅ Wallet integration
- ✅ Real-time execution

---

**Explore the agents at**: http://localhost:3001/agents 🚀

