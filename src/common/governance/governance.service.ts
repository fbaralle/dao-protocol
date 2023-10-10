import { ProposalState } from "@/shared/typescript/protocol";
import { Injectable } from "@nestjs/common";
import { Bunyan, InjectLogger } from "nestjs-bunyan";
import { ConnectorService, governorContractData } from "@/shared/connector/connector.provider";
import { Contract, ethers } from "ethers";
import { ProposalDto } from "./dto/proposal.dto";
import { getParsedProposal } from "./utils";
import { ProposalVoteDto } from "./dto/proposal-vote.dto";

export const getContractEventFilter = (contract: Contract, eventName: string) => {
  const encodedTopic = contract.filters?.[`${eventName}`]().topics?.[0];

  if (!encodedTopic) throw new Error(`Invalid topic: ${encodedTopic}`);

  return [encodedTopic];
};

export const getContractEvents = (
  contract: Contract,
  eventName: string,
  fromBlockOrBlockhash: string | number = 0,
  toBlock: string | number = "latest",
) => {
  return contract.queryFilter(
    {
      address: contract.address,
      topics: getContractEventFilter(contract, eventName),
    },
    fromBlockOrBlockhash,
    toBlock,
  );
};

const BOX_STORE_METHOD = "store";

@Injectable()
export class GovernanceService {
  constructor(
    @InjectLogger() private logger: Bunyan,
    private connectorService: ConnectorService,
  ) {}

  async getProposalState(proposalId: string) {
    const governor = this.connectorService.governorContract;
    const state = await governor.state(proposalId);
    /** Proposal State is an enum data type, defined in the IGovernor contract. */
    const stateName = ProposalState[state].toLowerCase();

    return {
      state,
      stateName,
    };
  }

  async getProposals(blocks?: number) {
    const governorDeployBlock = governorContractData.receipt.blockNumber;

    const lastBlockNumber = await this.connectorService.provider.getBlockNumber();

    const startBlock = blocks ? lastBlockNumber - blocks : governorDeployBlock;

    this.logger.info(`Getting proposals from block ${startBlock} to latest block`, {
      governorDeployBlock,
      lastBlockNumber,
    });

    const governor = this.connectorService.governorContract;

    const proposalsCreated = await getContractEvents(
      governor,
      "ProposalCreated",
      startBlock,
      "latest",
    );
    const proposalsCanceled = await getContractEvents(
      governor,
      "ProposalCanceled",
      startBlock,
      "latest",
    );
    const proposalsExecuted = await getContractEvents(
      governor,
      "ProposalExecuted",
      startBlock,
      "latest",
    );

    const allProposals = [
      ...(proposalsCreated || []),
      ...(proposalsCanceled || []),
      ...(proposalsExecuted || []),
    ];

    const parsedProposals =
      allProposals && allProposals.length ? allProposals.map(getParsedProposal) : [];

    const sortedList = parsedProposals.sort((a, b) => {
      return a.blockNumber > b.blockNumber ? -1 : 1;
    });

    this.logger.info("Proposals", allProposals);

    return sortedList;
  }

  async getProposalDetails(proposalId: string) {
    this.logger.info("Getting proposal by ID:", proposalId);

    if (!proposalId) throw new Error(`Invalid proposalId: ${proposalId}`);

    const governor = this.connectorService.governorContract;
    const proposalState = await this.getProposalState(proposalId);

    /** What block # the proposal was snapshot. Used to fetch proposal data. Voting starts in the next block + voting delay */
    const blockSnapshot = (await governor.proposalSnapshot(proposalId))?.toNumber?.();

    const proposalsCreated = await getContractEvents(governor, "ProposalCreated", 0, "latest");
    this.logger.info("proposals found in block", proposalsCreated);
    const foundProposal = proposalsCreated[0];
    if (!foundProposal) throw new Error(`Proposal not found with ID: ${proposalId}`);

    const parsedProposal = getParsedProposal(foundProposal);

    /** The block number the proposal voting expires */
    const blockDeadline = (await governor.proposalDeadline(proposalId))?.toNumber?.();
    const proposalVotesRes = await governor.proposalVotes(proposalId);
    const proposalVotes = {
      againstVotes: proposalVotesRes?.againstVotes?.toString?.() || null,
      forVotes: proposalVotesRes?.forVotes?.toString?.() || null,
      abstainVotes: proposalVotesRes?.abstainVotes?.toString?.() || null,
    };
    return { ...parsedProposal, ...proposalState, blockSnapshot, blockDeadline, proposalVotes };
  }

  async buildProposalTx(proposalDto: ProposalDto) {
    const { newValue, title, description } = proposalDto;
    const proposalContentString = JSON.stringify({
      title,
      description,
    });

    this.logger.info("Creating new proposal...");

    const governor = this.connectorService.governorContract;
    const box = this.connectorService.boxContract;

    this.logger.info(`Proposing ${BOX_STORE_METHOD} on ${box.address} with [${newValue}]`, {
      title,
      description,
    });
    const encodedFunctionCall = box.interface.encodeFunctionData(BOX_STORE_METHOD, [newValue]);

    const unsignedProposalTx = await governor.populateTransaction.propose(
      [box.address], // proposal contract
      [0], // eth to transfer
      [encodedFunctionCall], // call data
      proposalContentString,
    );

    const serlializedTx = ethers.utils.serializeTransaction(unsignedProposalTx);

    this.logger.info("Proposal Tx Serialized", serlializedTx);

    return { unsigned_tx: serlializedTx, is_serialized: true };
  }

  async buildVoteProposalTx(proposalVoteDto: ProposalVoteDto) {
    this.logger.info("Voting in proposal", proposalVoteDto);
    const { proposalId, voteWay } = proposalVoteDto;
    const governor = this.connectorService.governorContract;
    const voteUnsignedTx = await governor.populateTransaction.castVoteWithReason(
      proposalId,
      voteWay,
      "",
    );
    const serlializedTx = ethers.utils.serializeTransaction(voteUnsignedTx);
    this.logger.info("Proposal Tx Serialized", serlializedTx);
    return { unsigned_tx: serlializedTx, is_serialized: true };
  }

  async propose(proposalDto: ProposalDto) {
    const { newValue, title, description } = proposalDto;
    const proposalBody = `###${title} \n${description}`;

    this.logger.info("Creating new proposal...");

    const governor = this.connectorService.governorContract;
    const box = this.connectorService.boxContract;

    this.logger.info(
      `Proposing ${BOX_STORE_METHOD} on ${box.address} with [${newValue}]. Content: ${proposalBody}`,
    );
    const encodedFunctionCall = box.interface.encodeFunctionData(BOX_STORE_METHOD, [newValue]);

    const proposeTx = await governor.propose(
      [box.address], // proposal contract
      [0], // eth to transfer
      [encodedFunctionCall], // call data
      proposalBody,
    );

    const proposeReceipt = await proposeTx.wait();
    const proposalId = proposeReceipt.events[0].args.proposalId;

    this.logger.info("Proposal Submitted at Tx:", proposeReceipt);
    this.logger.info("Proposed with proposal ID:", proposalId);

    return proposeReceipt;
  }
}
