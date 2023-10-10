import * as fs from "fs";
import { network, ethers } from "hardhat";
import { VoteWay } from "@/shared/typescript/protocol";
import { VOTING_PERIOD, developmentChains, proposalsFile } from "@/config/helper-hardhat-config";
import { moveBlocks } from "@/utils/move-blocks";

// Governor METHOD: catVoteBySig
// This method implements a meta-transaction, and allows a project to subsidize voting fees.
// The voters can generate a signature for free, and the project can then submit those and pay for the gas.

async function main() {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  // Get the last proposal for the network. You could also change it for your index
  const proposalId = proposals[network.config.chainId!].at(-1);
  const voteWay = VoteWay.FOR;
  await vote(proposalId, voteWay);
}

export async function vote(proposalId: string, voteWay: VoteWay, reason: string = "") {
  console.log("Voting...");
  const governor = await ethers.getContract("GovernorContract");
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
  const voteTxReceipt = await voteTx.wait(1);
  console.log(voteTxReceipt.events[0].args.reason);
  const proposalState = await governor.state(proposalId);
  console.log(`Current Proposal State: ${proposalState}`);
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
