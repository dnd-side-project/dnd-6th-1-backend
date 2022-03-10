import { Injectable } from '@nestjs/common';
import { DiariesRepository} from './repository/diaries.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Diaries } from "./entity/diaries.entity";
import { CreateDiaryDto } from "./dto/create-diary.dto";
import { UpdateDiaryDto } from "./dto/update-diary.dto";

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
        const firstWeekCheck = firstDayOfWeek === 7 || firstDayOfWeek === 1 || firstDayOfWeek === 2;
        // 마지막 날의 요일이 월, 화, 수라면 true
        const lastWeekCheck = lastDayOfweek === 3 || lastDayOfweek === 4 || lastDayOfweek === 5;
    
        // 해당 달이 총 몇주까지 있는지 ->2022.02 : 5
        const lastWeekNo = Math.ceil((firstDayOfWeek - 1 + lastDay) / 7);

        // 날짜 기준으로 몇주차 인지
        let week = Math.ceil((firstDayOfWeek - 1 + date) / 7);
        
        return {year, month, week};
    }

    async getWeek2(date: Date) {
        const dowOffset = 1; // dowOffset이 숫자면 넣고 아니면 0
        var newYear = new Date(date.getFullYear(),0,1);
// 1/1 (토) -> 6 

// 목요일까지 1주차 / 금요일부터 시작일 때 5 
        var day = newYear.getDay() - dowOffset; // 6-6 = 0
        day = (day >= 0 ? day : day + 7); //  -1+7 = 6 (토요일)
        console.log(day);
        var daynum = Math.floor((date.getTime() - newYear.getTime() -
          (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1; // ex)2021.01.15 -> daynum=15
        console.log('dayNum '+daynum); // 1
        var weeknum; 
        //if the year starts before the middle of a week
        if(day < 4) { // day=-1 -> 
          weeknum = Math.floor((daynum+day-1)/7) + 1;  //
          console.log(Math.floor(daynum+day-1));
          console.log(Math.floor((daynum+day-1)/7)); 
          if(weeknum > 52) { 
            let nYear = new Date(date.getFullYear() + 1,0,1);
            let nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
              the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
          }
        } // 월~일 (한주의 시작)
        else {
          weeknum = Math.floor((daynum+day-1)/7)+1;
        }
        return weeknum;
    }

    async getAllDiaries(loginUserId: number) {
        const diaries = await this.diariesRepository.getAllDiaries(loginUserId); // 내가 쓴 모든 일기글
        return diaries
    }

    
    // 해당 월 일기글 조회
    async getMonthDiaries(loginUserId: number, year: number, month: number) {
        const diaries = await this.getAllDiaries(loginUserId);
        const monthDiaries = diaries.filter(diary => 
            diary.month == month && diary.year ==year);
        
        const diary = Object.values(monthDiaries);
        
        for (var i=0; i<diary.length; i++) {
            const image = new Array(); // image 배열을 만든다
            for(var j=0; j<diary[i].images.length; j++) {
                image.push(diary[i].images[j]['imageUrl']);
            }
            monthDiaries[i]['images'] = image;
        }

        return monthDiaries;
    }

    async findByDiaryId(diaryId: number): Promise<Diaries> {
        const diary = await this.diariesRepository.findByDiaryId(diaryId);
        /*
        const image = new Array(); // image 배열을 만든다
        for(var i=0; i< diary.images.length; i++) {
                image.push(diary.images[i]['imageUrl']);
            }
        diary['images'] = image;        // diary에 이미지 속성 추가
        */
        return diary;
    }

    // 일기 특정 글 조회
    async getDiaryById(loginUserId: number, diaryId: number) {
        // 다이어리 객체
        const diaryById = await this.findByDiaryId(diaryId);
        const { userId, categoryId, categoryReason, diaryTitle, diaryContent, images, date } = diaryById;
        const canEdit = (userId == loginUserId)? true : false // 글 작성자 / 로그인한 사용자가 동일한 경우
        /*
        images: [
            {
                다이어리 id,
                이미지명,
                이미지 url
            }  
        ]
        */
       
        const image = new Array(); // image 배열을 만든다
        for(var i=0;i<images.length;i++){
            if(images[i].imageStatus == true){ // 이미지가 삭제되지 않은 경우에만
                image.push(images[i]['imageUrl']); // image 배열에 url을 하나씩 푸시
            }
        }
        console.log(image); // image배열에 url만 담김
        
        const diary = {
            date,
            categoryId,
            categoryReason,
            diaryTitle,
            diaryContent,
            images:image // images에 위에서 만든 배열을 대입
        }
        console.log(diary);    
        return diary;
    }


    async findByDiaryDate(date: string) {
        const diary = await this.diariesRepository.findByDiaryDate(date);
        return diary;
    }


    async createDiary(loginUserId: number, createDiaryDto: CreateDiaryDto): Promise<Diaries> {
        // const {year, month, week} = await DiariesService.calculateDate(createDiaryDto);
        const { date } = createDiaryDto;
        const year = +date.split('-')[0];
        const month = +date.split('-')[1].charAt(1); // 10월이상은 따로 처리
        const day = +date.split('-')[2];
        const mydate = new Date(year, month-1, day);
        const week = await this.getWeek2(mydate);
        console.log('주 '+week);
        console.log(typeof(week));
        // console.log('createDiary', year, month);
        
        const diary = await this.diariesRepository.createDiary(loginUserId, createDiaryDto, year, month, week); // board DB에 저장        
        
        return diary;
    }

    async updateDiary(diaryId: number, updateDiaryDto: UpdateDiaryDto) {
        await this.diariesRepository.updateDiary(diaryId, updateDiaryDto);
        const diaryById = await this.findByDiaryId(diaryId);
        const { userId, categoryId, categoryReason, diaryTitle, diaryContent, images, date } = diaryById;
        const image = new Array(); // image 배열을 만든다

        for(var i=0;i<images.length;i++){
            if(images[i].imageStatus == true){ // 이미지가 삭제되지 않은 경우에만
                image.push(images[i]['imageUrl']); // image 배열에 url을 하나씩 푸시
            }
        }
        console.log(image); // image배열에 url만 담김
        const diary = {
            date,
            categoryId,
            categoryReason,
            diaryTitle,
            diaryContent,
            images:image // images에 위에서 만든 배열을 대입
        }
        console.log(diary);    

        return diary;
    }


    async deleteDiary(diaryId: number) {
        await this.diariesRepository.deleteDiary(diaryId);
    }

}
