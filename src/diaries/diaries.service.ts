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

    // 주차 계산 함수
    async getWeek(date: Date) { 
        const dowOffset = 1; // 월요일부터 시작인 경우 1
        var newYear = new Date(date.getFullYear(),0,1);
        var day = newYear.getDay() - dowOffset; // 6-6 = 0
        day = (day >= 0 ? day : day + 7); //  -1+7 = 6 (토요일)
        var daynum = Math.floor((date.getTime() - newYear.getTime() -
          (date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1; // ex)2021.01.15 -> daynum=15
        console.log('dayNum '+daynum); // ex)3/11 -> 2022년의 70 (번째 날짜)
        var weeknum; 
        //if the year starts before the middle of a week
        if(day < 4) { // day=-1 -> 
          weeknum = Math.floor((daynum+day-1)/7) + 1;
          if(weeknum > 52) { 
            let nYear = new Date(date.getFullYear() + 1,0,1);
            let nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            weeknum = nday < 4 ? 1 : 53;
          }
        } // 월~일 (한주의 시작)
        else {
          weeknum = Math.floor((daynum+day-1)/7)+1;
        }
        this.getStartAndEndDate(date.getFullYear(), weeknum);
        return weeknum;
    }

    // 주차별 첫날(월)과 마지막날(일) 계산
    async getStartAndEndDate(year: number, week: number) { 
        var month_days = new Array( 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 );
        var month_days_count = new Array();
        // 윤년(2월이 29일)인지 검사

        function is_leap_year(year: number){
            return ( year % 4 == 0 && year % 100 != 0 ) || ( year % 400 == 0 && year % 4000 != 0 );
        }

        // 년도에 맞게 month_days 와 month_days_count의 값을 설정한다. 
        function set_month_days(year: number){
            if(is_leap_year(year)) 
                month_days[1] = 29; 
            else 
                month_days[1] = 28;

            month_days_count[0] = 0;

            for(let i=0;i<12;i++){
                month_days_count[i+1] = month_days_count[i] + month_days[i];
            }
        }

        set_month_days(year);

        var weekday = new Date(year,0,1).getDay();
        var total_days = ((week-1) * 7) - weekday;
        console.log(weekday, total_days)
        var yy1,yy2,mm1,mm2,dd1,dd2;

        if( total_days < 0 ){
            yy1 = year-1;
            yy2 = year;
            mm1=12;
            mm2=1;
            dd1=32-weekday;
            dd2=7-weekday;
        }else{
            yy1 = yy2 = year;
            for( mm1 = 0 ; mm1 < 12 ; mm1++ ){
                if( month_days_count[mm1] > total_days ) 
                    break;
            }
                
            dd1 = total_days - month_days_count[mm1-1] + 2;        
            dd2 = dd1 + 6;
            mm2 = mm1;

            if( dd2 > month_days[ mm1-1 ] ){
                mm2 = mm1 % 12 + 1;
                dd2 = dd2 - month_days[ mm1-1];
            }
            if( mm1==12 && mm2==1 ) yy2++;  
        }
        mm1 = (mm1<10)?'0'+mm1:mm1;
        mm2 = (mm2<10)?'0'+mm2:mm2;
        dd1 = (dd1<10)?'0'+dd1:dd1;
        dd2 = (dd2<10)?'0'+dd2:dd2;

        let startDay = yy1+'.'+mm1+'.'+dd1;
        let endDay =  yy2+'.'+mm2+'.'+dd2;

        return startDay+'~'+endDay;
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
        const week = await this.getWeek(mydate);
        
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
