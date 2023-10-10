export default () => ({
  network: process.env.NETWORK || (process.env.NODE_ENV === "development" ? "hardhat" : "mainnet"),
  isTestnet: (process.env.NETWORK || "mainnet") !== "mainnet",
  defaultDevNetwork: "hardhat",
});
