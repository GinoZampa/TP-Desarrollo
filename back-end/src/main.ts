import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'http://localhost:4200',
    'https://tp-desarrollo-sepia.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('E-commerce Clothing API')
    .setDescription('REST API for online clothing purchase system, log in as admin to access all endpoints')
    .setVersion('1.0')
    .addTag('Authentication', 'Login and registration endpoints')
    .addTag('Clothes', 'Clothing items management')
    .addTag('Users', 'User management')
    .addTag('Shipments', 'Shipment management')
    .addTag('Purchases', 'Purchase management')
    .addTag('Payments', 'Payment processing with MercadoPago')
    .addBearerAuth() // JWT Authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

