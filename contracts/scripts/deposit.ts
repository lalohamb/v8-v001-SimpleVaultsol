import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using signer:", deployer.address);

  const vaultAddress = process.env.SIMPLE_VAULT_ADDRESS;
  if (!vaultAddress) {
    throw new Error("SIMPLE_VAULT_ADDRESS not set in .env file");
  }

  const Vault = await ethers.getContractFactory("SimpleVault");
  const vault = Vault.attach(vaultAddress);

  const tx = await vault.deposit({
    value: ethers.parseEther("0.1") // deposit 0.1 CRO equivalent
  });
  console.log("Deposit tx hash:", tx.hash);
  await tx.wait();
  console.log("Deposit confirmed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
