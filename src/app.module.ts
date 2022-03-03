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
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsService } from './reports/reports.service';
import { ReportsRepository } from './reports/reports.repository';
import { HistoriesService } from './histories/histories.service';
import { HistoriesRepository } from './histories/histories.repository';

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
    ScheduleModule.forRoot(),
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
      transport: {
        host: 'localhost',
        port: 1025,
        ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.MAILDEV_INCOMING_USER,
          pass: process.env.MAILDEV_INCOMING_PASS,
        }
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: true,
      template: {
        dir: __dirname + '/templates',
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    HistoriesService,
    HistoriesRepository
  ],
})
export class AppModule {}
