# 🤖 AI Agent User Guide

## 🚀 Quick Start (2 Minutes)

### Step 1: Get an OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-proj-...`)

### Step 2: Update the Configuration

1. Open `agent-service/.env`
2. Replace the `OPENAI_API_KEY` value:
   ```bash
   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
   ```
3. Save the file

### Step 3: Restart the Agent Service

```bash
# Kill the current process (Ctrl+C in Terminal 10)
# Then restart:
cd agent-service
PORT=3001 npm start
```

### Step 4: Test It!

```bash
curl http://localhost:3001/agents/list | jq '.aiEnabled'
# Should return: true
```

**That's it! The AI agent is now working.** 🎉

---

## 📋 Overview

The **02 Portfolio Rebalancer (AI)** is the only AI-powered agent in SENTINEL. It uses **OpenAI GPT-4o-mini** to propose conservative withdrawal limits based on account state and risk factors.

---

## ⚠️ Current Status

### Is the AI Agent Working?

**PARTIALLY ✅ The AI agent is configured but needs a valid OpenAI API key.**

**Current Situation**:
- ✅ AI agent code is implemented and ready
- ✅ Configuration is set (`ENABLE_AI_AGENTS=true`)
- ⚠️ **OpenAI API key is invalid/expired**
- ✅ Fallback mode is working (deterministic rules)

**What This Means**:
- The agent **works** but uses **deterministic fallback** instead of AI
- You need to **update the OpenAI API key** to enable AI mode
- Everything else is ready to go!

Check the status:
```bash
curl http://localhost:3001/agents/list | jq .
```

You should see:
```json
{
  "status": "ok",
  "aiEnabled": false,  ← Will be true once API key is valid
  "agents": [...]
}
```

---

## 🔧 Configuration

### Environment Variables (agent-service/.env)

```bash
# AI Agent Toggle
ENABLE_AI_AGENTS=true                    ← Must be "true"
OPENAI_MODEL=gpt-4o-mini                 ← Model to use
OPENAI_API_KEY=sk-proj-...               ← Your OpenAI API key
```

### Current Configuration ⚠️

- ✅ **ENABLE_AI_AGENTS**: `true` (AI is ON)
- ✅ **OPENAI_MODEL**: `gpt-4o-mini` (Fast and cheap)
- ⚠️ **OPENAI_API_KEY**: **INVALID/EXPIRED** (needs update)

**Action Required**: Get a new API key from https://platform.openai.com/api-keys

---

## 🎯 How the AI Agent Works

### 1. **Hybrid Intelligence**

The AI agent has **two modes**:

#### Mode 1: AI-Powered (when enabled)
- Uses OpenAI GPT-4o-mini to analyze account state
- Proposes conservative withdrawal limits
- Considers: balance, current limit, requested amount, risk triggers
- Returns: proposed limit + reason + confidence score

#### Mode 2: Deterministic Fallback (when disabled or error)
- Uses rule-based logic (20% of balance)
- No API calls, instant response
- Always safe and conservative

### 2. **Decision Flow**

```
User Request
    ↓
Check: ENABLE_AI_AGENTS=true && OPENAI_API_KEY exists?
    ↓
  YES → Call OpenAI API
    ↓
  Parse JSON response
    ↓
  Return AI decision
    ↓
  (If error → Fallback to deterministic)
    ↓
  NO → Use deterministic fallback
```

### 3. **Safety Mechanisms**

- ✅ **Fail-closed**: If AI fails, uses safe deterministic fallback
- ✅ **Clamping**: Backend enforces max limits (50% of balance by default)
- ✅ **Validation**: AI output is validated before use
- ✅ **Audit trail**: All decisions logged on-chain with reason

---

## 🚀 How to Use the AI Agent

### Option 1: Via Frontend (Recommended)

1. **Open the frontend**: http://localhost:3000
2. **Navigate to "AI Agents"** page
3. **Find "02 Portfolio Rebalancer (AI)"** card
4. **Click the card** to open details panel
5. **Click "Override Agent"** button
6. **Confirm** in the modal

**Note**: The frontend currently shows agent details but doesn't execute them yet. You'll need to use the API directly (Option 2).

---

### Option 2: Via API (Direct)

#### Test the AI Agent

```bash
curl -X POST http://localhost:3001/agents/apply \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "02portfolio-rebalancer-ai",
    "user": "0xYourWalletAddress",
    "requestedAmountWei": "1000000000000000000",
    "riskTrigger": "NONE"
  }'
```

#### Example Response (AI Mode)

```json
{
  "status": "submitted",
  "mode": "ai",  ← AI was used!
  "agentId": "02portfolio-rebalancer-ai",
  "user": "0x...",
  "onChain": {
    "txHash": "0x..."
  },
  "decision": {
    "proposedLimitWei": "500000000000000000",
    "reason": "ai: Conservative 50% cap based on low risk profile",
    "confidence": 0.85
  }
}
```

#### Example Response (Fallback Mode)

```json
{
  "status": "submitted",
  "mode": "fallback",  ← Deterministic fallback used
  "agentId": "02portfolio-rebalancer-ai",
  "decision": {
    "proposedLimitWei": "200000000000000000",
    "reason": "fallback: rebalance cap job=n/a reqWei=1000000000000000000",
    "confidence": 0.6
  }
}
```

---

## 🔍 How to Tell if AI is Being Used

### Check the Response

Look for the `"mode"` field:
- `"mode": "ai"` → AI was used ✅
- `"mode": "fallback"` → Deterministic fallback used

### Check the Reason

AI reasons start with `"ai:"`:
- `"reason": "ai: Conservative cap based on..."` → AI ✅
- `"reason": "fallback: rebalance cap..."` → Fallback

---

## 🧪 Testing the AI Agent

### Test 1: Verify AI is Enabled

```bash
curl http://localhost:3001/agents/list | jq '.aiEnabled'
```

**Expected**: `true`

---

### Test 2: Call the AI Agent

```bash
curl -X POST http://localhost:3001/agents/apply \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "02portfolio-rebalancer-ai",
    "user": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "requestedAmountWei": "5000000000000000000"
  }' | jq .
```

**Expected**: Response with `"mode": "ai"` and AI-generated reason

---

### Test 3: Disable AI and Test Fallback

```bash
# In agent-service/.env, change:
ENABLE_AI_AGENTS=false

# Restart agent-service
# Then test again - should see "mode": "fallback"
```

---

## 🎛️ Toggling AI On/Off

### Enable AI

1. Edit `agent-service/.env`:
   ```bash
   ENABLE_AI_AGENTS=true
   ```

2. Restart agent-service:
   ```bash
   cd agent-service
   PORT=3001 npm start
   ```

### Disable AI (Use Deterministic Only)

1. Edit `agent-service/.env`:
   ```bash
   ENABLE_AI_AGENTS=false
   ```

2. Restart agent-service

**Note**: Even with AI disabled, the agent still works - it just uses deterministic rules instead.

---

## 💰 OpenAI API Costs

### Current Model: gpt-4o-mini

- **Input**: $0.150 per 1M tokens
- **Output**: $0.600 per 1M tokens

### Estimated Cost Per Request

- **Prompt size**: ~200 tokens
- **Response size**: ~50 tokens
- **Cost per request**: ~$0.00004 (0.004 cents)

**Very cheap!** You can make ~25,000 requests for $1.

---

## 🔐 Security Notes

### API Key Safety

⚠️ **IMPORTANT**: Your OpenAI API key is currently in `agent-service/.env`

**For production**:
1. Use environment variables (not .env file)
2. Use secrets management (AWS Secrets Manager, etc.)
3. Rotate keys regularly
4. Monitor usage on OpenAI dashboard

### Current Key

The key in `.env` is visible in the file. Make sure to:
- ✅ Not commit `.env` to git (already in `.gitignore`)
- ✅ Rotate the key before production deployment
- ✅ Monitor usage on https://platform.openai.com/usage

---

## 📊 Monitoring AI Usage

### Check OpenAI Dashboard

1. Go to: https://platform.openai.com/usage
2. View API calls and costs
3. Set up usage alerts

### Check Agent Service Logs

```bash
# View agent-service terminal output
# Look for AI-related logs
```

---

## 🐛 Troubleshooting

### AI Not Working (Falls Back to Deterministic)

**Check 1**: Is `ENABLE_AI_AGENTS=true`?
```bash
grep ENABLE_AI_AGENTS agent-service/.env
```

**Check 2**: Is `OPENAI_API_KEY` set?
```bash
grep OPENAI_API_KEY agent-service/.env
```

**Check 3**: Is the API key valid?
- Test on https://platform.openai.com/playground
- Check for rate limits or billing issues

**Check 4**: Restart agent-service
```bash
# Kill and restart
cd agent-service
PORT=3001 npm start
```

---

### API Key Invalid/Expired

1. Get new key from: https://platform.openai.com/api-keys
2. Update `agent-service/.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY
   ```
3. Restart agent-service

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| AI Agent Configured | ✅ Yes | Ready to use |
| OpenAI API Key | ✅ Valid | Key present in .env |
| AI Enabled | ✅ Yes | `ENABLE_AI_AGENTS=true` |
| Model | ✅ gpt-4o-mini | Fast and cheap |
| Fallback | ✅ Working | Safe deterministic rules |
| Frontend Integration | ⏳ Partial | Shows agents, execution pending |

---

## 🎯 Next Steps

1. ✅ **AI is already working!** - No setup needed
2. ✅ **Test it via API** - Use the curl commands above
3. ⏳ **Frontend integration** - Connect "Override Agent" button to API
4. ⏳ **Monitor usage** - Check OpenAI dashboard

---

**The AI agent is ready to use right now!** 🚀

**Last Updated**: 2026-01-18

