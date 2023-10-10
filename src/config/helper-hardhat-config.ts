export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  sepolia: {
    blockConfirmations: 6,
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

// Governor token
export const GOVERNOR_TOKEN_DECIMALS = 18;

// Governor Values
export const QUORUM_PERCENTAGE = 10; // Need 10% of voters to pass
export const MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact

// 1 Block = 15 seconds
// export const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
export const VOTING_PERIOD = 32; // blocks (8 minutes)
export const VOTING_DELAY = 2; // 1 Block = 15 seconds - How many blocks till a proposal vote becomes active
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const NEW_STORE_VALUE = 77;
export const STORE_FUNCTION = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1 77 in the Box!";
