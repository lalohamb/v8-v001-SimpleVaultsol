export function clampLimit(args: {
  balanceWei: bigint;
  proposedLimitWei: bigint;
  maxPct: number;           // e.g. 50
  maxAbsWei?: bigint | null; // optional
}): { finalWei: bigint; notes: string } {
  const { balanceWei, proposedLimitWei, maxPct, maxAbsWei } = args;

  let finalWei = proposedLimitWei;

  // hard: never exceed balance
  if (finalWei > balanceWei) finalWei = balanceWei;

  // percent cap
  const pctCap = (balanceWei * BigInt(maxPct)) / 100n;
  if (finalWei > pctCap) finalWei = pctCap;

  // absolute cap
  if (maxAbsWei != null && finalWei > maxAbsWei) finalWei = maxAbsWei;

  // avoid 0 when balance > 0
  if (balanceWei > 0n && finalWei === 0n) finalWei = 1n;

  // Convert to human-readable CRO values
  const toEther = (wei: bigint) => (Number(wei) / 1e18).toFixed(4);
  
  const notes = [
    `Vault Balance: ${toEther(balanceWei)} CRO`,
    `Agent Proposed: ${toEther(proposedLimitWei)} CRO`,
    `Final Approved: ${toEther(finalWei)} CRO`,
    `Max Allowed (${maxPct}%): ${toEther(pctCap)} CRO`,
    maxAbsWei != null ? `Absolute Cap: ${toEther(maxAbsWei)} CRO` : null
  ].filter(Boolean).join(' • ');

  return { finalWei, notes };
}

export function sanitizeReason(reason: string): string {
  const s = (reason || "").replace(/\s+/g, " ").trim();
  return s.length > 200 ? s.slice(0, 200) : s;
}
