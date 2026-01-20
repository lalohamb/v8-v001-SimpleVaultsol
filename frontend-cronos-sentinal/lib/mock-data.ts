// ============================================================================
// Mock Data - HTTP 402 Protocol Example
// ============================================================================
// This file now only contains documentation/example data that is intentionally
// kept as mock data for demonstration purposes.
//
// All other mock data has been replaced with real data from:
// - Blockchain events (via web3.ts)
// - Agent Service API (via api.ts)
// - Calculated values (via data-service.ts)
// ============================================================================

export const mockHttp402Response = `HTTP/1.1 402 Payment Required
Date: Sat, 18 Jan 2026 14:18:10 GMT
Content-Type: application/json
X-Payment-Required: true
X-Payment-Protocol: x402-v1

{
  "error": "payment_required",
  "message": "This operation requires payment authorization",
  "payment": {
    "amount": "0.00012",
    "currency": "BTC",
    "method": "lightning",
    "invoice": "lnbc120n1p3xr2...",
    "expires_at": "2026-01-18T14:28:10Z"
  },
  "action": {
    "type": "withdrawal",
    "amount": "12500",
    "currency": "CRO",
    "destination": "0x742d...3f1a"
  }
}`;
