import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const port = app.get(ConfigService).get('port');

  app.use(helmet());

  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap();
