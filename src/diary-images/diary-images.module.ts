import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryImagesRepository } from './diary-images.repository';

@Module({
    imports:[TypeOrmModule.forFeature([DiaryImagesRepository])],
    controllers: [],
    providers: []
  })
export class DiaryImagesModule {}
