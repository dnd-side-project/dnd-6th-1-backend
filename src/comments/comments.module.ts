import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { BoardsRepository } from 'src/boards/boards.repository';
import { BoardsService } from 'src/boards/boards.service';
import { BookmarksRepository } from 'src/boards/bookmarks.repository';
import { LikesRepository } from 'src/boards/likes.repository';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';



@Module({
  imports:[
    TypeOrmModule.forFeature([
    CommentsRepository, 
    BoardsRepository, 
    BoardImagesRepository, 
    UsersRepository,
    LikesRepository,
    BookmarksRepository
  ])],
  controllers: [CommentsController],
  providers: [CommentsService, BoardsService, UsersService]
})
export class CommentsModule {}
