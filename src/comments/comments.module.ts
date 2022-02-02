import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  imports:[TypeOrmModule.forFeature([CommentsRepository])],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
