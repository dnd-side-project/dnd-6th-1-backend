import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });

  //Global Middleware 설정 -> Cors 속성 활성화
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 200,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true, // DTO에 없는 속성은 무조건 거른다
      forbidNonWhitelisted:true, // 전달하는 요청 값 중에 정의 되지 않은 값이 있으면 Error를 발생
      transform: true, 
      /*
        localhost:#000/movie/1 이렇게 하면 1이 string으로 들어오고
        string 값을 number 로 바꿔주는 작업이 필요한데 transform = true로 하면
        자동으로 바꿔줌
      */
      disableErrorMessages: true,
    }),
  )

  const options = new DocumentBuilder()
    .setTitle('ITZZA API Docs')
    .setDescription('DND 1조 완성하조의 API 문서입니다.')
    .setVersion('1.0.0')
    // .addBearerAuth({ 
    //     type: 'http', scheme: 'bearer', bearerFormat: 'JWT'
    //   },
    //   'access-token',
    // )
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        in: 'header',
      },
      'accessToken',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  
  const serverConfig = config.get('server')
  const port = serverConfig.port;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
