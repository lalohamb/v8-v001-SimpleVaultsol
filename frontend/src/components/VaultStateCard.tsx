import React from "react";
import { weiToEther } from "../lib/api";

interface VaultStateCardProps {
  balanceWei?: string;
  recommendedLimitWei?: string;
  userAddress?: string;
}

export default function VaultStateCard({
  balanceWei,
  recommendedLimitWei,
  userAddress,
}: VaultStateCardProps) {
  return (
    <div className="vault-state-card">
      <h3>Vault State</h3>
      {userAddress && (
        <div className="state-row">
          <span className="label">User:</span>
          <span className="value monospace">{userAddress}</span>
        </div>
      )}
      {balanceWei && (
        <div className="state-row">
          <span className="label">Balance:</span>
          <span className="value">{weiToEther(balanceWei)} CRO</span>
        </div>
      )}
      {recommendedLimitWei && (
        <div className="state-row">
          <span className="label">Recommended Limit:</span>
          <span className="value">{weiToEther(recommendedLimitWei)} CRO</span>
        </div>
      )}
      {!balanceWei && !recommendedLimitWei && !userAddress && (
        <p className="empty-state">No vault state loaded</p>
      )}
    </div>
  );
}

