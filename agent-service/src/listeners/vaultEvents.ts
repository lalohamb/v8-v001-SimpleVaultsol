import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const CRONOS_TESTNET_RPC =
  process.env.CRONOS_TESTNET_RPC || "https://evm-t3.cronos.org";
const SIMPLE_VAULT_ADDRESS = process.env.SIMPLE_VAULT_ADDRESS || "";

const SIMPLE_VAULT_ABI = [
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)"
];

export async function startVaultEventListener() {
  if (!SIMPLE_VAULT_ADDRESS) {
    console.warn(
      "[vaultEvents] SIMPLE_VAULT_ADDRESS not set. Event listener will not start."
    );
    return;
  }

  const provider = new ethers.JsonRpcProvider(CRONOS_TESTNET_RPC);
  const vault = new ethers.Contract(
    SIMPLE_VAULT_ADDRESS,
    SIMPLE_VAULT_ABI,
    provider
  );

  console.log("[vaultEvents] Polling for Deposited and Withdrawn events...");

  let lastBlock = await provider.getBlockNumber();

  // Poll every 5 seconds
  setInterval(async () => {
    try {
      const currentBlock = await provider.getBlockNumber();
      if (currentBlock > lastBlock) {
        const depositFilter = vault.filters.Deposited();
        const withdrawFilter = vault.filters.Withdrawn();
        
        const deposits = await vault.queryFilter(depositFilter, lastBlock + 1, currentBlock);
        const withdrawals = await vault.queryFilter(withdrawFilter, lastBlock + 1, currentBlock);
        
        for (const event of deposits) {
          const log = event as ethers.EventLog;
          console.log(
            `[vaultEvents] Deposited: user=${log.args[0]}, amount=${ethers.formatEther(
              log.args[1]
            )} CRO, tx=${log.transactionHash}`
          );
        }
        
        for (const event of withdrawals) {
          const log = event as ethers.EventLog;
          console.log(
            `[vaultEvents] Withdrawn: user=${log.args[0]}, amount=${ethers.formatEther(
              log.args[1]
            )} CRO, tx=${log.transactionHash}`
          );
        }
        
        lastBlock = currentBlock;
      }
    } catch (err) {
      console.error("[vaultEvents] Polling error:", err);
    }
  }, 5000);
}
