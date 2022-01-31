import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardImagesRepository } from './board-images.repository';

@Module({
  imports:[TypeOrmModule.forFeature([BoardImagesRepository])], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
  controllers: [],
  providers: []
})
export class BoardImagesModule {}
