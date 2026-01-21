import React from "react";

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Welcome to Cronos AI Vault Platform</h2>
        
        <div className="modal-section">
          <h3>🔗 Connection Information</h3>
          <p>This application connects to the <strong>Cronos Testnet</strong> blockchain network.</p>
        </div>

        <div className="modal-section">
          <h3>🦊 Required Setup</h3>
          <p>To interact with this platform, you'll need:</p>
          <ul>
            <li>
              <strong>Cronos Wallet</strong> - Chrome extension for managing your wallet
              <br />
              <a href="https://chromewebstore.google.com/detail/cronos-wallet/mhpnmfpnpgmjmkchpkfhfbcmdjdgfhfh" target="_blank" rel="noopener noreferrer">
                Download Cronos Wallet Extension →
              </a>
            </li>
            <li>
              <strong>Cronos Testnet</strong> - Configure your wallet to use the testnet
              <br />
              <a href="https://docs.cronos.org/getting-started/cronos-testnet" target="_blank" rel="noopener noreferrer">
                Testnet Configuration Guide →
              </a>
            </li>
            <li>
              <strong>Test Tokens</strong> - Get free testnet tokens from the faucet
              <br />
              <a href="https://cronos.org/faucet" target="_blank" rel="noopener noreferrer">
                Cronos Testnet Faucet →
              </a>
            </li>
          </ul>
        </div>

        <button className="btn-primary btn-large" onClick={onClose}>
          OK, Let's Start
        </button>
      </div>
    </div>
  );
}
