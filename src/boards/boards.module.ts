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

@Module({
  imports:[TypeOrmModule.forFeature([
    BoardsRepository, 
    BoardImagesRepository, 
    CommentsRepository, 
    UsersRepository,
    LikesRepository,
    BookmarksRepository
  ])], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
  controllers: [BoardsController],
  providers: [BoardsService, UsersService]
})
export class BoardsModule {}
