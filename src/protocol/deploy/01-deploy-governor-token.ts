import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../../config/helper-hardhat-config";
import { ethers } from "hardhat";

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("----------------------------------------------------");
  log(`Deploying protocol at NETWORK: ${network.name}`);
  log(`Deployer account: ${deployer}`);
  log("Deploying GovernanceToken and waiting for confirmations...");
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`Deployed GovernanceToken at ${governanceToken.address}`);
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governanceToken.address, []);
  }
  log(`Delegating to ${deployer}`);
  await delegate(governanceToken.address, deployer);
  log("Delegated!");
};

/**
 * By default, token balance does not account for voting power.
 * This makes transfers cheaper. The downside is that it requires
 * users to delegate to themselves in order to activate checkpoints
 * and have their voting power tracked.
 * @param governanceTokenAddress
 * @param delegatedAccount
 */
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
  const transactionResponse = await governanceToken.delegate(delegatedAccount);
  await transactionResponse.wait(1);
  console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};

export default deployGovernanceToken;
deployGovernanceToken.tags = ["all", "governor"];
