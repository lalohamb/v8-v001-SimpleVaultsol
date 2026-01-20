I need to see what's in the current file and understand the context better to continue meaningfully.

## Detailed Technical Deep-Dive

Based on the codebase analysis, here's a comprehensive breakdown of the **clamp.ts** utility and its critical role in the platform's safety architecture:

---

## 🛡️ The Clamping System - Policy Enforcement Layer

The `clamp.ts` file implements the **deterministic safety envelope** that sits between AI agent decisions and on-chain execution. It's a critical security component that prevents agents from making dangerous recommendations.

### Core Function: `clampLimit()`

````typescript path=agent-service/src/agents/clamp.ts mode=EXCERPT
export function clampLimit(args: {
  balanceWei: bigint;
  proposedLimitWei: bigint;
  maxPct: number;           // e.g. 50
  maxAbsWei?: bigint | null; // optional
}): { finalWei: bigint; notes: string }
````

### Safety Rules (Applied in Order)

1. **Hard Cap**: Never exceed actual balance
2. **Percentage Cap**: Limit to X% of balance (default: 50%)
3. **Absolute Cap**: Optional hard limit in Wei
4. **Zero Prevention**: Avoid setting limit to 0 when balance exists

### Usage Across the Platform

The clamping function is invoked in **two critical paths**:

#### 1. **Agent Execution** (`/agents/apply`)
````typescript path=agent-service/src/routes/agents.ts mode=EXCERPT
const { finalWei, notes } = clampLimit({
  balanceWei,
  proposedLimitWei: decision.proposedLimitWei,
  maxPct,
  maxAbsWei
});
````

#### 2. **Settlement Workflows** (`/settlement/run`)
````typescript path=agent-service/src/routes/settlements.ts mode=EXCERPT
const { finalWei, notes } = clampLimit({
  balanceWei,
  proposedLimitWei: decision.proposedLimitWei,
  maxPct,
  maxAbsWei
});
````

---

## 🔄 Complete Agent Execution Flow

```
User Request → Agent.decide() → Clamping → On-Chain Write → Event Emission
```

### Example: Emergency Brake Agent

**Step 1**: Agent proposes 10% limit during volatility spike
```typescript
proposedLimitWei: (balanceWei * 10n) / 100n
```

**Step 2**: Clamping validates against policy
```typescript
maxPct = 50 // from env
pctCap = (balanceWei * 50n) / 100n
finalWei = min(proposedLimitWei, pctCap, balanceWei)
```

**Step 3**: Write to blockchain
```typescript
vault.agentSetWithdrawLimit(user, finalWei, reason)
```

---

## 🎯 Why This Architecture Matters

### 1. **Defense in Depth**
- Agents can be buggy or compromised
- Clamping provides a **non-bypassable safety layer**
- Even if AI hallucinates, clamp prevents catastrophic limits

### 2. **Governance-Friendly**
- Policy parameters (`MAX_RECOMMEND_PCT`, `MAX_RECOMMEND_WEI`) are environment variables
- Can be updated without code changes
- Enables gradual rollout (start conservative, relax over time)

### 3. **Auditability**
- `notes` field logs all clamping decisions
- Stored on-chain in `AgentRecommendation` event
- Full transparency for users and auditors

---

## 📊 Agent Decision Matrix

| Agent | Base Logic | Clamp Applied | Final Limit |
|-------|-----------|---------------|-------------|
| **Emergency Brake** | 10% (severe) / 25% (normal) | ≤50% of balance | min(proposed, 50%) |
| **Risk Sentinel** | 95% of current or 50% | ≤50% of balance | min(proposed, 50%) |
| **Settlement Optimizer** | 40% or requested amount | ≤50% of balance | min(proposed, 50%) |
| **Portfolio Rebalancer AI** | AI decision or 20% fallback | ≤50% of balance | min(proposed, 50%) |

---

## 🔐 Security Guarantees

The clamping system ensures:

✅ **No agent can recommend withdrawing more than 50% of balance** (default)  
✅ **No agent can recommend more than the actual balance**  
✅ **Absolute caps can be set for additional safety**  
✅ **All decisions are logged with full reasoning**  

This makes the platform **safe by default** even with experimental AI agents.
