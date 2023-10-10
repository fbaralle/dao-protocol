import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.enableCors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV === "development") {
        // Allow local dev and whitelisted controllers/paths
        callback(null, true);
      } else {
        // Check against your regex
        const allowedOrigins = [
          /\/\/localhost:\d+\/?/, // //localhost:3000, //localhost:8080, etc
        ];
        const isAllowed = allowedOrigins.some((allowedOrigin) => {
          if (typeof allowedOrigin === "string") {
            return origin === allowedOrigin;
          }
          if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
          }
          return undefined;
        });
        callback(null, isAllowed);
      }
    },
    credentials: true,
    allowedHeaders: [
      "Accept-Encoding",
      "Accept-Language",
      "Accept",
      "Authorization",
      "Content-Type",
      "Cookie",
      "Vary",
      "X-Requested-With",
      "access-token",
      "X-Token",
      "Secret-Password",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Origin",
    ],
    maxAge: 86400,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  });
  await app.listen(process.env.PORT || 8000, "0.0.0.0", (err, address) => {
    /* eslint-disable no-console */
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Server listening at ${address}`);
    /* eslint-enable no-console */
  });
}

bootstrap();
