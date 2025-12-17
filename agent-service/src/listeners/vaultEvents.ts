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

  const provider = new ethers.WebSocketProvider(
    CRONOS_TESTNET_RPC.replace("http", "ws")
  );

  const vault = new ethers.Contract(
    SIMPLE_VAULT_ADDRESS,
    SIMPLE_VAULT_ABI,
    provider
  );

  console.log("[vaultEvents] Listening for Deposited and Withdrawn events...");

  vault.on("Deposited", (user: string, amount: bigint, event: any) => {
    console.log(
      `[vaultEvents] Deposited: user=${user}, amount=${ethers.formatEther(
        amount
      )} CRO, tx=${event.transactionHash}`
    );
    // TODO: feed this into AI logic and possibly call agentSetWithdrawLimit(...)
  });

  vault.on("Withdrawn", (user: string, amount: bigint, event: any) => {
    console.log(
      `[vaultEvents] Withdrawn: user=${user}, amount=${ethers.formatEther(
        amount
      )} CRO, tx=${event.transactionHash}`
    );
    // TODO: AI risk analysis or logging.
  });
}
