import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { RequestMethod } from "@nestjs/common";
import { join } from "path";
import express = require("express");
const Sentry = require('@sentry/node');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    process.env.IMAGEPATH,
    express.static(join(__dirname, "..", "uploads"))
  );
  Sentry.init({
		dsn: process.env.SENTRY_DSN_URL,
		environment: process.env.SENTRY_ENVIRONMENT,

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 0.1,
	});
  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

  const config = new DocumentBuilder()
    .setTitle("ALT Platform")
    .setDescription("CRUD API")
    .setVersion("1.0")
    .addTag("V1")
    .addApiKey(
      { type: "apiKey", name: "Authorization", in: "header" },
      "access-token"
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/swagger-docs", app, document);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
