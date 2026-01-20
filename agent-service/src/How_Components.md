┌─────────────┐
│  Frontend   │
│ (port 3001) │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         server.ts (port 3000)       │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ /agents/*    │  │/settlement/* │ │
│  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼─────────┘
          │                  │
          ▼                  ▼
    ┌─────────────────────────────┐
    │      registry.ts            │
    │  ┌──────────────────────┐   │
    │  │ getAgent(agentId)    │   │
    │  └──────────┬───────────┘   │
    └─────────────┼───────────────┘
                  ▼
    ┌─────────────────────────────┐
    │   Individual Agents         │
    │  • settlement-batch-opt     │
    │  • withdrawal-risk-sentinel │
    │  • emergency-brake          │
    │  • portfolio-rebalancer-ai  │
    └──────────┬──────────────────┘
               │ decide(ctx)
               ▼
    ┌─────────────────────────────┐
    │   AgentDecision             │
    │   { proposedLimitWei,       │
    │     reason, confidence }    │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │   clamp.ts                  │
    │   Safety enforcement        │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │   simpleVault.ts            │
    │   agentSetWithdrawLimit()   │
    └──────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────────┐
    │   Cronos Blockchain         │
    │   SimpleVault Contract      │
    └─────────────────────────────┘