npm install
npx hardhat compile
npm run deploy:testnet
npm hardhat node


## lalo@lalo-OptiPlex-7040:~/_BoltAI/CRONOS-HACKATHON/v3/contracts$ npm run deploy:testnet

> cronos-contracts@0.1.0 deploy:testnet
> hardhat run scripts/deploy.ts --network cronosTestnet

Using signer: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
SimpleVault deployed to: 0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a
Deposit tx hash: 0x629080e24a1bbff4b589573add6f841c4aeceea39163ac1eeac6522954ba28d9
Deposit confirmed


## lalo@lalo-OptiPlex-7040:~/_BoltAI/CRONOS-HACKATHON/v3/contracts$ npm run deploy:testnet

> cronos-contracts@0.1.0 deploy:testnet
> hardhat run scripts/deploy.ts --network cronosTestnet

Using signer: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
SimpleVault deployed to: 0x656a4D09f53ab82f6B291082cb3159F7c14424dE
Deposit tx hash: 0x87694f13e8a55191d633dda14d04f08709de57a0e620b84cc7bfc4938e82d429
Deposit confirmed

===========
## ⠙🚀 Deploying SettlementPayment contract...

Deploying with account: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
Account balance: 192.6883250605625 CRO

Configuration:
- Recipient: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
- Settlement Fee: 1.0 TCRO

✅ SettlementPayment deployed to: 0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0

📋 Contract Details:
- Owner: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
- Recipient: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
- Settlement Fee: 1.0 TCRO

🔧 Add this to your .env file:
SETTLEMENT_PAYMENT_ADDRESS=0xF5C2d702A0d483D4Be9c00E44f2C753aa54F1db0

✅ Deployment complete!


⠙================
## Cronos Testnet Wallet: 0xD44d1DC5648542157d1D989580Bf4597e5d771d5
