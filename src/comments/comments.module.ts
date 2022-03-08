import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { BoardsRepository } from 'src/boards/repository/boards.repository';
import { BoardsService } from 'src/boards/boards.service';
import { BookmarksRepository } from 'src/boards/repository/bookmarks.repository';
import { LikesRepository } from 'src/boards/repository/likes.repository';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';
import { HistoriesRepository } from 'src/boards/repository/histories.repository';
import { DiariesRepository } from 'src/diaries/repository/diaries.repository';
import { ReportsRepository } from 'src/reports/reports.repository';
import { HistoriesService } from 'src/histories/histories.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      CommentsRepository, 
      BoardsRepository, 
      BoardImagesRepository, 
      UsersRepository,
      LikesRepository,
      BookmarksRepository,
      HistoriesRepository,
      DiariesRepository,
      ReportsRepository,
      HistoriesRepository
  ])],
  controllers: [CommentsController],
  providers: [CommentsService, BoardsService, UsersService, HistoriesService]
})
export class CommentsModule {}
