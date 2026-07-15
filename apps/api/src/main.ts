import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Validación global: rechaza campos no declarados en el DTO y transforma
  // el body al tipo del DTO (necesario para @Type y conversiones).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API corriendo en http://localhost:${port}`);
}
bootstrap();
