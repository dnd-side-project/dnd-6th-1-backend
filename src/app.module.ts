import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardImagesModule } from './board-images/board-images.module';
import { BoardsModule } from './boards/boards.module';
import { typeORMConfig } from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module'
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { DiariesModule } from './diaries/diaries.module';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { DiaryImagesModule } from './diary-images/diary-images.module';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf } = winston.format;
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailModule } from './mail/mail.module';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    BoardsModule,
    BoardImagesModule,
    AuthModule,
    CommentsModule,
    UsersModule,
    DiariesModule,
    DiaryImagesModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm',
            }),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('ITZZA', { prettyPrint: true }),
          ),
        }),
        new DailyRotateFile({
          level: 'error',
          format: combine(
            timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            printf(
              (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
            ),
          ),
          filename: 'logs/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    })
    // MailerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => {
    //     console.log('===== write [.env] by config: network====');
    //     console.log(config.get('email'));
    //     return {
    //       ...config.get('email'),
    //       template: {
    //         dir: path.join(__dirname, '/templates/'),
    //         adapter: new EjsAdapter(),
    //         options: {
    //           strict: true,
    //         },
    //       },
    //     };
    //   },
    // }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
})
export class AppModule {}
