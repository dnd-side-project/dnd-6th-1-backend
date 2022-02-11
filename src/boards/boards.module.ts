import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsRepository } from './boards.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { CommentsRepository } from 'src/comments/comments.repository';
import { LikesRepository } from './likes.repository';
import { BookmarksRepository } from './bookmarks.repository';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UploadService } from './upload.service';



@Module({
  imports:[
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // screte 토큰을 만들때 이용하는 Secret 텍스트
      secret: 'Secret1234',
      signOptions: {
        // 1시간 이후에는 이 토큰이 더 이상 유효x
        expiresIn: 60 * 60,
      }
    }),
    TypeOrmModule.forFeature([
    BoardsRepository, 
    BoardImagesRepository, 
    CommentsRepository, 
    UsersRepository,
    LikesRepository,
    BookmarksRepository
  ])], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
  controllers: [BoardsController],
  providers: [BoardsService, UsersService, UploadService]
})
export class BoardsModule {}
