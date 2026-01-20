Great question! Let me show you how x402-protected endpoints are exposed and how the payment flow works.

Perfect! Now let me create a comprehensive visual diagram and documentation showing how x402-protected endpoints are exposed:

Now let me create a visual diagram using Mermaid to show the flow:

Perfect! Now let me create a summary document:

## 🔐 **How x402-Protected Endpoints Are Exposed**

Great question! Here's a comprehensive explanation of how the **x402 Payment Required** protocol is implemented in this system:

---

## 📋 **What is x402?**

**x402** is a payment-gated API pattern based on **HTTP 402 Payment Required**:
- Traditional HTTP 402 status code (reserved but rarely used)
- **x402 Pattern**: Blockchain-based payment gate for premium API operations
- **Implementation**: Smart contract verification before executing expensive operations

---

## 🏗️ **Three-Layer Architecture**

### **1. Frontend (React/Next.js)**
- User initiates settlement request
- Receives 402 response with payment details
- Displays payment UI with MetaMask integration
- Submits payment to smart contract
- Retries request after payment confirmation

### **2. Backend API (Express.js)**
- Exposes x402-protected endpoint: `POST /settlement/run`
- Checks payment status on-chain before execution
- Returns HTTP 402 if unpaid
- Executes settlement if payment verified

### **3. Smart Contract (SettlementPayment.sol)**
- Deployed on Cronos Testnet: `0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0`
- Stores payment records on-chain
- Provides payment verification functions
- No centralized database needed

---

## 🛣️ **Exposed API Endpoints**

### **1. GET /settlement/payment-info**
**Purpose**: Get payment requirements

**Response**:
```json
{
  "contractAddress": "0xF5C2d702...",
  "fee": "1000000000000000000",
  "feeInCRO": "1.0",
  "recipient": "0xD44d1DC...",
  "chainId": 338,
  "chainName": "Cronos Testnet"
}
```

### **2. POST /settlement/verify-payment**
**Purpose**: Check if job is paid

**Request**: `{"jobId": "job-001"}`

**Response**:
```json
{
  "status": "paid",
  "jobId": "job-001",
  "payer": "0xABC...",
  "amount": "1000000000000000000"
}
```

### **3. POST /settlement/run** ⭐ (x402-Protected)
**Purpose**: Execute settlement (PAYMENT REQUIRED)

**Request**:
```json
{
  "jobId": "job-001",
  "user": "0x...",
  "agentId": "settlement-batch-optimizer"
}
```

**Response (Unpaid - HTTP 402)**:
```json
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
```

**Response (Paid - HTTP 200)**:
```json
{
  "status": "settlement_executed",
  "jobId": "job-001",
  "onChain": {"txHash": "0x..."},
  "pipeline": [...]
}
```

---

## 🔄 **Complete Workflow**

I've created a visual sequence diagram above showing the complete flow! Here's the summary:

### **Step 1: Initial Request (Unpaid)**
1. User clicks "Run Settlement"
2. Frontend → Backend: `POST /settlement/run`
3. Backend → Smart Contract: `checkPayment(jobId)`
4. Smart Contract → Backend: `isPaid = false`
5. Backend → Frontend: **HTTP 402 Payment Required**
6. Frontend displays: "Pay 1.0 TCRO"

### **Step 2: Payment Submission**
1. User clicks "Pay 1.0 TCRO"
2. MetaMask popup appears
3. User approves transaction
4. Frontend → Smart Contract: `payForSettlement(jobId, {value: 1.0 TCRO})`
5. Smart Contract records payment on-chain
6. Transaction confirmed
7. Frontend shows: "Payment Confirmed!"

### **Step 3: Retry Request (Paid)**
1. User clicks "Run Settlement" (same jobId)
2. Frontend → Backend: `POST /settlement/run`
3. Backend → Smart Contract: `checkPayment(jobId)`
4. Smart Contract → Backend: `isPaid = true ✓`
5. Backend executes agent logic
6. Backend writes recommendation on-chain
7. Backend → Frontend: **HTTP 200 OK**
8. Frontend shows: "Settlement Complete!"

---

## 🔐 **Backend Payment Gate Implementation**

````typescript path=agent-service/src/routes/settlements.ts mode=EXCERPT
router.post("/run", async (req, res) => {
  const jobId = mustString(req.body?.jobId, "jobId");
  
  // x402 gate - verify on-chain payment
  const payment = await checkJobPayment(jobId);
  
  if (!payment.isPaid) {
    return res.status(402).json({
      error: "Payment Required",
      x402: { jobId, amount, contract, ... }
    });
  }
  
  // Payment verified ✓ - proceed with settlement
  // ... execute agent logic ...
});
````

---

## 📦 **Smart Contract Functions**

**Key Functions**:
- `payForSettlement(jobId)` - User pays for job
- `checkPayment(jobId)` - Backend verifies payment
- `getSettlementFee()` - Get current fee
- `getRecipient()` - Get payment recipient

**Storage**:
```solidity
mapping(bytes32 => address) public paidJobs;      // jobId → payer
mapping(bytes32 => uint256) public paymentAmounts; // jobId → amount
```

---

## ✨ **Key Features**

### **Trustless Verification**
- ✅ No centralized payment database
- ✅ Backend reads directly from blockchain
- ✅ Cryptographically verifiable
- ✅ Immutable payment history

### **Transparent Pricing**
- ✅ Users see exact costs upfront
- ✅ Fee displayed before payment
- ✅ No hidden charges

### **Secure Payments**
- ✅ MetaMask integration
- ✅ On-chain payment records
- ✅ Transaction confirmations

### **Flexible Pattern**
- ✅ Can be applied to any premium endpoint
- ✅ Configurable fees
- ✅ Multiple payment assets possible

---

## 📁 **Files Involved**

### **Backend**
- `agent-service/src/routes/settlements.ts` - x402 endpoint logic
- `agent-service/src/contracts/settlementPayment.ts` - Contract integration

### **Smart Contract**
- `contracts/contracts/SettlementPayment.sol` - Payment contract
- Deployed: `0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0`

### **Frontend**
- `frontend/src/components/SettlementPaymentForm.tsx` - Payment UI
- `frontend/src/pages/settlements.tsx` - Settlement console

### **Documentation**
- `X402_ENDPOINT_ARCHITECTURE.md` - Complete architecture guide
- `REAL_PAYMENT_INTEGRATION.md` - Payment integration details

---

## 🎯 **Summary**

**How x402 Endpoints Are Exposed**:

1. **Endpoint**: `POST /settlement/run` (x402-protected)
2. **Payment Gate**: Backend checks `checkJobPayment(jobId)` on smart contract
3. **Response**: Returns HTTP 402 with payment details if unpaid
4. **Payment**: User pays via MetaMask → `payForSettlement(jobId)`
5. **Verification**: Backend re-checks payment on-chain
6. **Execution**: Proceeds with settlement if payment verified

**The x402 pattern enables trustless, blockchain-verified payment gates for premium API operations!** 🔐💰

All documentation has been created in `X402_ENDPOINT_ARCHITECTURE.md` with complete details!
