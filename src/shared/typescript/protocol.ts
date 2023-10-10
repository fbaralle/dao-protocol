// 0 = Against, 1 = For, 2 = Abstain for this example
export enum VoteWay {
  AGAINST,
  FOR,
  ABSTAIN,
}

export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}
