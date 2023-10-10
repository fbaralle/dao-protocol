import { Controller, Get } from "@nestjs/common";
import { ConnectorService } from "./connector.provider";

@Controller("connector")
export class ConnectorController {
  constructor(private connectorService: ConnectorService) {}

  @Get("/network-data")
  getNetworkData() {
    return this.connectorService.getCurrentNetwork();
  }
}
