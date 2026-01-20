# 🔐 x402-Protected Endpoints Architecture

## Overview

This document explains how **x402 Payment Required** endpoints are exposed and how the payment-gated workflow operates in the Cronos AI Agent system.

---

## 📋 What is x402?

**x402** is a payment protocol pattern based on **HTTP 402 Payment Required** status code.

### Concept
- **HTTP 402**: "Payment Required" (reserved but rarely used in traditional web)
- **x402 Pattern**: Programmatic payment gate for API operations
- **Implementation**: Blockchain-based payment verification before executing premium operations

### Why x402?
- ✅ **Monetize Premium APIs**: Charge for expensive or specialized operations
- ✅ **Prevent Abuse**: Require payment to access resource-intensive endpoints
- ✅ **Cryptographic Proof**: On-chain payment verification (no trust required)
- ✅ **Transparent Pricing**: Users see exact costs before execution

---

## 🏗️ Architecture Overview

### **Three-Layer System**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                  │
│  - User initiates settlement request                         │
│  - Receives 402 Payment Required response                    │
│  - Displays payment UI (MetaMask integration)                │
│  - Submits payment via smart contract                        │
│  - Retries settlement after payment                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express.js)                   │
│  - Exposes x402-protected endpoint: POST /settlement/run     │
│  - Checks payment status on-chain                            │
│  - Returns 402 if unpaid, executes if paid                   │
│  - Provides payment info endpoint: GET /settlement/payment-info│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              SMART CONTRACT (SettlementPayment.sol)          │
│  - Deployed on Cronos Testnet                                │
│  - Address: 0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0      │
│  - Stores payment records on-chain                           │
│  - Provides payment verification functions                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete x402 Workflow

### **Step-by-Step Flow**

```
1. USER INITIATES REQUEST
   ↓
   POST /settlement/run
   {
     "jobId": "job-001",
     "user": "0x...",
     "agentId": "settlement-batch-optimizer"
   }

2. BACKEND CHECKS PAYMENT
   ↓
   checkJobPayment(jobId) → Smart Contract
   ↓
   isPaid = false

3. BACKEND RETURNS 402
   ↓
   HTTP 402 Payment Required
   {
     "error": "Payment Required",
     "x402": {
       "jobId": "job-001",
       "contractAddress": "0xF5C2d702...",
       "amount": "1.0",
       "amountWei": "1000000000000000000",
       "asset": "TCRO",
       "chain": "Cronos Testnet",
       "chainId": 338,
       "recipient": "0xD44d1DC...",
       "instructions": "Call payForSettlement(jobId)..."
     }
   }

4. FRONTEND DISPLAYS PAYMENT UI
   ↓
   User sees: "Payment Required: 1.0 TCRO"
   Button: "Pay 1.0 TCRO"

5. USER PAYS VIA METAMASK
   ↓
   contract.payForSettlement("job-001", { value: 1.0 TCRO })
   ↓
   Transaction confirmed on-chain
   ↓
   Payment recorded in smart contract

6. USER RETRIES REQUEST
   ↓
   POST /settlement/run (same jobId)

7. BACKEND CHECKS PAYMENT AGAIN
   ↓
   checkJobPayment(jobId) → Smart Contract
   ↓
   isPaid = true ✓

8. BACKEND EXECUTES SETTLEMENT
   ↓
   - Run agent decision logic
   - Write recommendation on-chain
   - Execute settlement pipeline
   ↓
   HTTP 200 OK
   {
     "status": "settlement_executed",
     "jobId": "job-001",
     "onChain": { "txHash": "0x..." },
     "pipeline": [...]
   }
```

---

## 🛣️ API Endpoints Exposed

### **1. GET /settlement/payment-info**

**Purpose**: Get payment information for settlements

**Request**:
```bash
GET http://localhost:3000/settlement/payment-info
```

**Response**:
```json
{
  "contractAddress": "0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0",
  "fee": "1000000000000000000",
  "feeInCRO": "1.0",
  "recipient": "0xD44d1DC5648542157d1D989580Bf4597e5d771d5",
  "chainId": 338,
  "chainName": "Cronos Testnet",
  "instructions": "Send payment via MetaMask by calling payForSettlement(jobId) with the fee amount"
}
```

**Use Case**: Frontend calls this to display payment requirements before user starts workflow

---

### **2. POST /settlement/verify-payment**

**Purpose**: Verify if a job has been paid for on-chain

**Request**:
```bash
POST http://localhost:3000/settlement/verify-payment
Content-Type: application/json

{
  "jobId": "job-001"
}
```

**Response (Paid)**:
```json
{
  "status": "paid",
  "jobId": "job-001",
  "payer": "0xABC...",
  "amount": "1000000000000000000",
  "amountInCRO": "1.0"
}
```

**Response (Unpaid)**:
```json
{
  "status": "unpaid",
  "jobId": "job-001"
}
```

**Use Case**: Frontend polls this endpoint to check if payment has been confirmed

---

### **3. POST /settlement/run** ⭐ (x402-Protected)

**Purpose**: Execute settlement with agent enforcement (PAYMENT REQUIRED)

**Request**:
```bash
POST http://localhost:3000/settlement/run
Content-Type: application/json

{
  "jobId": "job-001",
  "user": "0x...",
  "agentId": "settlement-batch-optimizer",
  "requestedAmountWei": "500000000000000000"  // optional
}
```

**Response (Payment Required - 402)**:
```json
{
  "error": "Payment Required",
  "x402": {
    "jobId": "job-001",
    "contractAddress": "0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0",
    "amount": "1.0",
    "amountWei": "1000000000000000000",
    "asset": "TCRO",
    "chain": "Cronos Testnet",
    "chainId": 338,
    "recipient": "0xD44d1DC5648542157d1D989580Bf4597e5d771d5",
    "memo": "x402 settlement job job-001",
    "instructions": "Call payForSettlement(jobId) on the SettlementPayment contract with the fee amount"
  }
}
```

**Response (Success - 200)**:
```json
{
  "status": "settlement_executed",
  "jobId": "job-001",
  "agentId": "settlement-batch-optimizer",
  "onChain": {
    "txHash": "0xabc123...",
    "recommendedLimitWei": "400000000000000000"
  },
  "decision": {
    "proposedLimitWei": "400000000000000000",
    "finalLimitWei": "400000000000000000",
    "confidence": 0.75
  },
  "pipeline": [
    "validate balances",
    "calculate fees",
    "route payouts",
    "finalize settlement"
  ]
}
```

---

## 🔐 Backend Implementation

### **Payment Gate Logic**

<augment_code_snippet path="agent-service/src/routes/settlements.ts" mode="EXCERPT">
````typescript
router.post("/run", async (req, res) => {
  const jobId = mustString(req.body?.jobId, "jobId");
  const user = mustString(req.body?.user, "user");
  
  // x402 gate - verify on-chain payment
  const payment = await checkJobPayment(jobId);
  
  if (!payment.isPaid) {
    const fee = await getSettlementFee();
    const recipient = await getPaymentRecipient();
    
    return res.status(402).json({
      error: "Payment Required",
      x402: {
        jobId,
        contractAddress: process.env.SETTLEMENT_PAYMENT_ADDRESS,
        amount: ethers.formatEther(fee),
        amountWei: fee.toString(),
        asset: "TCRO",
        chain: "Cronos Testnet",
        chainId: 338,
        recipient,
        memo: `x402 settlement job ${jobId}`,
        instructions: "Call payForSettlement(jobId)..."
      }
    });
  }
  
  // Payment verified ✓ - proceed with settlement
  // ... execute agent logic ...
});
````
</augment_code_snippet>

---

## 📦 Smart Contract Interface

### **SettlementPayment.sol**

**Deployed Address**: `0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0`  
**Network**: Cronos Testnet (Chain ID 338)

**Key Functions**:

```solidity
// Pay for a settlement job
function payForSettlement(string calldata jobId) external payable

// Check payment status
function checkPayment(string calldata jobId) 
    external view 
    returns (bool isPaid, address payer, uint256 amount)

// Get current fee
function getSettlementFee() external view returns (uint256)

// Get payment recipient
function getRecipient() external view returns (address)
```

**Payment Storage**:
```solidity
mapping(bytes32 => address) public paidJobs;      // jobId hash => payer
mapping(bytes32 => uint256) public paymentAmounts; // jobId hash => amount
```

---

## 🎨 Frontend Integration

### **SettlementPaymentForm Component**

The frontend provides a React component that handles the payment flow:

1. **Load Payment Info**: Fetches fee and recipient from contract
2. **Check Payment Status**: Polls to see if job is already paid
3. **Display Payment UI**: Shows fee amount and pay button
4. **Execute Payment**: Calls `payForSettlement()` via MetaMask
5. **Wait for Confirmation**: Monitors transaction status
6. **Notify Parent**: Triggers callback on success

**Usage**:
```tsx
<SettlementPaymentForm
  jobId="job-001"
  onPaymentSuccess={() => console.log("Paid!")}
  onPaymentError={(err) => console.error(err)}
/>
```

---

## 🔍 Payment Verification Flow

### **On-Chain Verification**

```typescript
// Backend checks payment on-chain
export async function checkJobPayment(jobId: string) {
  const contract = getSettlementPaymentReadonly();
  const [isPaid, payer, amount] = await contract.checkPayment(jobId);
  
  return { isPaid, payer, amount };
}
```

### **No Trust Required**

- ✅ Payment records stored on blockchain
- ✅ Backend reads directly from smart contract
- ✅ No centralized database or payment tracking
- ✅ Cryptographically verifiable
- ✅ Immutable payment history

---

## ✨ Summary

### **How x402 Endpoints Are Exposed**

1. **Endpoint**: `POST /settlement/run` (x402-protected)
2. **Payment Gate**: Backend checks `checkJobPayment(jobId)` on-chain
3. **Response**: Returns HTTP 402 with payment details if unpaid
4. **Payment**: User pays via MetaMask → `payForSettlement(jobId)`
5. **Verification**: Backend re-checks payment on-chain
6. **Execution**: Proceeds with settlement if payment verified

### **Key Components**

- ✅ **Backend API**: Express.js routes with payment gates
- ✅ **Smart Contract**: On-chain payment storage and verification
- ✅ **Frontend UI**: MetaMask integration for payments
- ✅ **Payment Protocol**: HTTP 402 + blockchain verification

### **Benefits**

- ✅ **Trustless**: No centralized payment tracking
- ✅ **Transparent**: Users see exact costs upfront
- ✅ **Secure**: Blockchain-verified payments
- ✅ **Flexible**: Can be applied to any premium endpoint

**The x402 pattern enables monetization of premium API operations with blockchain-based payment verification!** 🔐💰

