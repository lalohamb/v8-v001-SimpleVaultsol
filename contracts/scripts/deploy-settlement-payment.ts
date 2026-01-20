import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SettlementPayment contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "CRO\n");

  // Configuration
  const RECIPIENT_ADDRESS = deployer.address; // Change this to your desired recipient address
  const SETTLEMENT_FEE = ethers.parseEther("1.0"); // 1.0 TCRO per settlement

  console.log("Configuration:");
  console.log("- Recipient:", RECIPIENT_ADDRESS);
  console.log("- Settlement Fee:", ethers.formatEther(SETTLEMENT_FEE), "TCRO\n");

  // Deploy SettlementPayment
  const SettlementPayment = await ethers.getContractFactory("SettlementPayment");
  const settlementPayment = await SettlementPayment.deploy(RECIPIENT_ADDRESS, SETTLEMENT_FEE);

  await settlementPayment.waitForDeployment();
  const address = await settlementPayment.getAddress();

  console.log("✅ SettlementPayment deployed to:", address);
  console.log("\n📋 Contract Details:");
  console.log("- Owner:", await settlementPayment.owner());
  console.log("- Recipient:", await settlementPayment.recipient());
  console.log("- Settlement Fee:", ethers.formatEther(await settlementPayment.settlementFee()), "TCRO");

  console.log("\n🔧 Add this to your .env file:");
  console.log(`SETTLEMENT_PAYMENT_ADDRESS=${address}`);

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

