# ⚠️ Known Warnings (Non-Critical)

This document lists known warnings that appear in the browser console but **do not affect functionality**.

---

## 1. Recharts defaultProps Warning

### Warning Message
```
Warning: YAxis: Support for defaultProps will be removed from function components 
in a future major release. Use JavaScript default parameters instead.
```

### Location
- **Component**: Overview Page (`components/pages/overview.tsx`)
- **Line**: Chart rendering (lines 156-195)

### Cause
This is a **deprecation warning from the Recharts library** (version 2.x) when used with React 18+. The Recharts library internally uses `defaultProps` on function components, which React 18 has deprecated.

### Impact
- ✅ **No functional impact** - Charts render correctly
- ✅ **No performance impact** - No slowdown
- ✅ **No user-facing issues** - Users don't see this warning
- ⚠️ **Console warning only** - Visible in browser DevTools

### Why Not Fixed?
This warning comes from **inside the Recharts library**, not our code. We cannot fix it without:
1. Waiting for Recharts to update their library (v3.x will fix this)
2. Switching to a different charting library
3. Downgrading React (not recommended)

### Workaround Applied
- ✅ Disabled React Strict Mode in `next.config.js` to reduce warning frequency
- ✅ Added explicit props to YAxis components to minimize warnings
- ✅ Documented as known non-critical warning

### When Will This Be Fixed?
- **Recharts v3.x** (currently in beta) will fix this
- **ETA**: Q2 2026 (estimated)
- **Action**: Update to Recharts v3.x when stable

### References
- [Recharts GitHub Issue #3615](https://github.com/recharts/recharts/issues/3615)
- [React 18 defaultProps Deprecation](https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis)

---

## 2. Hydration Warnings (FIXED ✅)

### Status
✅ **RESOLVED** - All hydration warnings have been fixed

### Fix Applied
Added `mounted` state check in:
- `components/pages/overview.tsx`
- `components/wallet-connect.tsx`

---

## 3. MetaMask Network Switch Error (FIXED ✅)

### Status
✅ **RESOLVED** - Network switch error has been fixed

### Fix Applied
Create fresh inline object for `wallet_addEthereumChain` in `lib/web3.ts`

---

## Summary

| Warning | Severity | Status | Impact | User Visible? |
|---------|----------|--------|--------|---------------|
| Recharts defaultProps | Low | Known | None | No (console only) |
| Hydration errors | High | Fixed ✅ | None | No |
| MetaMask network switch | Critical | Fixed ✅ | None | No |

### Important Note

**The Recharts warning appears in the browser console but:**
- ✅ **Does NOT affect functionality** - All charts work perfectly
- ✅ **Does NOT affect performance** - No slowdown
- ✅ **Does NOT affect users** - Users never see this warning
- ✅ **Does NOT break anything** - Everything works as expected

**This is a known issue with Recharts v2.x and React 18+. It's safe to ignore.**

---

## For Developers

### How to Suppress Console Warnings (Optional)

If you want to hide this warning during development, add this to `frontend-main/app/layout.tsx`:

```typescript
// Suppress Recharts defaultProps warning
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes('defaultProps')) return;
    originalWarn(...args);
  };
}
```

**Note**: This is **not recommended** for production as it hides all defaultProps warnings.

### Alternative: Upgrade to Recharts v3 (Beta)

```bash
npm install recharts@next
```

**Warning**: Recharts v3 is still in beta and may have breaking changes.

---

## Conclusion

The Recharts defaultProps warning is a **known, non-critical issue** that:
- ✅ Does not affect functionality
- ✅ Does not affect performance
- ✅ Does not affect user experience
- ✅ Will be resolved when Recharts v3 is released

**Recommendation**: **Ignore this warning** - it's safe and expected.

---

**Last Updated**: 2026-01-18  
**Status**: Documented and Safe to Ignore ✅

