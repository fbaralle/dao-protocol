import { ProposalState } from "@/shared/typescript/protocol";
import { ethers } from "hardhat";

export async function getProposalDetails(proposalId: string) {
  if (!proposalId) throw new Error(`Invalid proposalId: ${proposalId}`);

  const governor = await ethers.getContract("GovernorContract");

  const state = await governor.state(proposalId);
  /** Proposal State is an enum data type, defined in the IGovernor contract. */
  const stateName = ProposalState[state].toLowerCase();
  /** What block # the proposal was snapshot. Used to fetch proposal data. Voting starts in the next block + voting delay */
  const blockSnapshot = (await governor.proposalSnapshot(proposalId))?.toNumber?.();
  /** The block number the proposal voting expires */
  const blockDeadline = (await governor.proposalDeadline(proposalId))?.toNumber?.();
  const proposalVotesRes = await governor.proposalVotes(proposalId);
  const proposalVotes = {
    againstVotes: proposalVotesRes?.againstVotes?.toString?.() || null,
    forVotes: proposalVotesRes?.forVotes?.toString?.() || null,
    abstainVotes: proposalVotesRes?.abstainVotes?.toString?.() || null,
  };

  return {
    data: {},
    state,
    stateName,
    blockSnapshot,
    blockDeadline,
    proposalVotes,
  };
}

getProposalDetails("51508501457481436077634888669578781761098444908194579718864424217340756472817")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
