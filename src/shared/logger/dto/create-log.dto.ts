import { IsArray, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreateLogDto {
  @IsString()
  severity: string;

  @IsOptional()
  @IsString()
  walletAddress: string;

  @IsOptional()
  @IsString()
  usedWallet: string;

  @IsOptional()
  @IsString()
  txHash: string;

  @IsOptional()
  @IsString()
  stage: string;

  @IsOptional()
  @IsString()
  assetId: string;

  @IsOptional()
  @IsNumber()
  proposalId: number;

  @IsOptional()
  @IsObject()
  error: any;

  @IsOptional()
  @IsArray()
  otherLogs: any[];
}
