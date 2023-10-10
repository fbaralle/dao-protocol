import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { GovernanceService } from "./governance.service.js";
import { ProposalDto } from "./dto/proposal.dto.js";
import { ProposalVoteDto } from "./dto/proposal-vote.dto.js";

@Controller("governance")
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get("/proposals")
  getAllProposals(@Query("blocks") blocks: number) {
    return this.governanceService.getProposals(blocks);
  }

  @Get("/proposal/:proposalId")
  getProposalDetails(@Param("proposalId") proposalId: string) {
    return this.governanceService.getProposalDetails(proposalId);
  }

  @Post("/propose")
  propose(@Body() proposalDto: ProposalDto) {
    return this.governanceService.propose(proposalDto);
  }

  @Post("/build-tx/proposal")
  buildProposalTx(@Body() proposalDto: ProposalDto) {
    return this.governanceService.buildProposalTx(proposalDto);
  }

  @Post("/build-tx/vote")
  buildVoteProposalTx(@Body() proposalVoteDto: ProposalVoteDto) {
    return this.governanceService.buildVoteProposalTx(proposalVoteDto);
  }
}
