import { Injectable } from '@nestjs/common';
import { DiariesRepository} from './diaries.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Diaries } from "./diaries.entity";
import { CreateDiaryDto } from "./dto/create-diary.dto";
import { UpdateDiaryDto } from "./dto/update-diary.dto";
import moment, {Moment} from 'moment';


@Injectable()
export class DiariesService {
    constructor(
        @InjectRepository(DiariesRepository)
            private diariesRepository: DiariesRepository,
    ) {}


    // 입력 날짜의 month, week 계산
    static async calculateDate(createDiaryDto: CreateDiaryDto): Promise<any>{
        var writtenDate = createDiaryDto.date;
        var calDate = new Date(writtenDate)    // string->Date
        
        // 인풋의 년, 월
        let year = calDate.getFullYear();
        let month = calDate.getMonth() + 1;
        const date = calDate.getDate();
    
        // 인풋한 달의 첫 날과 마지막 날의 요일
        const firstDate = new Date(year, month, 1);
        const lastDate = new Date(year, month+1, 0);
        const firstDayOfWeek = firstDate.getDay() === 0 ? 7 : firstDate.getDay();
        const lastDayOfweek = lastDate.getDay();
    
        // 인풋한 달의 마지막 일
        const lastDay = lastDate.getDate();
    
        // 첫 날의 요일이 금, 토, 일요일 이라면 true
        const firstWeekCheck = firstDayOfWeek === 5 || firstDayOfWeek === 6 || firstDayOfWeek === 7;
        // 마지막 날의 요일이 월, 화, 수라면 true
        const lastWeekCheck = lastDayOfweek === 1 || lastDayOfweek === 2 || lastDayOfweek === 3;
    
        // 해당 달이 총 몇주까지 있는지 ->2022.02 : 5
        const lastWeekNo = Math.ceil((firstDayOfWeek - 1 + lastDay) / 7);

        // 날짜 기준으로 몇주차 인지
        let week = Math.ceil((firstDayOfWeek - 1 + date) / 7);
        
        return {year, month, week};
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
        // 해당 날짜에 게시물이 존재하면
        if(diary.diaryStatus == true) {
            return diary;
        }
    }


    async createDiary(loginUserId: number, createDiaryDto: CreateDiaryDto): Promise<Diaries> {
        const {year, month, week} = await DiariesService.calculateDate(createDiaryDto);
        console.log('createDiary', year, month);
        return await this.diariesRepository.createDiary(loginUserId, createDiaryDto, year, month, week); // board DB에 저장        
    }

/*
    async updateBoard(diaryId: number, updateDiaryDto: UpdateDiaryDto) {
        await this.diariesRepository.updateDiary(diaryId, updateDiaryDto);
        const diary = await this.findByDiaryId(diaryId);
        return diary;
    }
*/

    async deleteDiary(diaryId: number) {
        await this.diariesRepository.deleteDiary(diaryId);
    }

}
