import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { BoardsRepository } from 'src/boards/repository/boards.repository';
import { CommentsRepository } from 'src/comments/comments.repository';
import { HistoriesRepository } from 'src/histories/histories.repository';
import { AuthService } from 'src/auth/auth.service';
import { AuthRepository } from 'src/auth/auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UploadService } from 'src/boards/upload.service';
import { DiariesRepository } from 'src/diaries/repository/diaries.repository';
import { ReportsRepository } from 'src/reports/reports.repository';
import { ReportsService } from 'src/reports/reports.service';
import { HistoriesService } from 'src/histories/histories.service';
import { DiariesService } from 'src/diaries/diaries.service';
require("dotenv").config();

@Module({
  imports:[
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // screte 토큰을 만들때 이용하는 Secret 텍스트
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: "20d"
      }
    }),
    TypeOrmModule.forFeature([
      UsersRepository,
      BoardsRepository,
      BoardImagesRepository,
      CommentsRepository,
      HistoriesRepository,
      AuthRepository,
      DiariesRepository,
      ReportsRepository,
      HistoriesRepository
    ])
  ], // 데이터베이스 커넥션 맺으며 사용할 엔티티를 리스트로 받기
  controllers: [UsersController],
  providers: [UsersService, UploadService, AuthService, JwtStrategy, ReportsService, HistoriesService, DiariesService],
  exports: [JwtStrategy, PassportModule]
})
export class UsersModule {}
