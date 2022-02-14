import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileImageRepository } from './profile-image.repository';



@Module({
    imports:[TypeOrmModule.forFeature([ProfileImageRepository])], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
    controllers: [],
    providers: []})
export class ProfileImageModule {
    
}


  