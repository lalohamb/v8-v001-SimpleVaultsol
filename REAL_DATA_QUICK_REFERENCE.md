# Real Data Quick Reference

## 🎯 At a Glance

| Mock Data | Real Source | Effort | Priority | Phase |
|-----------|-------------|--------|----------|-------|
| ✅ Vault Balance | Blockchain | - | - | Done |
| ✅ Agent List | API | - | - | Done |
| ✅ AI Status | API | - | - | Done |
| ✅ System Health | API | - | - | Done |
| Agent States | Calculate from API | Low | High | 1 |
| Pending Txs | Blockchain Events | Low | High | 1 |
| Recent Events | Blockchain Events | Medium | High | 1 |
| Last Risk Eval | Event Timestamp | Low | High | 1 |
| Audit Log | Blockchain Events | Medium | Medium | 1 |
| X402 Txs | Settlement Events | Medium | Medium | 2 |
| System Logs | New API | High | Medium | 3 |
| Vault Limits | New API | Medium | Medium | 3 |
| Balance History | New API | High | Low | 4 |
| Risk Posture | New API | Very High | Low | 4 |

---

## ⚡ Quick Wins (Frontend Only)

### Agent States
```typescript
// In data-service.ts
const agents = await fetchAgents();
const agentStates = {
  active: agents.filter(a => a.status === 'active').length,
  paused: agents.filter(a => a.status === 'paused').length,
  override: agents.filter(a => a.mode === 'override').length
};
```

### Pending Transactions
```typescript
// In web3.ts
const vault = getVaultContract(provider);
const filter = vault.filters.AgentRecommendation();
const events = await vault.queryFilter(filter, -1000);
const pending = events.filter(e => !e.executed).length;
```

### Recent Events
```typescript
// In web3.ts
const depositEvents = await vault.queryFilter(vault.filters.Deposited(), -1000);
const withdrawEvents = await vault.queryFilter(vault.filters.Withdrawn(), -1000);
const agentEvents = await vault.queryFilter(vault.filters.AgentRecommendation(), -1000);

const recentEvents = [...depositEvents, ...withdrawEvents, ...agentEvents]
  .sort((a, b) => b.blockNumber - a.blockNumber)
  .slice(0, 10);
```

### Last Risk Evaluation
```typescript
// In web3.ts
const events = await vault.queryFilter(vault.filters.AgentRecommendation(), -1000);
const latest = events[events.length - 1];
const block = await provider.getBlock(latest.blockNumber);
const lastRiskEvaluation = new Date(block.timestamp * 1000).toISOString();
```

### Audit Log
```typescript
// In web3.ts
const allEvents = await Promise.all([
  vault.queryFilter(vault.filters.Deposited(), -10000),
  vault.queryFilter(vault.filters.Withdrawn(), -10000),
  vault.queryFilter(vault.filters.AgentRecommendation(), -10000)
]);

const auditLog = allEvents.flat()
  .sort((a, b) => b.blockNumber - a.blockNumber)
  .map(formatAuditEntry);
```

---

## 📊 Blockchain Events Available

### SimpleVault Contract
```solidity
event Deposited(address indexed user, uint256 amount)
event Withdrawn(address indexed user, uint256 amount)
event AgentRecommendation(address indexed agent, address indexed user, uint256 newLimit, string reason)
event AgentUpdated(address indexed oldAgent, address indexed newAgent)
```

### SettlementPayment Contract
```solidity
event SettlementPaid(bytes32 indexed jobId, address indexed payer, uint256 amount, uint256 timestamp)
event FeeUpdated(uint256 oldFee, uint256 newFee)
event RecipientUpdated(address indexed oldRecipient, address indexed newRecipient)
```

---

## 🔧 Backend APIs Needed

### System Logs
```typescript
GET /logs?severity=info&agent=withdrawal-sentinel&limit=50

Response:
{
  "logs": [
    {
      "timestamp": "2026-01-18T14:22:45Z",
      "severity": "info",
      "agent": "withdrawal-risk-sentinel",
      "subsystem": "risk-engine",
      "message": "Withdrawal request evaluated..."
    }
  ]
}
```

### Balance History
```typescript
GET /vault/balance-history/:address?from=2026-01-17&to=2026-01-18&interval=1h

Response:
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

### Risk Posture
```typescript
GET /risk/posture/:address

Response:
{
  "level": "low",
  "score": 14,
  "description": "All systems operating within normal parameters...",
  "factors": [
    { "name": "withdrawal_velocity", "score": 10, "weight": 0.3 }
  ]
}
```

### Vault Limits
```typescript
GET /vault/limits/:address

Response:
{
  "dailyWithdrawalCap": "50000000000000000000000",
  "dailyWithdrawalCapInCRO": "50000",
  "singleTransactionLimit": "25000000000000000000000",
  "singleTransactionLimitInCRO": "25000",
  "hourlyVelocityLimit": 5
}
```

---

## 📈 Implementation Priority

### This Week (Phase 1)
1. Agent States
2. Pending Transactions
3. Recent Events
4. Last Risk Evaluation
5. Audit Log

### Next Week (Phase 2)
6. X402 Transactions

### Next 2 Weeks (Phase 3)
7. System Logs API
8. Vault Limits API

### Future (Phase 4)
9. Balance History API
10. Risk Posture API

---

**Last Updated**: 2026-01-18  
**Status**: ✅ Ready for Implementation

