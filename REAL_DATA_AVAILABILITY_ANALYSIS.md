# Real Data Availability Analysis

**Date**: 2026-01-18  
**Purpose**: Identify where real data is available to replace mock data in the frontend

---

## 📊 Executive Summary

**Current State**:
- ✅ **4 Real Data Sources** already available
- ⚠️ **10 Mock Data Items** can be replaced with real data
- 🔧 **6 New API Endpoints** needed for full coverage

**Quick Wins** (No Backend Changes Needed):
1. Agent States → Calculate from existing `/agents/list`
2. Pending Transactions → Query blockchain events
3. Recent Events → Query blockchain events

**Medium Effort** (New API Endpoints):
4. System Logs → Add logging endpoint
5. Balance History → Add historical tracking
6. Risk Posture → Add risk calculation

---

## ✅ Real Data Already Available

### 1. **Vault Balance** ✅ IMPLEMENTED
**Source**: Blockchain (SimpleVault contract)  
**Function**: `getVaultBalance(address)` in `frontend-main/lib/web3.ts`  
**Contract Method**: `balances(address) → uint256`  
**Status**: ✅ Already using real data in Overview page

---

### 2. **Agent List** ✅ IMPLEMENTED
**Source**: Agent Service API  
**Endpoint**: `GET /agents/list`  
**Response**:
```json
{
  "status": "ok",
  "aiEnabled": true,
  "agents": [
    {
      "id": "withdrawal-risk-sentinel",
      "name": "Withdrawal Risk Sentinel",
      "description": "Monitors withdrawal requests..."
    }
  ]
}
```
**Status**: ✅ Already using real data in Agents page

---

### 3. **AI Enabled Status** ✅ IMPLEMENTED
**Source**: Agent Service API  
**Endpoint**: `GET /agents/list`  
**Response Field**: `aiEnabled: boolean`  
**Status**: ✅ Already using real data in Agents page

---

### 4. **System Health** ✅ IMPLEMENTED
**Source**: Agent Service API  
**Endpoint**: `GET /health`  
**Response**: `{ "status": "ok" }`  
**Status**: ✅ Already implemented in `data-service.ts`

---

## 🔧 Real Data Available (Needs Frontend Integration)

### 5. **Agent States** (Active/Paused/Override)
**Current**: Mock data (`mockAgentStates`)  
**Real Source**: Calculate from `/agents/list` response  
**Implementation**:
```typescript
// Calculate from agent list
const agents = await fetchAgents();
const agentStates = {
  active: agents.filter(a => a.status === 'active').length,
  paused: agents.filter(a => a.status === 'paused').length,
  override: agents.filter(a => a.mode === 'override').length
};
```
**Effort**: ⚡ Low (frontend only)  
**Priority**: 🔥 High

---

### 6. **Pending Transactions**
**Current**: Mock data (`mockPendingTransactions = 3`)  
**Real Source**: Blockchain events  
**Implementation**:
```typescript
// Query recent AgentRecommendation events that haven't been executed
const provider = getProvider();
const vault = getVaultContract(provider);
const filter = vault.filters.AgentRecommendation();
const events = await vault.queryFilter(filter, -1000); // Last 1000 blocks
const pending = events.filter(e => !e.executed).length;
```
**Effort**: ⚡ Low (frontend only)  
**Priority**: 🔥 High

---

### 7. **Recent Events**
**Current**: Mock data (`mockRecentEvents`)  
**Real Source**: Blockchain events  
**Available Events**:
- `Deposited(address user, uint256 amount)`
- `Withdrawn(address user, uint256 amount)`
- `AgentRecommendation(address agent, address user, uint256 newLimit, string reason)`

**Implementation**:
```typescript
// Query recent vault events
const depositEvents = await vault.queryFilter(vault.filters.Deposited(), -1000);
const withdrawEvents = await vault.queryFilter(vault.filters.Withdrawn(), -1000);
const agentEvents = await vault.queryFilter(vault.filters.AgentRecommendation(), -1000);

// Combine and format
const recentEvents = [...depositEvents, ...withdrawEvents, ...agentEvents]
  .sort((a, b) => b.blockNumber - a.blockNumber)
  .slice(0, 10)
  .map(formatEvent);
```
**Effort**: ⚡ Medium (frontend only)  
**Priority**: 🔥 High

---

### 8. **Transaction History** (X402 Page)
**Current**: Mock data (`mockX402Transactions`)  
**Real Source**: Blockchain events + Settlement Payment contract  
**Available Data**:
- Settlement payments: `SettlementPaid(bytes32 jobId, address payer, uint256 amount, uint256 timestamp)`
- Agent decisions: `AgentRecommendation` events
- Withdrawals: `Withdrawn` events

**Implementation**:
```typescript
// Query settlement payment events
const settlementContract = getSettlementPaymentContract(provider);
const paymentEvents = await settlementContract.queryFilter(
  settlementContract.filters.SettlementPaid(),
  -10000
);

// Combine with agent and withdrawal events
const transactions = paymentEvents.map(e => ({
  id: e.args.jobId,
  timestamp: new Date(e.args.timestamp * 1000).toISOString(),
  payer: e.args.payer,
  amount: ethers.formatEther(e.args.amount),
  status: 'completed'
}));
```
**Effort**: ⚡ Medium (frontend only)
**Priority**: 🟡 Medium

---

### 9. **Last Risk Evaluation**
**Current**: Mock data (`mockLastRiskEvaluation`)
**Real Source**: Latest `AgentRecommendation` event timestamp
**Implementation**:
```typescript
// Get latest agent recommendation event
const events = await vault.queryFilter(vault.filters.AgentRecommendation(), -1000);
const latest = events[events.length - 1];
const block = await provider.getBlock(latest.blockNumber);
const lastRiskEvaluation = new Date(block.timestamp * 1000).toISOString();
```
**Effort**: ⚡ Low (frontend only)
**Priority**: 🔥 High

---

### 10. **Audit Log**
**Current**: Mock data (`mockAuditLog`)
**Real Source**: Blockchain events
**Implementation**:
```typescript
// Query all relevant events for audit trail
const allEvents = await Promise.all([
  vault.queryFilter(vault.filters.Deposited(), -10000),
  vault.queryFilter(vault.filters.Withdrawn(), -10000),
  vault.queryFilter(vault.filters.AgentRecommendation(), -10000),
  settlementContract.queryFilter(settlementContract.filters.SettlementPaid(), -10000)
]);

// Format as audit log entries
const auditLog = allEvents.flat()
  .sort((a, b) => b.blockNumber - a.blockNumber)
  .map(formatAuditEntry);
```
**Effort**: ⚡ Medium (frontend only)
**Priority**: 🟡 Medium

---

## 🚧 Real Data Needs New Backend API

### 11. **System Logs** (Monitoring Page)
**Current**: Mock data (`mockLogs`)
**Real Source**: Backend logging system (needs implementation)
**Proposed Endpoint**: `GET /logs`
**Query Parameters**:
- `severity`: info | warn | critical
- `agent`: agent ID filter
- `subsystem`: subsystem filter
- `limit`: number of logs to return
- `since`: timestamp

**Response**:
```json
{
  "logs": [
    {
      "timestamp": "2026-01-18T14:22:45Z",
      "severity": "info",
      "agent": "withdrawal-risk-sentinel",
      "subsystem": "risk-engine",
      "message": "Withdrawal request evaluated: 12,500 CRO..."
    }
  ]
}
```
**Effort**: 🔧 High (backend + frontend)
**Priority**: 🟡 Medium

---

### 12. **Balance History** (Chart Data)
**Current**: Mock data (`mockBalanceHistory`)
**Real Source**: Historical blockchain data or backend tracking
**Option A**: Query historical events and reconstruct balance
**Option B**: Backend service tracks balance snapshots

**Proposed Endpoint**: `GET /vault/balance-history/:address`
**Query Parameters**:
- `from`: start timestamp
- `to`: end timestamp
- `interval`: 1h | 6h | 1d

**Response**:
```json
{
  "history": [
    {
      "timestamp": "2026-01-18T08:00:00Z",
      "balance": "1195234120000000000000000",
      "balanceInCRO": "1195234.12",
      "riskScore": 15
    }
  ]
}
```
**Effort**: 🔧 High (backend + frontend)
**Priority**: 🟡 Medium

---

### 13. **Risk Posture**
**Current**: Mock data (`mockRiskPosture`)
**Real Source**: Risk calculation engine (needs implementation)
**Proposed Endpoint**: `GET /risk/posture/:address`

**Response**:
```json
{
  "level": "low",
  "score": 14,
  "description": "All systems operating within normal parameters...",
  "factors": [
    { "name": "withdrawal_velocity", "score": 10, "weight": 0.3 },
    { "name": "balance_volatility", "score": 18, "weight": 0.4 },
    { "name": "agent_confidence", "score": 15, "weight": 0.3 }
  ]
}
```
**Effort**: 🔧 Very High (complex backend logic)
**Priority**: 🔴 Low (nice to have)

---

### 14. **Vault Limits Configuration**
**Current**: Hardcoded values in Vault page
**Real Source**: Smart contract or backend configuration
**Proposed Endpoint**: `GET /vault/limits/:address`

**Response**:
```json
{
  "dailyWithdrawalCap": "50000000000000000000000",
  "dailyWithdrawalCapInCRO": "50000",
  "singleTransactionLimit": "25000000000000000000000",
  "singleTransactionLimitInCRO": "25000",
  "hourlyVelocityLimit": 5
}
```
**Effort**: 🔧 Medium (backend + frontend)
**Priority**: 🟡 Medium

---

## 📋 Implementation Roadmap

### Phase 1: Quick Wins (Frontend Only) ⚡
**Effort**: 1-2 days
**Impact**: High

1. ✅ Agent States → Calculate from `/agents/list`
2. ✅ Pending Transactions → Query blockchain events
3. ✅ Recent Events → Query blockchain events
4. ✅ Last Risk Evaluation → Latest event timestamp
5. ✅ Audit Log → Format blockchain events

**Files to Modify**:
- `frontend-main/lib/data-service.ts`
- `frontend-main/lib/web3.ts`
- `frontend-main/components/pages/overview.tsx`

---

### Phase 2: Transaction History (Frontend Only) ⚡
**Effort**: 1 day
**Impact**: Medium

6. ✅ X402 Transactions → Query settlement events

**Files to Modify**:
- `frontend-main/lib/web3.ts`
- `frontend-main/components/pages/x402.tsx`

---

### Phase 3: Backend APIs 🔧
**Effort**: 3-5 days
**Impact**: Medium

7. 🔧 System Logs → New `/logs` endpoint
8. 🔧 Vault Limits → New `/vault/limits` endpoint

**Files to Create**:
- `agent-service/src/routes/logs.ts`
- `agent-service/src/routes/vault.ts`

---

### Phase 4: Advanced Features 🔧
**Effort**: 5-10 days
**Impact**: Low (nice to have)

9. 🔧 Balance History → Historical tracking service
10. 🔧 Risk Posture → Risk calculation engine

**Files to Create**:
- `agent-service/src/services/balanceTracker.ts`
- `agent-service/src/services/riskEngine.ts`

---

## 🎯 Priority Matrix

| Feature | Effort | Impact | Priority | Phase |
|---------|--------|--------|----------|-------|
| Agent States | Low | High | 🔥 High | 1 |
| Pending Transactions | Low | High | 🔥 High | 1 |
| Recent Events | Medium | High | 🔥 High | 1 |
| Last Risk Evaluation | Low | High | 🔥 High | 1 |
| Audit Log | Medium | Medium | 🟡 Medium | 1 |
| X402 Transactions | Medium | Medium | 🟡 Medium | 2 |
| System Logs | High | Medium | 🟡 Medium | 3 |
| Vault Limits | Medium | Medium | 🟡 Medium | 3 |
| Balance History | High | Low | 🔴 Low | 4 |
| Risk Posture | Very High | Low | 🔴 Low | 4 |

---

## 💡 Recommendations

### Immediate Actions (This Week)
1. **Implement Phase 1** - Replace 5 mock data sources with blockchain queries
2. **Test thoroughly** - Ensure blockchain queries don't slow down UI
3. **Add caching** - Cache blockchain data for 10-30 seconds

### Short Term (Next 2 Weeks)
4. **Implement Phase 2** - Add transaction history from blockchain
5. **Add Phase 3 endpoints** - System logs and vault limits APIs

### Long Term (Future)
6. **Consider Phase 4** - Only if there's clear user demand
7. **Optimize queries** - Use The Graph or similar indexing service

---

**Last Updated**: 2026-01-18
**Status**: ✅ Analysis Complete

