import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Repo-root Hardhat config for this structure:
 *
 * V3/
 * ├─ hardhat.config.ts   <-- (this file)
 * ├─ contracts/
 * │  ├─ contracts/       <-- Solidity sources
 * │  ├─ scripts/         <-- deploy scripts
 * │  └─ test/            <-- tests
 * └─ agent-service/ ...
 *
 * This config makes Hardhat treat `./contracts/*` as its working folders.
 */

const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").trim();
const CRONOS_TESTNET_RPC = (process.env.CRONOS_TESTNET_RPC || "https://evm-t3.cronos.org").trim();
const CRONOS_MAINNET_RPC = (process.env.CRONOS_MAINNET_RPC || "https://evm.cronos.org").trim();

// Optional: for contract verification later
const CRONOSCAN_API_KEY = (process.env.CRONOSCAN_API_KEY || "").trim();

// Validate private key length (should be 64 hex chars + optional 0x prefix)
const isValidPrivateKey = PRIVATE_KEY && (PRIVATE_KEY.length === 64 || (PRIVATE_KEY.startsWith('0x') && PRIVATE_KEY.length === 66));
const accounts = isValidPrivateKey ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },

  /**
   * IMPORTANT: point Hardhat to your actual folders
   */
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./contracts/cache",
    artifacts: "./contracts/artifacts"
  },

  networks: {
    hardhat: {},

    localhost: {
      url: "http://127.0.0.1:8545"
    },

    cronosTestnet: {
      url: CRONOS_TESTNET_RPC,
      chainId: 338,
      accounts
    },

    cronosMainnet: {
      url: CRONOS_MAINNET_RPC,
      chainId: 25,
      accounts
    }
  },

  /**
   * Optional: enable verification support (only matters if you add verify steps)
   * Cronoscan uses the Etherscan-style API shape.
   */
  etherscan: {
    apiKey: {
      cronos: CRONOSCAN_API_KEY,
      cronosTestnet: CRONOSCAN_API_KEY
    },
    customChains: [
      {
        network: "cronos",
        chainId: 25,
        urls: {
          apiURL: "https://api.cronoscan.com/api",
          browserURL: "https://cronoscan.com"
        }
      },
      {
        network: "cronosTestnet",
        chainId: 338,
        urls: {
          apiURL: "https://api-testnet.cronoscan.com/api",
          browserURL: "https://testnet.cronoscan.com"
        }
      }
    ]
  }
};

export default config;
