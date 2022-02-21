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
        var year = calDate.getFullYear();
        var month = (calDate.getMonth())+1;     // getMonth 반환이 0~11이라 +1해야함, type: number
        
        // const weekOfMonth = (m: Moment) => m.week() - moment(m).startOf('month').week() + 1;
        // const nowDate = moment().utc(true);
        // var week = weekOfMonth(nowDate);
        console.log(year, month);
        return {year, month};
    }


    async getAllDiaries(loginUserId: number) {
        // const myDiaries = new Array();
        const diaries = await this.diariesRepository.getAllDiaries(loginUserId); // 내가 쓴 모든 일기글
        return diaries
    }

    
    // 해당 월 일기글 조회
    async getMonthDiaries(loginUserId: number, year: number, month: number) {
        const diaries = await this.getAllDiaries(loginUserId);
        const monthDiaries = diaries.filter(diary => 
            diary.month == month && diary.year ==year);
        //const monthDiaries = await this.diariesRepository.getMonthDiaries(loginUserId, year, month); // 월 일기글 다가져오기
        
        return monthDiaries;
    }



    async findByDiaryId(diaryId: number): Promise<Diaries> {
        return await this.diariesRepository.findByDiaryId(diaryId);
    }

    
    // 일기 특정 글 조회
    async getDiaryById(loginUserId: number, diaryId: number) {
        // 다이어리 객체
        const diaryById = await this.findByDiaryId(diaryId);
        const { userId, categoryId, categoryReason, diaryTitle, diaryContent, images, date } = diaryById;
        const canEdit = (userId == loginUserId)? true : false // 글 작성자 / 로그인한 사용자가 동일한 경우
        
        const diary = {
            date,
            categoryId,
            categoryReason,
            diaryTitle,
            diaryContent,
            images
        }    
        return diary;
    }


    async findByDiaryDate(date: string) {
        const diary = await this.diariesRepository.findByDiaryDate(date);
        return diary;
    }


    async createDiary(loginUserId: number, createDiaryDto: CreateDiaryDto): Promise<Diaries> {
        const {year, month} = await DiariesService.calculateDate(createDiaryDto);
        console.log('createDiary', year, month);
        return await this.diariesRepository.createDiary(loginUserId, createDiaryDto, year, month); // board DB에 저장        
    }

}
