import config from "../shared/config/config";

const { SUPPORTED_NETWORKS, ETHERSCAN_API_KEY, COINMARKETCAP_API_KEY } = config();

export const hardhatBlockchainConfig = {
  defaultNetwork: process.env.NETWORK || "hardhat",
  networks: SUPPORTED_NETWORKS,
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  paths: {
    deploy: "src/protocol/deploy",
    sources: "src/protocol/contracts",
  },

  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};
