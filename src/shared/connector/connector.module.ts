import { Global, Module } from "@nestjs/common";
import { ConnectorService } from "./connector.provider";
import { ConnectorController } from "./connector.controller";

@Global()
@Module({
  imports: [],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
