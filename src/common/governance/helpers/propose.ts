import { ethers, network } from "hardhat";
import {
  developmentChains,
  VOTING_DELAY,
  proposalsFile,
  STORE_FUNCTION,
  PROPOSAL_DESCRIPTION,
  NEW_STORE_VALUE,
} from "@/config/helper-hardhat-config";
import * as fs from "fs";
import { moveBlocks } from "@/utils/move-blocks";
import { getProposalDetails } from "./get-proposal-data";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
  // const provider = ethers.provider.listAccounts
  const governor = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");

  /** This is the actual proposal function, which is going to be called in the Box contract
   * if it passes through the governance process voted > approved > executed */
  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args);

  console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`);
  console.log(`Proposal Description:\n  ${proposalDescription}`);

  console.log("Calling Governor <propose> at", governor.address);
  const proposeTx = await governor.propose(
    [box.address], // proposal contract
    [0], // eth to transfer
    [encodedFunctionCall], // call data
    proposalDescription,
  );

  // Dev/Test mode: If working on a development chain, it will push forward till it gets to the voting period.
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }
  const proposeReceipt = await proposeTx.wait(2);
  const proposalId = proposeReceipt.events[0].args.proposalId;
  console.log(`Proposal created tx: ${proposeTx}`);
  console.log(`Proposed with proposal ID:\n  ${proposalId}`);

  // save the proposalId
  storeProposalId(proposalId);

  const proposalData = getProposalDetails(proposalId);
  console.log(proposalData);
}

function storeProposalId(proposalId: any) {
  const chainId = network.config.chainId!.toString();
  let proposals: any;

  if (fs.existsSync(proposalsFile)) {
    proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  } else {
    proposals = {};
    proposals[chainId] = [];
  }
  proposals[chainId].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
}

propose([NEW_STORE_VALUE], STORE_FUNCTION, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
