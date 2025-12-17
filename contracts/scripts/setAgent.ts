import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const vaultAddress = process.env.SIMPLE_VAULT_ADDRESS || "0xe30093CF82Cb6bc4176a2e1F60B66DFb02811E8a";
  
  const SimpleVault = await ethers.getContractFactory("SimpleVault");
  const vault = SimpleVault.attach(vaultAddress);

  // Set the agent to the same address as the signer (for testing)
  const tx = await vault.setAgent(signer.address);
  console.log("Setting agent tx hash:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("Agent set successfully");
  
  // Verify the agent was set
  const agentAddress = await vault.agent();
  console.log("Agent address is now:", agentAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});