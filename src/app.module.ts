import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerModule } from "./shared/logger/logger.module";
import * as bunyanDebugStream from "bunyan-debug-stream";
import { BunyanLoggerModule } from "nestjs-bunyan";
import { CacheModule, CacheInterceptor } from "@nestjs/cache-manager";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { GovernanceModule } from "./common/governance/governance.module";
import { ConnectorModule } from "./shared/connector/connector.module";
import { CustomConfigModule } from "./shared/config/configuration.module";

const loggerStreams: any[] = [];

loggerStreams.push({
  level: "info",
  type: "raw",
  stream: bunyanDebugStream.create({
    basepath: "<app-url>",
    forceColor: true,
  }),
});

@Module({
  imports: [
    CustomConfigModule,
    LoggerModule,
    ConnectorModule,
    GovernanceModule,
    BunyanLoggerModule.forRoot({
      isGlobal: true,
      isEnableRequestLogger: true,
      bunyan: {
        name: "dao-protocol api",
        streams: loggerStreams,
        level: "info",
      },
    }),
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
