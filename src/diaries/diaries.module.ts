import { Module } from '@nestjs/common';
import { DiariesController } from './diaries.controller';
import { DiariesService } from './diaries.service';

@Module({
  controllers: [DiariesController],
  providers: [DiariesService]
})
export class DiariesModule {}
