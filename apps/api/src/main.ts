import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser middleware for HTTP-only cookies
  app.use(cookieParser());

  // Global validation pipe for strict DTO handling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Swagger OpenAPI 3.0 Documentation
  const config = new DocumentBuilder()
    .setTitle('Landmaka Delivery Location & Routing Infrastructure API')
    .setDescription(
      'Phase 1 MVP B2B API for Nigerian logistics: structured landmark location capture and single-rider route optimization.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Partner merchant API key (e.g., lm_test_key_pilot_01)',
      },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Landmaka API running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

await bootstrap();
