import { Global, Module } from "@nestjs/common";
import { ConnectorService } from "./connector.provider";
import { ConnectorController } from "./connector.controller";

@Global()
@Module({
  // imports: [CustomConfigService],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
