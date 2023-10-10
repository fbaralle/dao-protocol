import network from "@/shared/config/network.config.js";

const COINMARKETCAP_API_KEY =
  process.env.COINMARKETCAP_API_KEY || "a0e6b7d3-34b7-47ec-afad-f150742ca6b4"; // just for testing purposes
const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/0864dcc0f70b41afb99c69d2fb7ab81e"; // just for testing purposes
export const DEPLOYER_ACCOUNT_PRIVATE_KEY =
  process.env.PRIVATE_KEY || "966ed0940ae7f6da18012c753c4ba06f0f644ddc7116730cd89c67734d097420"; // just for testing purposes
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config = () => ({
  NETWORK: network().network,
  DEFAULT_DEV_NETWORK: network().defaultDevNetwork,
  IS_TESTNET: network().isTestnet,
  TX_CHAINING_ENABLED: process.env.TX_CHAINING_ENABLED === "true",
  SUPPORTED_NETWORKS: {
    // Development fake blockchains
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },

    // Testnet blockchains
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [DEPLOYER_ACCOUNT_PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  DEPLOYER_ACCOUNT_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  COINMARKETCAP_API_KEY,
  SEPOLIA_RPC_URL,
});

export type configObjType = ReturnType<typeof config>;
export type configObjKeys = keyof configObjType;

export default config;
