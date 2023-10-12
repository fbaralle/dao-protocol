import { Contract } from "ethers";
import { ProposalsListRange } from "../governance.service";

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

const BLOCKS_PER_DAY = 5760; // each block is mined every 15 sec. aprox.
const BLOCKS_PER_WEEK = 5760 * 7;

export const getStartBlockByFilter = (
  chainLatestBlock: number,
  contractDeployBlock: number,
  rangeFilter?: ProposalsListRange,
) => {
  switch (rangeFilter) {
    case ProposalsListRange.DAY:
      return chainLatestBlock - BLOCKS_PER_DAY;
    case ProposalsListRange.WEEK:
      return chainLatestBlock - BLOCKS_PER_WEEK;
    default:
      return contractDeployBlock;
  }
};
