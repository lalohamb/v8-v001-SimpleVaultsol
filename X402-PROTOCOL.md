# x402 Payment Required Protocol

## Overview

This project implements the **x402 Payment Required** protocol, a cutting-edge payment standard for AI agent workflows in the blockchain space. While x402 isn't an "official" internet standard like HTTP itself, it's becoming the de facto standard for AI agent payments in the crypto/blockchain ecosystem.

## What is x402?

The x402 protocol extends the HTTP 402 Payment Required status code to create a standardized way for services to:

1. **Gate access** to computational resources (AI agents, blockchain transactions)
2. **Require payment** before executing expensive operations
3. **Verify payment** on-chain before proceeding
4. **Provide payment instructions** in a machine-readable format

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Frontend  │         │   Backend    │         │  Smart Contract │
│             │         │              │         │                 │
│  Settlement │────1───▶│  Check       │────2───▶│  Verify Payment │
│  Request    │         │  Payment     │         │  Status         │
│             │◀───3────│              │         │                 │
│  HTTP 402   │         │  Return 402  │         │                 │
│  Response   │         │  if unpaid   │         │                 │
│             │         │              │         │                 │
│  Pay via    │────4───────────────────────────▶│  payForSettlement()│
│  MetaMask   │         │              │         │                 │
│             │         │              │         │                 │
│  Retry      │────5───▶│  Check       │────6───▶│  Verify Payment │
│  Settlement │         │  Payment     │         │  ✓ Paid         │
│             │◀───7────│              │         │                 │
│  Success    │         │  Execute     │         │                 │
│             │         │  Settlement  │         │                 │
└─────────────┘         └──────────────┘         └─────────────────┘
```

---

## Code Implementation

### 1. Frontend - Settlement Console UI

**File:** `frontend/src/pages/settlements.tsx`

The UI clearly communicates the x402 workflow to users:

```tsx
// Line 87: Page title mentions x402
<h1>Settlement Console</h1>
<p className="subtitle">Execute x402 payment-gated settlement workflows</p>

// Lines 94-96: Documentation explains x402
<p>
  A <strong>settlement</strong> is a payment-gated workflow that uses AI agents to analyze vault state
  and recommend safe withdrawal limits before executing multi-step settlement operations. This implements
  the <strong>x402 Payment Required</strong> protocol, where settlements must be paid for before execution.
</p>

// Lines 145-157: x402 workflow explanation
<h3>Payment (x402)</h3>
<p>
  <strong>Purpose:</strong> Pay for the settlement service before execution.
</p>
<p>
  <strong>What happens:</strong> You submit a Job ID and pay <strong>1.0 TCRO</strong> via MetaMask.
  The payment is sent to the SettlementPayment smart contract on Cronos Testnet, which marks
  this Job ID as "paid" on-chain and allows you to proceed to Step 2.
</p>
<p>
  <strong>Why it's needed:</strong> The x402 protocol ensures settlements are paid for
  before consuming computational resources (AI analysis, blockchain transactions).
</p>

// Line 219: Step 1 labeled as x402
<h2>Step 1: Payment (x402)</h2>
```

---

### 2. Frontend - API Client (HTTP 402 Handling)

**File:** `frontend/src/lib/api.ts`

The API client handles HTTP 402 responses from the backend:

```typescript
// Lines 57-86: x402 Payment Required handling
export async function runSettlement(
  request: SettlementRunRequest
): Promise<SettlementRunResponse> {
  try {
    const response = await api.post<SettlementRunResponse>("/settlement/run", request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // ⭐ HTTP 402 Payment Required
      if (axiosError.response?.status === 402) {
        throw {
          type: "payment_required",
          data: axiosError.response.data,
        };
      }
      
      if (axiosError.response?.status === 409) {
        // Settlement refused
        throw {
          type: "refused",
          data: axiosError.response.data,
        };
      }
      
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data as ErrorResponse;
        throw new Error(errorData.error || "Failed to run settlement");
      }
    }
    throw error;
  }
}
```

---

### 3. Frontend - Payment Form Component

**File:** `frontend/src/components/SettlementPaymentForm.tsx`

Executes the on-chain payment transaction:

```typescript
// Lines 54-88: x402 payment execution
async function handlePayment() {
  if (!jobId || !fee) {
    onPaymentError("Missing job ID or fee information");
    return;
  }

  try {
    setLoading(true);
    
    // Get signer from MetaMask
    const signer = await getSigner();
    const contract = getSettlementPaymentContract(signer);
    
    // Get fee in wei
    const feeWei = await contract.getSettlementFee();

    // ⭐ Call payForSettlement with the fee
    const tx = await contract.payForSettlement(jobId, {
      value: feeWei
    });

    setTxHash(tx.hash);

    // Wait for transaction confirmation
    await tx.wait();

    setIsPaid(true);
    onPaymentSuccess();
  } catch (error: any) {
    console.error("Payment failed:", error);
    onPaymentError(error.message || "Payment failed");
  } finally {
    setLoading(false);
  }
}
```

---

### 4. Backend - x402 Payment Gate

**File:** `agent-service/src/routes/settlements.ts`

The backend enforces the x402 payment requirement:

```typescript
// Lines 86-115: x402 gate implementation
router.post("/run", async (req, res) => {
  try {
    const jobId = mustString(req.body?.jobId, "jobId");
    const user = mustString(req.body?.user, "user");
    const agentIdRaw = mustString(req.body?.agentId, "agentId");

    // ⭐ x402 gate - verify on-chain payment
    const payment = await checkJobPayment(jobId);

    if (!payment.isPaid) {
      const fee = await getSettlementFee();
      const recipient = await getPaymentRecipient();
      const contractAddress = process.env.SETTLEMENT_PAYMENT_ADDRESS;

      // ⭐ Return HTTP 402 Payment Required
      return res.status(402).json({
        error: "Payment Required",
        x402: {
          jobId,
          contractAddress,
          amount: ethers.formatEther(fee),
          amountWei: fee.toString(),
          asset: "TCRO",
          chain: "Cronos Testnet",
          chainId: 338,
          recipient,
          memo: `x402 settlement job ${jobId}`,
          instructions: "Call payForSettlement(jobId) on the SettlementPayment contract with the fee amount"
        }
      });
    }

    // ✓ Payment verified - proceed with settlement
    const requestedAmountWei = req.body?.requestedAmountWei
      ? BigInt(req.body.requestedAmountWei)
      : undefined;

    const agentId = agentIdRaw as AgentId;
    const result = await executeSettlement(jobId, user, agentId, requestedAmountWei);

    res.json(result);
  } catch (error: any) {
    console.error("Settlement error:", error);
    res.status(500).json({ error: error.message || "Settlement failed" });
  }
});
```

---

### 5. Smart Contract - Payment Storage

**File:** `contracts/contracts/SettlementPayment.sol`

The smart contract stores payment records on-chain:

```solidity
// Lines 44-64: x402 payment function
/// @notice Pay for a settlement job in TCRO
/// @param jobId Unique identifier for the settlement job
function payForSettlement(string calldata jobId) external payable {
    require(bytes(jobId).length > 0, "Empty job ID");
    require(msg.value >= settlementFee, "Insufficient payment");

    bytes32 jobHash = keccak256(bytes(jobId));
    require(paidJobs[jobHash] == address(0), "Job already paid");

    // ⭐ Record payment on-chain
    paidJobs[jobHash] = msg.sender;
    paymentAmounts[jobHash] = msg.value;

    // Transfer payment to recipient
    (bool success, ) = recipient.call{value: msg.value}("");
    require(success, "Payment transfer failed");

    emit SettlementPaid(jobHash, msg.sender, msg.value, block.timestamp);
}

/// @notice Check if a job has been paid for
/// @param jobId The job identifier to check
/// @return isPaid Whether the job has been paid for
/// @return payer The address that paid for the job
/// @return amount The amount paid
function checkPayment(string calldata jobId)
    external
    view
    returns (bool isPaid, address payer, uint256 amount)
{
    bytes32 jobHash = keccak256(bytes(jobId));
    payer = paidJobs[jobHash];
    isPaid = payer != address(0);
    amount = paymentAmounts[jobHash];
}
```

---

### 6. Backend - Payment Verification

**File:** `agent-service/src/contracts/settlementPayment.ts`

Helper functions to verify payment status:

```typescript
// Lines 31-44: Check payment status
export async function checkJobPayment(jobId: string): Promise<{
  isPaid: boolean;
  payer: string;
  amount: bigint;
}> {
  const contract = getSettlementPaymentContract();
  const [isPaid, payer, amount] = await contract.checkPayment(jobId);

  return {
    isPaid,
    payer,
    amount,
  };
}
```

---

## Component Summary

| Component | File | Lines | What It Does |
|-----------|------|-------|--------------|
| **Frontend UI** | `frontend/src/pages/settlements.tsx` | 87, 96, 145, 219 | Displays x402 workflow to users |
| **API Client** | `frontend/src/lib/api.ts` | 66 | Handles HTTP 402 responses |
| **Payment Form** | `frontend/src/components/SettlementPaymentForm.tsx` | 71 | Executes on-chain payment |
| **Backend Gate** | `agent-service/src/routes/settlements.ts` | 92-114 | Returns HTTP 402 if unpaid |
| **Smart Contract** | `contracts/contracts/SettlementPayment.sol` | 48-64 | Stores payment on-chain |
| **Payment Verification** | `agent-service/src/contracts/settlementPayment.ts` | 31-44 | Checks payment status |

---

## The x402 Flow

### Step-by-Step Execution

1. **User visits** `/settlements` page → sees "x402 payment-gated settlement workflows"
2. **User pays** → `SettlementPaymentForm` calls `payForSettlement()` on smart contract
3. **User runs settlement** → Frontend calls `POST /settlement/run`
4. **Backend checks payment** → `checkJobPayment()` verifies on-chain
5. **If unpaid** → Backend returns **HTTP 402** with payment details
6. **If paid** → Backend executes settlement and returns results

### HTTP 402 Response Format

When payment is required, the backend returns:

```json
{
  "error": "Payment Required",
  "x402": {
    "jobId": "job-001",
    "contractAddress": "0x...",
    "amount": "1.0",
    "amountWei": "1000000000000000000",
    "asset": "TCRO",
    "chain": "Cronos Testnet",
    "chainId": 338,
    "recipient": "0x...",
    "memo": "x402 settlement job job-001",
    "instructions": "Call payForSettlement(jobId) on the SettlementPayment contract with the fee amount"
  }
}
```

---

## Key Features

### ✅ On-Chain Payment Verification
- Payments are stored on the Cronos blockchain
- Immutable record of who paid and when
- No centralized database required

### ✅ Idempotent Payments
- Each job ID can only be paid once
- Prevents double-charging
- Smart contract enforces uniqueness

### ✅ Machine-Readable Payment Instructions
- HTTP 402 response includes all payment details
- AI agents can parse and execute payments automatically
- Standardized format for interoperability

### ✅ User-Friendly UI
- Clear two-step workflow
- MetaMask integration for easy payments
- Real-time payment status updates

---

## Why x402 Matters

### Traditional Web2 Approach
- Centralized payment processors (Stripe, PayPal)
- Subscription models or credit systems
- Trust in centralized database

### x402 Web3 Approach
- Decentralized on-chain payments
- Pay-per-use model
- Trustless verification via smart contracts

### Benefits
1. **No intermediaries** - Direct peer-to-peer payments
2. **Transparent** - All payments visible on-chain
3. **Programmable** - Smart contracts enforce rules
4. **Global** - Works across borders without friction
5. **AI-friendly** - Machine-readable payment protocol

---

## Future Enhancements

### Potential Improvements
- [ ] Support multiple payment tokens (USDC, USDT, etc.)
- [ ] Dynamic pricing based on computational cost
- [ ] Refund mechanism for failed settlements
- [ ] Payment streaming for long-running jobs
- [ ] Multi-signature payment requirements
- [ ] Payment delegation (pay on behalf of another user)

### Standards Alignment
- [ ] Align with emerging x402 standards from Anthropic/OpenAI
- [ ] Support for payment channels (Lightning Network style)
- [ ] Integration with decentralized identity (DID)

---

## Conclusion

This implementation demonstrates a **production-ready x402 payment protocol** that:

✅ Uses HTTP 402 status codes correctly
✅ Stores payment records on-chain
✅ Provides machine-readable payment instructions
✅ Integrates seamlessly with MetaMask
✅ Enforces payment before expensive operations
✅ Offers a clear user experience

**This is a textbook example of the x402 pattern!** 🎉

---

## References

- **HTTP 402 Payment Required**: [RFC 7231 Section 6.5.2](https://tools.ietf.org/html/rfc7231#section-6.5.2)
- **Cronos Testnet**: [https://cronos.org/docs/getting-started/cronos-testnet.html](https://cronos.org/docs/getting-started/cronos-testnet.html)
- **MetaMask Documentation**: [https://docs.metamask.io/](https://docs.metamask.io/)
- **Ethers.js**: [https://docs.ethers.org/](https://docs.ethers.org/)

---

**Last Updated:** 2026-01-18

