import { Body, Controller, Post } from "@nestjs/common";
import { Bunyan, InjectLogger } from "nestjs-bunyan";

@Controller("_logger")
export class LoggerController {
  @InjectLogger() private readonly logger: Bunyan;

  // TODO TYPE?
  @Post("log")
  handleLogs(@Body() createLogDto: any) {
    try {
      this.logger[createLogDto?.severity ?? "warn"]({
        ...createLogDto,
        severity: undefined,
        transaction: createLogDto?.txHash ?? undefined,
      });
    } catch (e) {
      this.logger.error({
        createLogDto,
        err: e,
      });
    }
  }
}
