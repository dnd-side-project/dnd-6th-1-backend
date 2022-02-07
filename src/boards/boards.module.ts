import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsRepository } from './boards.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { CommentsRepository } from 'src/comments/comments.repository';
import { UserRepository } from 'src/auth/user.repository';
import { LikesRepository } from './likes.repository';
import { BookmarksRepository } from './bookmarks.repository';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports:[TypeOrmModule.forFeature([
    BoardsRepository, 
    BoardImagesRepository, 
    CommentsRepository, 
    UserRepository,
    LikesRepository,
    BookmarksRepository
  ])], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
  controllers: [BoardsController],
  providers: [BoardsService, AuthService]
})
export class BoardsModule {}
