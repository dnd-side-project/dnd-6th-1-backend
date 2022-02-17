import { Module } from '@nestjs/common';
import { DiariesController } from './diaries.controller';
import { DiariesService } from './diaries.service';
import { DiariesRepository } from './diaries.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DiaryImagesRepository } from 'src/diary-images/diary-images.repository';
import { UploadService } from './upload.service';

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
      DiaryImagesRepository
    ])
  ],
  controllers: [DiariesController],
  providers: [DiariesService, UploadService]
})
export class DiariesModule {}
