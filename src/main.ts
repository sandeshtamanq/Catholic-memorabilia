import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

function setupSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Hamro Sewa API')
    .setDescription('This is the API documentation for hamro-sewa.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });
}

function setupCors(app: INestApplication): void {
  const cors = {
    origin: 'localhost:4200',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
  };
  app.enableCors(cors);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // app.useGlobalInterceptors(new LoggingInterceptor());
  // app.useGlobalFilters(new HttpExceptionFilter());
  setupCors(app);
  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
