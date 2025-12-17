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

  const notes =
    `balance=${balanceWei} proposed=${proposedLimitWei} final=${finalWei} pctCap=${pctCap}` +
    (maxAbsWei != null ? ` absCap=${maxAbsWei}` : "");

  return { finalWei, notes };
}

export function sanitizeReason(reason: string): string {
  const s = (reason || "").replace(/\s+/g, " ").trim();
  return s.length > 200 ? s.slice(0, 200) : s;
}
