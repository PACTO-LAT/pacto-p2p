import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { requestIdMiddleware } from '@common/middleware/request-id.middleware';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  app.set('trust proxy', config.get<number>('TRUST_PROXY_HOPS', 1));

  app.use(requestIdMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(compression());

  const origins = config.get<string>('CORS_ORIGINS', '');
  app.enableCors({
    origin: origins ? origins.split(',').map((o) => o.trim()) : true,
    methods: ['GET', 'POST'],
    credentials: false,
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter(config));
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pacto Backend')
    .setDescription('Internal backend API for Pacto P2P')
    .setVersion('0.1.0')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig)
  );

  app.enableShutdownHooks();
  await app.listen(config.get<number>('PORT', 3001));
}

process.on('unhandledRejection', (reason) => {
  console.error(
    JSON.stringify({
      level: 'error',
      type: 'unhandledRejection',
      reason: String(reason),
    })
  );
});
process.on('uncaughtException', (err) => {
  console.error(
    JSON.stringify({
      level: 'fatal',
      type: 'uncaughtException',
      message: err.message,
    })
  );
  process.exit(1);
});

void bootstrap();
