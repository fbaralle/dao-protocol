import { Module } from "@nestjs/common";

import { LoggerController } from "./logger.controller.js";
import { LoggerService } from "./logger.service.js";

@Module({
  imports: [],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class LoggerModule {}
