import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CustomConfigService } from "./configuration.service.js";

@Global()
@Module({
  providers: [CustomConfigService],
  imports: [ConfigModule],
  exports: [CustomConfigService],
})
export class CustomConfigModule extends ConfigModule {}
