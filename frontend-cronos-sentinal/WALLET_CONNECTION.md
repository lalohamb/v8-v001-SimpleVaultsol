# Wallet Connection Guide

## Supported Wallets

The application supports the following Ethereum-compatible wallets:

1. **Crypto.com DeFi Wallet** (Recommended for Cronos)
   - Chrome Extension: https://crypto.com/defi-wallet
   - Automatically detected as the primary wallet if installed

2. **MetaMask**
   - Chrome Extension: https://metamask.io/download/
   - Works with Cronos Testnet after adding the network

3. **Any EIP-1193 Compatible Wallet**
   - Must support `window.ethereum` provider

## Network Configuration

The application is configured for **Cronos Testnet**:
- Chain ID: `338` (0x152 in hex)
- RPC URL: https://evm-t3.cronos.org
- Currency: TCRO
- Block Explorer: https://explorer.cronos.org/testnet

## How to Connect

1. **Install a Wallet**
   - Install Crypto.com DeFi Wallet or MetaMask browser extension
   - Create or import a wallet account

2. **Click "Connect Wallet"**
   - The app will automatically detect your installed wallet
   - Approve the connection request in your wallet

3. **Switch to Cronos Testnet**
   - The app will prompt you to switch to Cronos Testnet
   - Approve the network switch or add the network if prompted
   - If the network isn't added automatically, you can add it manually with the configuration above

## Troubleshooting

### Wallet Not Detected
- Make sure you have a wallet extension installed
- Refresh the page after installing the wallet
- Check that the extension is enabled in your browser

### Connection Not Persisting
- The wallet connection should persist across page refreshes
- If it doesn't, check your wallet's connection settings
- Make sure you haven't disconnected from the site in your wallet

### Wrong Network Error
- Click on your wallet extension
- Switch to Cronos Testnet manually
- Or click "Connect Wallet" again to trigger the network switch

### Multiple Wallets Installed
- The app prioritizes Crypto.com DeFi Wallet if detected
- Otherwise, it uses the standard `window.ethereum` provider
- You can select your preferred wallet in your browser's extension settings

## Developer Notes

The wallet connection logic:
- Checks for `window.defiWallet` first (Crypto.com DeFi Wallet)
- Falls back to `window.ethereum` (MetaMask and others)
- Listens for account changes, network changes, and disconnections
- Automatically verifies the connected network is Cronos Testnet
- Persists connection state across page refreshes

## Getting Test TCRO

To interact with the vault, you'll need test TCRO:
1. Visit the Cronos Testnet Faucet: https://cronos.org/faucet
2. Enter your wallet address
3. Request test TCRO tokens

