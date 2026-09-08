import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG } from './config/app/app.config';
import { setupApp } from './bootstrap/setup-app';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { setupSwagger } from './bootstrap/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const config = app.get(ConfigService);
  const appCfg = config.getOrThrow<{ port: number }>(APP_CONFIG);

  setupApp(app, logger, config);
  setupSwagger(app);

  const port = appCfg.port;
  await app.listen(port);
  logger.log(`Application is running on port:${port}`);
  logger.log(`Swagger is running on port:${port}/docs`);
}
void bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
