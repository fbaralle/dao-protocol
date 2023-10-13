import { ProposalState } from "@/shared/typescript/protocol";
import { Inject, Injectable } from "@nestjs/common";
import { Bunyan, InjectLogger } from "nestjs-bunyan";
import { ConnectorService, governorContractData } from "@/shared/connector/connector.provider";
import { ethers } from "ethers";
import { ProposalDto } from "./dto/proposal.dto";
import { getParsedProposal } from "./utils";
import { ProposalVoteDto } from "./dto/proposal-vote.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { getContractEvents, getStartBlockByFilter } from "./utils/contract-events";
import { Cache } from "cache-manager";
import { VOTING_DELAY, VOTING_PERIOD } from "@/config/helper-hardhat-config";
import { ProposalActionDto } from "./dto/proposal-action.dto";

const BOX_STORE_METHOD = "store";

export enum CacheKeyPrefix {
  GET_PROPOSALS = "get-proposals",
  GET_PROPOSAL_DETAILS = "get-proposal-details",
}

export enum ProposalsListRange {
  DAY,
  WEEK,
  ALL,
}

@Injectable()
export class GovernanceService {
  constructor(
    @InjectLogger() private logger: Bunyan,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private connectorService: ConnectorService,
  ) {}

  async getCurrentValue() {
    const box = this.connectorService.boxContract;
    const value = (await box.retrieve()) as bigint;

    return {
      value: value.toString(),
    };
  }

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

  async getProposals(rangeFilter?: ProposalsListRange) {
    const cacheKey = `${CacheKeyPrefix.GET_PROPOSALS}-${rangeFilter}`;
    const cachedResult = await this.cacheManager.get<string>(cacheKey);

    if (cachedResult && process.env.NODE_ENV !== "development") {
      this.logger.info(
        "Retrieving cached result for key:",
        cacheKey,
        `range filter: ${rangeFilter}`,
      );
      const res = cachedResult;
      return res;
    }

    const governorDeployBlock = governorContractData.receipt.blockNumber;
    const lastBlockNumber = await this.connectorService.provider.getBlockNumber();
    const startBlock = getStartBlockByFilter(lastBlockNumber, governorDeployBlock, rangeFilter);

    this.logger.info(`Getting proposals from block ${startBlock} to latest block`, {
      rangeFilter,
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

    const allProposals = proposalsCreated;

    const parsedProposals =
      allProposals && allProposals.length ? allProposals.map(getParsedProposal) : [];

    const sortedList = parsedProposals.sort((a, b) => {
      return a.blockNumber > b.blockNumber ? -1 : 1;
    });

    if (process.env.NODE_ENV !== "development") {
      /** TTL in milliseconds */
      const ttl = ProposalsListRange.DAY ? 60 * 1000 : 2 * 60 * 1000;

      this.logger.info(
        "Adding new result to cache",
        cacheKey,
        new Date().toLocaleDateString(),
        `with ttl ${ttl} sec.`,
      );
      await this.cacheManager.set(cacheKey, sortedList, ttl);
    }

    this.logger.info(`Proposals List: [Range: ${rangeFilter}], with ${sortedList.length} items`);

    return sortedList;
  }

  async getProposalDetails(proposalId: string) {
    this.logger.info("Getting proposal by ID:", proposalId, typeof proposalId);
    if (!proposalId) throw new Error(`Invalid proposalId: ${proposalId}`);

    const governor = this.connectorService.governorContract;

    /** The block number the proposal voting expires */
    const blockDeadline = (await governor.proposalDeadline(proposalId))?.toNumber?.();

    const proposalCreationBlock = blockDeadline - (VOTING_PERIOD + VOTING_DELAY);
    console.log({ proposalCreationBlock });

    this.logger.info(
      `Searching proposal event between blocks ${proposalCreationBlock} - ${
        proposalCreationBlock + 1
      }`,
    );

    const proposalsCreated = await getContractEvents(
      governor,
      "ProposalCreated",
      proposalCreationBlock,
      proposalCreationBlock + 1,
    );

    this.logger.info(`Proposals found in block: ${proposalsCreated.length}`);

    const foundProposal = proposalsCreated.find(
      (p) => p?.args?.proposalId.toString?.() === proposalId,
    );

    if (!foundProposal) throw new Error(`Proposal not found with ID: ${proposalId}`);

    const parsedProposal = getParsedProposal(foundProposal);

    /** What block # the proposal was snapshot. Used to fetch proposal data. Voting starts in the next block + voting delay */
    const blockSnapshot = (await governor.proposalSnapshot(proposalId))?.toNumber?.();
    const proposalState = await this.getProposalState(proposalId);
    const proposalVotesRes = await governor.proposalVotes(proposalId);
    const proposalVotes = {
      againstVotes: proposalVotesRes?.againstVotes?.toString?.() || null,
      forVotes: proposalVotesRes?.forVotes?.toString?.() || null,
      abstainVotes: proposalVotesRes?.abstainVotes?.toString?.() || null,
    };

    const executionEta = (await governor.proposalEta(proposalId)).toString();

    const proposalResult = {
      ...parsedProposal,
      ...proposalState,
      blockSnapshot,
      blockDeadline,
      proposalVotes,
    };
    this.logger.info(`Retrieving proposal ${proposalId}`, proposalResult);

    return {
      ...parsedProposal,
      ...proposalState,
      blockSnapshot,
      blockDeadline,
      proposalVotes,
      executionEta,
    };
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

    const estimatedGas = await governor.estimateGas.propose(
      [box.address], // proposal contract
      [0], // eth to transfer
      [encodedFunctionCall], // call data
      proposalContentString,
    );

    const serlializedTx = ethers.utils.serializeTransaction(unsignedProposalTx);

    this.logger.info("Proposal Tx Serialized", serlializedTx);

    return {
      unsigned_tx: serlializedTx,
      is_serialized: true,
      estimated_gas: estimatedGas.toString(),
    };
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

  async buildQueueTx(proposalAction: ProposalActionDto) {
    const { proposalId } = proposalAction;
    this.logger.info("Building queue proposal by ID:", proposalId);
    const proposal = await this.getProposalDetails(proposalId);
    this.logger.info("Proposal to queue:", proposal);

    const box = this.connectorService.boxContract;
    const governor = this.connectorService.governorContract;

    const encodedFunctionCall = proposal.content.calldatas[0];
    const descriptionHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(proposal.content.description),
    );

    const unsignedQueueTx = await governor.populateTransaction.queue(
      [box.address],
      [0],
      [encodedFunctionCall],
      descriptionHash,
    );

    const estimatedGas = await governor.estimateGas.queue(
      [box.address],
      [0],
      [encodedFunctionCall],
      descriptionHash,
    );

    const serlializedTx = ethers.utils.serializeTransaction(unsignedQueueTx);
    this.logger.info("Proposal Tx Serialized", serlializedTx);

    return {
      unsigned_tx: serlializedTx,
      is_serialized: true,
      estimated_gas: estimatedGas.toString(),
    };
  }

  async buildExecuteTx(proposalAction: ProposalActionDto) {
    const { proposalId } = proposalAction;
    this.logger.info("Building execute proposal by ID:", proposalId);
    const proposal = await this.getProposalDetails(proposalId);
    this.logger.info("Proposal to execute:", proposal);

    const box = this.connectorService.boxContract;
    const governor = this.connectorService.governorContract;

    const encodedFunctionCall = proposal.content.calldatas[0];
    const descriptionHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(proposal.content.description),
    );

    const unsignedQueueTx = await governor.populateTransaction.execute(
      [box.address],
      [0],
      [encodedFunctionCall],
      descriptionHash,
    );

    const estimatedGas = await governor.estimateGas.execute(
      [box.address],
      [0],
      [encodedFunctionCall],
      descriptionHash,
    );

    const serlializedTx = ethers.utils.serializeTransaction(unsignedQueueTx);
    this.logger.info("Proposal Tx Serialized", serlializedTx);

    return {
      unsigned_tx: serlializedTx,
      is_serialized: true,
      estimated_gas: estimatedGas.toString(),
    };
  }
}
