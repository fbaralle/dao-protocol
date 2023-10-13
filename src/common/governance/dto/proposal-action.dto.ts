import { IsString, IsEnum } from "class-validator";

enum ProposalAction {
  Queue,
  Execute,
}

// Dto for proposal creation
export class ProposalActionDto {
  @IsString()
  proposalId: string;

  @IsEnum(ProposalAction)
  voteWay: number;
}
