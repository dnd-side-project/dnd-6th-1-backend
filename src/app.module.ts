import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardImagesModule } from './board-images/board-images.module';
import { BoardsModule } from './boards/boards.module';
import { typeORMConfig } from './configs/typeorm.config';
<<<<<<< HEAD
import { UserModule} from './users/users.module'
=======
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
>>>>>>> a27003bd552940b7dbe86bb6f77f92a6850924a1

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    BoardsModule,
    BoardImagesModule,
<<<<<<< HEAD
    UserModule
=======
    CommentsModule,
    AuthModule
>>>>>>> a27003bd552940b7dbe86bb6f77f92a6850924a1
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
