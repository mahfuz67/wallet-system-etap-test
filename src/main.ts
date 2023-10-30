import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from './utility/config';
import { AllExceptionsFilter } from './utility/filters/all-exceptions.filter';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';


let port: number;

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.enableCors({
      origin: '*',
      credentials: true,
   });

   const { httpAdapter } = app.get(HttpAdapterHost);

   app.setGlobalPrefix('v1', {
      exclude: [{ path: '/', method: RequestMethod.GET }],
   });

   app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
   app.useGlobalFilters(new AllExceptionsFilter());
   app.useGlobalPipes(
      new ValidationPipe({
         transform: true,
         whitelist: true,
         // forbidNonWhitelisted: true,
         disableErrorMessages:
            process.env.NODE_ENV === 'production' ? true : false,
      }),
   );

   port = Config.port;

   await app.listen(port);
}

bootstrap().then(() => {
   console.info(`
      ------------
      Internal Application Started!
      API: http://localhost:${port}/v1
      API Docs: http://localhost:${port}/docs
      ------------
`);
});
