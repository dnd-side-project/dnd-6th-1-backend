import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { BoardsRepository } from 'src/boards/boards.repository';
import { BoardsService } from 'src/boards/boards.service';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  imports:[TypeOrmModule.forFeature([CommentsRepository, BoardsRepository, BoardImagesRepository])],
  controllers: [CommentsController],
  providers: [CommentsService, BoardsService]
})
export class CommentsModule {}
