import { Module } from '@nestjs/common';
import { DiariesController } from './diaries.controller';
import { DiariesService } from './diaries.service';
import { DiariesRepository } from './repository/diaries.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DiaryImagesRepository } from 'src/diary-images/diary-images.repository';
import { UploadService } from './upload.service';
import { EmotionsService} from './emotions.service';
import { EmotionsRepository } from './repository/emotions.repository';
require("dotenv").config();


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: "20d"
      }
    }),
    TypeOrmModule.forFeature([
      DiariesRepository,
      DiaryImagesRepository,
      EmotionsRepository
    ])
  ],
  controllers: [DiariesController],
  providers: [DiariesService, UploadService, EmotionsService]
})
export class DiariesModule {}
