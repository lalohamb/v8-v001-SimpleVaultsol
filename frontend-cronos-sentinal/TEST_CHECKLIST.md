# 🧪 Frontend Testing Checklist

## Pre-Test Setup
- [ ] Frontend running on http://localhost:3000
- [ ] Agent-service running on http://localhost:3001
- [ ] MetaMask installed in browser
- [ ] Browser console open (F12)

---

## 🏠 Overview Page

### Visual Elements
- [ ] Page title: "System Overview"
- [ ] 4 metric cards visible (Vault Balance, Pending Transactions, Agent States, Risk Evaluation)
- [ ] Balance history chart renders
- [ ] Risk posture card shows level and score
- [ ] Recent events list displays
- [ ] Action boundary section visible

### Functionality
- [ ] Page loads without errors
- [ ] No hydration errors in console
- [ ] Vault balance shows "Connect wallet to view balance" (if not connected)
- [ ] All mock data displays correctly
- [ ] Chart is interactive (hover shows tooltip)

### With Wallet Connected
- [ ] Vault balance shows real CRO amount
- [ ] "Last updated" timestamp displays
- [ ] Balance updates every 30 seconds

---

## 🤖 AI Agents Page

### Visual Elements
- [ ] Page title: "AI Agents"
- [ ] Subtitle: "Hybrid intelligence: 3 deterministic agents + 1 AI advisor"
- [ ] 4 agent cards visible in grid layout
- [ ] Each card shows: icon, name, type badge, mode badge, status badge

### Agent Cards
- [ ] Settlement Batch Optimizer (Deterministic, Auto)
- [ ] Withdrawal Risk Sentinel (Deterministic, Auto)
- [ ] Emergency Brake (Deterministic, Auto)
- [ ] 02 Portfolio Rebalancer (AI-Powered, Recommend)

### Functionality
- [ ] Page loads without errors
- [ ] Agents fetch from API (check Network tab)
- [ ] Click agent card → Side panel opens
- [ ] Side panel shows: description, guardrails, decisions
- [ ] "Override Agent" button visible
- [ ] Click override → Confirmation modal appears
- [ ] Close side panel works

### Error States
- [ ] If agent-service down: "No agents available" message
- [ ] Loading state shows while fetching

---

## 🔒 Vault Controls Page

### Visual Elements
- [ ] Page title: "Vault Controls"
- [ ] Emergency Brake card (top)
- [ ] Withdrawal Request card
- [ ] Limit Adjustments card
- [ ] Auto-Execution Settings card

### Emergency Brake
- [ ] Shows "ARMED" badge when inactive (green)
- [ ] Shows "ACTIVE" badge when active (red)
- [ ] Toggle button works
- [ ] Confirmation modal appears on toggle
- [ ] State persists after page refresh
- [ ] Warning message shows when active

### Withdrawal Request
- [ ] Amount input field visible
- [ ] Recommended limit displays
- [ ] "Request Withdrawal" button enabled
- [ ] Click button → Confirmation modal
- [ ] Modal shows risk assessment
- [ ] Cancel/Confirm buttons work

### Limit Adjustments
- [ ] Current limit displays
- [ ] New limit input field
- [ ] "Update Limit" button
- [ ] Click button → Confirmation modal
- [ ] Modal shows impact analysis

### Auto-Execution
- [ ] Toggle switch visible
- [ ] Current state displays
- [ ] Toggle → Confirmation modal
- [ ] State changes after confirmation

---

## 💳 x402 Transactions Page

### Visual Elements
- [ ] Page title: "x402 Transactions"
- [ ] Transaction lifecycle diagram (5 steps)
- [ ] HTTP 402 protocol example code block
- [ ] Transaction history table

### Transaction Lifecycle
- [ ] 5 steps visible: Initiated → 402 Challenge → Payment → Checkpoint → Settlement
- [ ] Steps connected with lines
- [ ] Each step numbered and labeled

### HTTP 402 Example
- [ ] Code block displays
- [ ] Syntax highlighting (if any)
- [ ] Readable formatting

### Transaction History
- [ ] Multiple transaction cards visible
- [ ] Each shows: Job ID, operation, status, amount, timestamp
- [ ] Status badges color-coded (green=completed, yellow=pending)
- [ ] Click transaction → Side panel opens
- [ ] Side panel shows full details
- [ ] Transaction hash displays (if available)

---

## 📊 Monitoring & Logs Page

### Visual Elements
- [ ] Page title: "Monitoring & Logs"
- [ ] Filter section with 3 dropdowns
- [ ] Export button (top right)
- [ ] Log entries list

### Filters
- [ ] Severity filter: All, Info, Warn, Critical
- [ ] Agent filter: All + individual agents
- [ ] Subsystem filter: All + individual subsystems
- [ ] Filters update log list immediately

### Log Display
- [ ] Logs show timestamp, severity icon, message
- [ ] Severity colors: Blue (info), Yellow (warn), Red (critical)
- [ ] Agent and subsystem tags visible
- [ ] Logs are scrollable

### Export
- [ ] Click "Export Logs" button
- [ ] File downloads as JSON
- [ ] Filename includes timestamp
- [ ] File contains filtered logs

---

## 🏗️ Architecture Page

### Visual Elements
- [ ] Page title: "System Architecture"
- [ ] Architecture diagram visible
- [ ] 4 components: Frontend → Backend → Contracts → Cronos
- [ ] Arrows connecting components
- [ ] x402 Payment Gate section
- [ ] Agent Layer section
- [ ] Technology Stack section
- [ ] Key Features section
- [ ] Security Measures section

### Content
- [ ] All text readable
- [ ] Icons display correctly
- [ ] Color coding consistent
- [ ] Sections well-organized

---

## 🎨 Dashboard Layout

### Sidebar
- [ ] Logo/title at top
- [ ] 6 navigation items visible
- [ ] Icons display correctly
- [ ] Active page highlighted
- [ ] Click navigation → Page changes
- [ ] Smooth transitions

### Top Bar
- [ ] Network indicator: "Cronos Testnet"
- [ ] "Mainnet-ready" badge
- [ ] Wallet Connect button
- [ ] "View Audit Log" button
- [ ] All elements aligned properly

### Mobile (resize browser to <768px)
- [ ] Sidebar collapses
- [ ] Hamburger menu appears
- [ ] Click hamburger → Sidebar slides in
- [ ] Navigation still works
- [ ] Close button visible

---

## 🔌 Wallet Connect

### Disconnected State
- [ ] "Connect Wallet" button visible
- [ ] Click button → MetaMask popup
- [ ] Approve connection → Address displays
- [ ] Network switch prompt appears
- [ ] Approve network switch → Connected

### Connected State
- [ ] Green "Connected" badge
- [ ] Address displays (shortened format: 0x1234...5678)
- [ ] Click address → Disconnect option
- [ ] Disconnect works

### Error States
- [ ] MetaMask not installed → Opens download page
- [ ] User rejects connection → Error badge shows
- [ ] Network switch fails → Error message
- [ ] Wrong network → Auto-switch prompt

### Listeners
- [ ] Switch account in MetaMask → Address updates
- [ ] Switch network in MetaMask → Page reloads

---

## 📋 Audit Log Drawer

### Functionality
- [ ] Click "View Audit Log" → Drawer opens from right
- [ ] Drawer shows log entries
- [ ] Each entry has: timestamp, action, user, status
- [ ] Status badges color-coded
- [ ] Scrollable content
- [ ] Close button works
- [ ] Click outside → Drawer closes

---

## 🐛 Error Checking

### Console (F12)
- [ ] No React errors
- [ ] No hydration errors
- [ ] No TypeScript errors
- [ ] No 404s in Network tab
- [ ] API calls succeed (or fail gracefully)

### Network Tab
- [ ] `GET /agents/list` → 200 OK (if agent-service running)
- [ ] `GET /health` → 200 OK (if agent-service running)
- [ ] No failed requests (or handled gracefully)

### Performance
- [ ] Page loads in <3 seconds
- [ ] Navigation is instant
- [ ] No lag when clicking buttons
- [ ] Charts render smoothly

---

## ✅ Final Checks

- [ ] All 6 pages accessible
- [ ] No broken links
- [ ] All buttons clickable
- [ ] All modals open/close
- [ ] All forms validate input
- [ ] All data displays correctly
- [ ] Responsive on mobile
- [ ] Dark theme consistent
- [ ] Typography readable
- [ ] Icons display correctly

---

## 🎯 Test Results

**Date**: ___________  
**Tester**: ___________  
**Browser**: ___________  
**Passed**: ___ / ___  
**Failed**: ___ / ___  

**Notes**:
_______________________________________
_______________________________________
_______________________________________

**Status**: [ ] PASS  [ ] FAIL  [ ] NEEDS WORK

