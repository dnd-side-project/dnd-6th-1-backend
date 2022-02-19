import { Injectable } from '@nestjs/common';
import { DiariesRepository} from './diaries.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Diaries } from "./diaries.entity";
import { CreateDiaryDto } from "./dto/create-diary.dto";
import moment, {Moment} from 'moment';


@Injectable()
export class DiariesService {
    constructor(
        @InjectRepository(DiariesRepository)
            private diariesRepository: DiariesRepository,
    ) {}


    // 입력 날짜의 month, week 계산
    static async calculateDate(createDiaryDto: CreateDiaryDto): Promise<any>{
        var date = createDiaryDto.date;
        var calDate = new Date(date)    // string->Date
        var month = (calDate.getMonth())+1;     // getMonth 반환이 0~11이라 +1해야함, type: number
        
        // const weekOfMonth = (m: Moment) => m.week() - moment(m).startOf('month').week() + 1;
        // const nowDate = moment().utc(true);
        // var week = weekOfMonth(nowDate);
        return month;
    }


    async getAllDiaries(loginUserId: number) {
        // const myDiaries = new Array();
        const diaries = await this.diariesRepository.getAllDiaries(loginUserId); // 내가 쓴 모든 일기글
        return diaries
    }

    
    // 해당 월 일기글 조회
    async getMonthDiaries(loginUserId: number, month: number) {
        const diaries = await this.getAllDiaries(loginUserId);
        const monthDiaries = diaries.filter(diary => 
            diary.month == month);
        //const monthDiaries = await this.diariesRepository.getMonthDiaries(loginUserId, month); // 월 일기글 다가져오기
        
        return monthDiaries;
    }



    async findByDiaryId(diaryId: number): Promise<Diaries> {
        return await this.diariesRepository.findByDiaryId(diaryId);
    }


    async findByDiaryDate(date: string) {
        const diary = await this.diariesRepository.findByDiaryDate(date);
        return diary;
    }


    async createDiary(loginUserId: number, createDiaryDto: CreateDiaryDto): Promise<Diaries> {
        const month = await DiariesService.calculateDate(createDiaryDto);
        return await this.diariesRepository.createDiary(loginUserId, createDiaryDto, month); // board DB에 저장        
    }

}
