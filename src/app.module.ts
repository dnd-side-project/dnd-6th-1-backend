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
import * as path from 'path';
import { FcmModule } from 'nestjs-fcm';


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
            nestWinstonModuleUtilities.format.nestLike('ITZA', { prettyPrint: true }),
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
    // FcmModule.forRoot({
    //   firebaseSpecsPath: path.join(__dirname, '../firebase.spec.json'),
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
