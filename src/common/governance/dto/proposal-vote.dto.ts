import { VoteWay } from "@/shared/typescript/protocol";
import { IsString, IsEnum } from "class-validator";

// Dto for proposal creation
export class ProposalVoteDto {
  @IsString()
  proposalId: string;

  @IsEnum(VoteWay)
  voteWay: number;
}
