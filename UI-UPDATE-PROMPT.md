# UI Update Prompt: Cronos AI Vault Platform

## Context
Update the existing Next.js frontend to support four new extended vault contracts with enhanced features beyond the base SimpleVault.

## Current UI Structure
- Dashboard: Service health, AI status, agent overview
- Agent Console: Execute agents, view decisions
- Settlement Console: x402 payment workflow, settlement execution

## Required UI Updates

### 1. Vault Selection Component
Create a vault type selector allowing users to interact with:
- SimpleVault (base)
- SimpleVaultFee (fee mechanisms)
- SimpleVaultYield (yield strategies)
- SimpleVaultMultiToken (multi-token support)
- SimpleVaultGovern (governance features)

### 2. SimpleVaultFee UI
**New Page: `/vault/fee`**

Components needed:
- Fee rate display (deposit fee %, withdrawal fee %)
- Real-time fee calculator (input amount → show net amount after fees)
- Total fees collected counter
- Fee collection button (owner only)
- Fee settings panel (owner only):
  - Adjust deposit fee rate slider (0-10%)
  - Adjust withdrawal fee rate slider (0-10%)
  - Set fee recipient address

User flows:
- Deposit: Show "You deposit 100 CRO → You receive 99.5 CRO (0.5 CRO fee)"
- Withdraw: Show "You withdraw 100 CRO → You receive 99 CRO (1 CRO fee)"

### 3. SimpleVaultYield UI
**New Page: `/vault/yield`**

Components needed:
- APY display (current yield rate %)
- User balance breakdown:
  - Principal balance
  - Pending yield (real-time counter)
  - Total balance (principal + yield)
- Yield actions:
  - "Claim Yield" button
  - "Compound Yield" button
- Yield history chart (earnings over time)
- Yield calculator: "If you deposit X CRO for Y days at Z% APY = earnings"

User flows:
- Show live yield accrual ticker
- Display time until next yield update
- Compound vs claim comparison

### 4. SimpleVaultMultiToken UI
**New Page: `/vault/multi-token`**

Components needed:
- Token selector dropdown (supported tokens list)
- Multi-token balance table:
  - Columns: Token | Balance | USD Value | Actions
  - Rows: CRO, USDC, USDT, etc.
- Per-token deposit/withdraw forms
- Token management panel (owner only):
  - Add supported token (address input)
  - Remove supported token
- AI agent limits per token display
- Portfolio pie chart (token distribution)

User flows:
- Switch between tokens for deposit/withdraw
- View all balances in one dashboard
- See AI recommendations per token

### 5. SimpleVaultGovern UI
**New Page: `/vault/governance`**

Components needed:
- Governance dashboard:
  - Your voting power display
  - Active proposals count
  - Voting period countdown
- Proposal list (card layout):
  - Proposal ID & title
  - Proposer address
  - Votes for/against (progress bars)
  - Time remaining
  - Status badge (Active/Passed/Rejected/Executed)
- Create proposal form:
  - Description textarea
  - Proposal type selector (Change Agent/Change Owner/Emergency Pause/Parameter Change)
  - Proposal data input (address or boolean)
  - Submit button (disabled if below threshold)
- Proposal detail view:
  - Full description
  - Vote buttons (For/Against)
  - Execute button (if passed and period ended)
  - Voter list
- Emergency controls (governance only):
  - Pause vault button
  - Unpause vault button
- Settings panel (owner only):
  - Voting period slider
  - Proposal threshold input
  - Quorum threshold input

User flows:
- Browse active proposals
- Vote on proposal (show voting power used)
- Create new proposal (check threshold first)
- Execute passed proposal

### 6. Enhanced Agent Console Updates
**Update existing `/agents` page**

Add agent context for new vaults:
- For Fee vault: Show fee impact on agent recommendations
- For Yield vault: Include yield in balance calculations
- For MultiToken vault: Agent decisions per token
- For Govern vault: Show if agent change proposal exists

### 7. Enhanced Settlement Console Updates
**Update existing `/settlements` page**

Add settlement options:
- Fee-aware settlements (show net amount after fees)
- Yield-inclusive settlements (option to include pending yield)
- Multi-token settlements (select token for settlement)
- Governance-gated settlements (check if vault paused)

### 8. Navigation Updates
Add new navigation items:
- Vaults dropdown:
  - Base Vault
  - Fee Vault
  - Yield Vault
  - Multi-Token Vault
  - Governance Vault

### 9. Shared Components to Create
- `VaultSelector.tsx` - Switch between vault types
- `FeeCalculator.tsx` - Calculate fees for any amount
- `YieldTracker.tsx` - Real-time yield display
- `TokenBalanceTable.tsx` - Multi-token balance grid
- `ProposalCard.tsx` - Governance proposal display
- `VotingPowerBadge.tsx` - Show user's voting power
- `VaultStatusBanner.tsx` - Show if vault is paused

### 10. API Integration Requirements
Add new API endpoints to call:
- `/vault/fee/*` - Fee operations
- `/vault/yield/*` - Yield operations
- `/vault/multi-token/*` - Token operations
- `/vault/governance/*` - Governance operations

### 11. State Management
Add to context/state:
- Selected vault type
- Fee rates
- Yield rates and pending amounts
- Supported tokens list
- Active proposals
- User voting power
- Vault paused status

### 12. Design Requirements
- Maintain existing CSS variable system
- Use consistent card layouts
- Add new color variables:
  - `--color-fee` (for fee indicators)
  - `--color-yield` (for yield/earnings)
  - `--color-governance` (for proposals)
- Responsive design for all new pages
- Loading states for all async operations
- Error boundaries for each vault type

### 13. User Experience Enhancements
- Tooltips explaining each feature
- Confirmation modals for critical actions
- Success/error toast notifications
- Transaction pending indicators
- Real-time updates via polling or websockets
- Wallet connection status per vault

## Implementation Priority
1. Vault selector component (foundation)
2. Fee vault UI (simplest)
3. Yield vault UI (moderate complexity)
4. Multi-token vault UI (moderate complexity)
5. Governance vault UI (most complex)
6. Enhanced agent/settlement consoles
7. Polish and testing

## Technical Constraints
- Use existing Next.js 14 setup
- Maintain TypeScript strict mode
- Keep Axios for API calls
- Use existing CSS approach (no new libraries)
- Ensure mobile responsiveness
- Support wallet connection (MetaMask/WalletConnect)

## Success Criteria
- Users can interact with all 5 vault types
- All vault features accessible via UI
- No functionality requires direct contract interaction
- Clear visual feedback for all actions
- Governance flow is intuitive
- Multi-token management is seamless
