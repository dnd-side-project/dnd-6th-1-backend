import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { BoardsRepository } from 'src/boards/boards.repository';
import { BoardsService } from 'src/boards/boards.service';
import { BookmarksRepository } from 'src/boards/bookmarks.repository';
import { LikesRepository } from 'src/boards/likes.repository';
import { CommentsRepository } from 'src/comments/comments.repository';


@Module({
  imports:[TypeOrmModule.forFeature([
    UsersRepository,
    BoardsRepository,
    BoardImagesRepository,
    CommentsRepository,
    LikesRepository,
    BookmarksRepository
  ])], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
  controllers: [UsersController],
  providers: [UsersService, BoardsService]
})
export class UsersModule {}
