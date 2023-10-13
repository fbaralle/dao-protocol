import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { GovernanceService, ProposalsListRange } from "./governance.service.js";
import { ProposalDto } from "./dto/proposal.dto.js";
import { ProposalVoteDto } from "./dto/proposal-vote.dto.js";
import { CacheTTL } from "@nestjs/cache-manager";
import { ProposalActionDto } from "./dto/proposal-action.dto.js";

@Controller("governance")
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get("/value")
  getCurrentValue() {
    return this.governanceService.getCurrentValue();
  }

  @Get("/proposals")
  getAllProposals(@Query("blocks") rangeFilter: ProposalsListRange = ProposalsListRange.ALL) {
    return this.governanceService.getProposals(rangeFilter);
  }

  @CacheTTL(15 * 1000) // 15 sec.
  @Get("/proposal/:proposalId")
  getProposalDetails(@Param("proposalId") proposalId: string) {
    return this.governanceService.getProposalDetails(proposalId);
  }

  @Post("/build-tx/proposal")
  buildProposalTx(@Body() proposalDto: ProposalDto) {
    return this.governanceService.buildProposalTx(proposalDto);
  }

  @Post("/build-tx/queue")
  buildQueueTx(@Body() proposalAction: ProposalActionDto) {
    return this.governanceService.buildQueueTx(proposalAction);
  }

  @Post("/build-tx/execute")
  buildExecuteTx(@Body() proposalAction: ProposalActionDto) {
    return this.governanceService.buildExecuteTx(proposalAction);
  }

  @Post("/build-tx/vote")
  buildVoteProposalTx(@Body() proposalVoteDto: ProposalVoteDto) {
    return this.governanceService.buildVoteProposalTx(proposalVoteDto);
  }
}
