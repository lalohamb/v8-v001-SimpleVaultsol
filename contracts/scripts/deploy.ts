import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using signer:", deployer.address);

  // Deploy SimpleVault contract
  const Vault = await ethers.getContractFactory("SimpleVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  
  const vaultAddress = await vault.getAddress();
  console.log("SimpleVault deployed to:", vaultAddress);
  
  // Make a test deposit
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

