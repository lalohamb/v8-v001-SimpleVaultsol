--TEST AGENT-SERVICE
636 rm -rf dist
637 npm run build
638 npm start
639 

640 ENABLE_AI_AGENTS=false npm start
640 ENABLE_AI_AGENTS=true npm start

641 lsof -i
642 kill -9 226079
643 clear
644 npm start
645 ENABLE_AI_AGENTS=false npm start
646 history
633 curl http://localhost:3000/health

## 632 curl -X POST http://localhost:3000/agents/apply -H "Content-Type: application/json" -d '{"agentId":"02portfolio-rebalancer-ai","user":"0xD44d1DC5648542157d1D989580Bf4597e5d771d5"}' 

## 632 curl -X POST http://localhost:3000/agents/apply -H "Content-Type: application/json" -d '{"agentId":"02portfolio-rebalancer-ai","user":"0xD44d1DC5648542157d1D989580Bf4597e5d771d5"}' | jq -c && echo

## 632 curl -s -X POST http://localhost:3000/agents/apply -H "Content-Type: application/json" -d '{"agentId":"02portfolio-rebalancer-ai","user":"0xD44d1DC5648542157d1D989580Bf4597e5d771d5"}' | jq -c && echo

What the response proves (line-by-line)

### Route + registry wiring works:

"agentId":"02portfolio-rebalancer-ai" executed successfully.

## Server is running and reachable:

/health returned {"status":"ok"}.

## Fallback mode is active (expected):

"reason":"fallback: rebalance cap..." and "confidence":0.6 show the agent executed in deterministic mode, which is correct when:

** ENABLE_AI_AGENTS != "true" or
** OPENAI_API_KEY is not set.

## Your agent decision math is correct:

balanceWei = 0.3 ETH (300000000000000000)
fallback baseline = 20% of balance = 0.06 ETH (60000000000000000)

So:
** proposedLimitWei = 60000000000000000
** finalLimitWei = 60000000000000000

## Clamp is working and did not override:

pctCap=150000000000000000 implies MAX_RECOMMEND_PCT=50% of 0.3 ETH = 0.15 ETH cap, so your 0.06 ETH recommendation is within the allowed envelope.
Clamp notes confirm:
"proposed=... final=..."

## On-chain hook is working:

"txHash":"0x53c7b9..." confirms agentSetWithdrawLimit() was submitted and mined/accepted by the node (your handler returns submitted and includes the tx hash).

# --TEST CONTRACTS

# --TEST FRONTEND
