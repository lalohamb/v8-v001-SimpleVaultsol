import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleVault", () => {
  it("should accept deposits and allow withdrawals", async () => {
    const [user] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("SimpleVault");
    const vault = await Vault.deploy();
    await vault.waitForDeployment();

    const vaultAddress = await vault.getAddress();

    // Deposit 1 ETH
    const depositTx = await vault.connect(user).deposit({
      value: ethers.parseEther("1")
    });
    await depositTx.wait();

    const bal = await vault.balances(user.address);
    expect(bal).to.equal(ethers.parseEther("1"));

    // Withdraw 0.4 ETH
    const withdrawTx = await vault.connect(user).withdraw(
      ethers.parseEther("0.4")
    );
    await withdrawTx.wait();

    const finalBal = await vault.balances(user.address);
    expect(finalBal).to.equal(ethers.parseEther("0.6"));

    console.log("Vault deployed at:", vaultAddress);
  });
});
