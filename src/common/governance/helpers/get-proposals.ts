import { ethers } from "hardhat";
import { getContractEvents } from "../utils/contract-events";

export async function getAllProposals() {
  const governor = await ethers.getContract("GovernorContract");
  console.log("Getting created proposals..");

  const proposalsCreated = await getContractEvents(governor, "ProposalCreated");
  const proposalsCanceled = await getContractEvents(governor, "ProposalCanceled");
  const proposalsExecuted = await getContractEvents(governor, "ProposalExecuted");

  console.log(
    "Fetched proposals",
    proposalsCreated,
    proposalsCreated.map((p) => p && { ...p, content: p.args }),
  );

  return [...proposalsCreated, ...proposalsExecuted, ...proposalsCanceled];
}

getAllProposals()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
