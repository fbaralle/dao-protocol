import { Transform } from "class-transformer";
import { IsString, IsNumber } from "class-validator";

// Dto for proposal creation
export class ProposalDto {
  @Transform(({ value }) => value.slice(0, 150))
  @IsString()
  title: string;

  @Transform(({ value }) => value.slice(0, 600))
  @IsString()
  description: string;

  @IsNumber()
  newValue: number;
}
