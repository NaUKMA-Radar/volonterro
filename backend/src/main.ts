import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ConflictException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

// To allow parsing BigInt to JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Course Work')
    .setDescription('The Course Work API description')
    .setVersion('0.1')
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: errors => {
        if (errors.find(error => Object.entries(error.constraints ?? {}).length > 0)) {
          return new ConflictException(
            errors.flatMap(error => Object.values(error.constraints ?? {})),
          );
        }

        return new BadRequestException(
          errors.flatMap(error => Object.values(error.constraints ?? {})),
        );
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.enableCors();
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.BACKEND_PORT ?? 8000);
}
bootstrap();
