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
import { ProfileImageModule } from './profile-image/profile-image.module';
import { DiariesModule } from './diaries/diaries.module';



@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    BoardsModule,
    BoardImagesModule,
    AuthModule,
    CommentsModule,
    UsersModule,
    ProfileImageModule,
    DiariesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }],
})
export class AppModule {}
