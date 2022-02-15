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
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf } = winston.format;

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    BoardsModule,
    BoardImagesModule,
    AuthModule,
    CommentsModule,
    UsersModule,
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
        // new winston.transports.DailyRotateFile({
        //   level: 'error',
        //   datePattern: 'YYYY-MM-DD',
        //   dirname: path.join(__dirname, 'logs', '/error'),
        //   filename: '%DATE%.error.log',
        //   maxFiles: 30,
        //   zippedArchive: true
        // }),      
        // new WinstonDailyRotate({
        //   filename: "./logs/app",
        //   datePattern: "YYYY-MM/DD[.log]",
        // })
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
    })
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
