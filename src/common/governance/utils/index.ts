export const getParsedProposal = (p: any) => {
  return p
    ? {
        ...p,
        content: {
          proposalId: p?.args?.proposalId.toString?.() ?? null,
          proposer: p?.args?.proposer ?? null,
          targets: p?.args?.targets ?? null,
          signatures: p?.args?.signatures ?? null,
          calldatas: p?.args?.calldatas ?? null,
          createdAtBlock: p?.args?.startBlock?.toString?.() ?? null,
          expiresAtBlock: p?.args?.endBlock?.toString?.() ?? null,
          description: p?.args?.description ?? null,
        },
      }
    : null;
};
