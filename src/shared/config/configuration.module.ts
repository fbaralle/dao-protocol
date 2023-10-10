import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CustomConfigService } from "./configuration.service.js";
import config from "./config.js";

@Global()
@Module({
  providers: [CustomConfigService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
  ],
  exports: [CustomConfigService],
})
export class CustomConfigModule extends ConfigModule {}
