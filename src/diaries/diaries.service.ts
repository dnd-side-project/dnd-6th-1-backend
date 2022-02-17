import { Injectable } from '@nestjs/common';
import { DiariesRepository} from './diaries.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Diaries } from "./diaries.entity";
import { CreateDiaryDto } from "./dto/create-diary.dto";



@Injectable()
export class DiariesService {
    constructor(
        @InjectRepository(DiariesRepository)
            private diariesRepository: DiariesRepository,
    ) {}

    async getAllDiaries(): Promise <Diaries[]> {
        return this.diariesRepository.find();
    }

    async findByDiaryId(diaryId: number): Promise<Diaries> {
        return await this.diariesRepository.findByDiaryId(diaryId);
    }

    async createDiary(loginUserId: number, createDiaryDto: CreateDiaryDto): Promise<Diaries> {
        return await this.diariesRepository.createDiary(loginUserId, createDiaryDto); // board DB에 저장        
    }

}
