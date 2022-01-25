import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardImagesController } from './board-images.controller';
import { BoardImagesRepository } from './board-images.repository';
import { BoardImagesService } from './board-images.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports:[
    TypeOrmModule.forFeature([BoardImagesRepository]),
  ], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
  controllers: [BoardImagesController],
  providers: [BoardImagesService]
})
export class BoardImagesModule {}
