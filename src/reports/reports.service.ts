import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { create } from 'domain';
import { report } from 'process';
import { first } from 'rxjs';
import { DiariesService } from 'src/diaries/diaries.service';
import { DiariesRepository } from 'src/diaries/repository/diaries.repository';
import { UsersRepository } from 'src/users/users.repository';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        private usersRepository: UsersRepository,
        private diariesService: DiariesService,
        private diariesRepository: DiariesRepository,
        private reportsRepository: ReportsRepository
    ) {}
    private readonly logger = new Logger(ReportsService.name);

    @Cron('00 00 00 * * 1', { // 월요일 자정에 생성
      name: 'report',
      timeZone: 'Asia/Seoul',
    })
    async createReport() {
        const users = await this.usersRepository.getAllUsers(); // 모든 유저
        for(let i=0;i<users.length;i++){
            const userId = users[i].userId;
            const today = new Date();
            const year = today.getFullYear();
            // const lastWeek = await this.diariesService.getWeek(today); // 테스트용 - 이번주 데이터
            const lastWeek = await this.diariesService.getWeek(today)-1; // 이번주(월)요일 전 주의 레포트 생성해야함
            const { reports } = await this.emotionCount(year, lastWeek, userId);
            await this.reportsRepository.createReport(year, lastWeek, userId, reports);
        }
        this.schedulerRegistry.getCronJob('report');
    }
    triggerNotifications() {}

// 주차별 첫날(월)과 마지막날(일) 계산
    async getStartAndEndDate(year: number, week: number) { 
        let month_days = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        let month_days_count = new Array();

        // 윤년(2월이 29일)인지 검사
        function is_leap_year(year: number){
            return (year%4==0 && year% 100!=0) || (year%400==0 && year%4000!=0);
        }

        // 년도에 맞게 month_days 와 month_days_count의 값을 설정한다. 
        function set_month_days(year: number){
            if(is_leap_year(year)) 
                month_days[1]=29; 
            else 
                month_days[1]=28;

            month_days_count[0]=0;

            for(let i=0;i<12;i++){
                month_days_count[i+1]=month_days_count[i]+month_days[i];
            }
        }

        set_month_days(year);

        let weekday = new Date(year,0,1).getDay();
        let total_days = ((week-1)*7)-weekday;
        let yy1, yy2, mm1, mm2, dd1, dd2;

        if( total_days < 0 ){
            yy1 = year-1;
            yy2 = year;
            mm1=12;
            mm2=1;
            dd1=32-weekday;
            dd2=7-weekday;
        } else{
            yy1=yy2=year;
            for(mm1=0;mm1<12;mm1++ ){
                if(month_days_count[mm1]>total_days) 
                    break;
            }
                
            dd1=total_days-month_days_count[mm1-1]+2;        
            dd2=dd1 + 6;
            mm2=mm1;

            if(dd2>month_days[mm1-1]){
                mm2=mm1%12+1;
                dd2=dd2-month_days[mm1-1];
            }
            if(mm1==12 && mm2==1) 
                yy2++;  
        }
        mm1=(mm1<10)?'0'+mm1:mm1;
        mm2=(mm2<10)?'0'+mm2:mm2;
        dd1=(dd1<10)?'0'+dd1:dd1;
        dd2=(dd2<10)?'0'+dd2:dd2;

        let startDay = yy1+'.'+mm1+'.'+dd1;
        let endDay =  yy2+'.'+mm2+'.'+dd2;
        console.log(startDay, endDay);
        return startDay+'~'+endDay;
    }

    // 감정 개수 세는 함수
    async emotionCount(year: number, week: number, userId: number){ 
        const diaries = await this.diariesRepository.getWeeklyReport(year, week, userId);
        const reports = new Object(); // 리포트 객체 생성
        const categoryName = [1,2,3,4,5]; // 감정 array
        const emotionCnt = new Array();
        for(let i=0;i<5;i++){ // 감정 array 초기화
            emotionCnt[i]={
                category: categoryName[i],
                cnt: 0,
                rank: 1            
            }
        }

        // 감정 수 계산
        for(let i=0;i<diaries.length;i++){
            const diary = diaries[i];
            emotionCnt[diary.categoryId-1].cnt++;
        }
        reports['emotion']=emotionCnt.sort((a,b) => b.cnt - a.cnt); // 내림차순 정렬

        // 공동 순위 포함해서 순위계산
        let dup=1;
        for(let i=1;i<5;i++){
            if(reports['emotion'][i].cnt < reports['emotion'][i-1].cnt){ // 앞에꺼가 더 높은 순위라면
                reports['emotion'][i].rank = (dup!=1) ? reports['emotion'][i-1].rank+dup : reports['emotion'][i-1].rank+1;
                dup=1;
            }
            else{ // 둘이 공동순위라면
                reports['emotion'][i].rank = reports['emotion'][i-1].rank;
                dup++;
            }
        }
        return { reports, diaries };
    }

    // 전체 리포트 조회
    async getAllReports(userId: number){
        const reports = await this.reportsRepository.findListsByUser(userId);
        console.log(reports);
        const report = reports.filter((item, i) => {
            return reports.findIndex((item2, j) => { // 주어진 판별함수를 만족하는 첫번째 요소에 대한 인덱스 반환
                return item.year === item2.year && item.week === item2.week; 
            }) === i;
        }).reverse();
        return report;
    }

    // 주간 리포트 조회
    async getWeeklyReport(year: number, week: number, userId: number){
        // 일기를 하나도 안쓴 경우 빈 배열 리턴
        let sum=0;
        const reportByWeek = await this.reportsRepository.findReportByWeek(year, week, userId);
        reportByWeek.forEach(function(el){sum += el.cnt});
        if(sum==0)
            return [];

        const { reports, diaries } = await this.emotionCount(year, week, userId);
        reports['profileImage'] = await (await this.usersRepository.findByUserId(userId)).profileImage;
        const maxCategory = new Array();
        for(let i=0;i<5;i++){
            if(reports['emotion'][i].cnt == reports['emotion'][0].cnt)
                maxCategory.push(reports['emotion'][i].category);
        }
        const maxDiaries = diaries.filter(diary => maxCategory.includes(diary.categoryId)); // 최다 감정이 담긴 배열만 필터링
        const firstData = await this.reportsRepository.findByUser(userId); // 맨처음꺼만 가져옴
        const firstYear = firstData[0].year;
        const firstWeek = firstData[0].week;

        if(firstYear==year && firstWeek==week){ // 이전 데이터가 없는 신규 유저일 경우
            for(let i=0;i<5;i++)  
                reports['emotion'][i]['rankChange'] = 0;
        }
        else { // 이전 데이터가 존재하는 경우
            let sum=0;
            while(true){
                const reportByWeek = await this.reportsRepository.findReportByWeek(year, --week, userId);
                // if(reportByWeek.length==0) // 개발용
                //     return '지난주 기록이 없습니다';
                reportByWeek.forEach(function(el){sum += el.cnt});
                if(sum!=0){
                    break;
                }
            }
            for(let i=0;i<5;i++){  // 지난 주와 감정 순위 비교
                let categoryId = reports['emotion'][i].category;
                let rank = reports['emotion'][i].rank;
                const lastRank = await (await this.reportsRepository.findRankByCategory(year, week, userId, categoryId)).rank; 
                reports['emotion'][i]['rankChange'] = lastRank-rank;
            }    
        }

        // 가장 많은 감정의 일기 데이터
        const diaryList = new Array(); // diaries : [] 에 해당하는 배열
        const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        for(let i=0;i<maxCategory.length;i++){ // maxCnt 인 카테고리 번호가 담긴 배열            
            const diary = new Object(); // 각 카테고리별로 담을 딕셔너리 생성
            diary['period'] = await this.getStartAndEndDate(year,week); // 주차별 첫날~끝날
            diary['category'] = maxCategory[i]; // 딕셔너리 첫 요소 -  카테고리 번호
            const diaryObj = new Array();  // 각 카테고리에 해당하는 일기 담을 배열 생성
            for(let j=0;j<maxDiaries.length;j++){ // maxCnt인 카테고리로 필터링된 다이어리 배열 
                if(maxCategory[i] == maxDiaries[j].categoryId){
                    const { diaryId, date, categoryReason, diaryTitle, diaryCreated } = maxDiaries[j];
                    const day = date.getDate();
                    const dayOfWeek = WEEKDAY[date.getDay()]; // 요일계산
                    const createdTime = JSON.stringify(diaryCreated); // 2022-03-05T15:00:00.000Z
                    let hour = +createdTime.split('T')[1].split(':')[0]; 
                    hour = (hour+9>=13)?(hour-3):hour; // pm, am 계산
                    const diaryPost = {
                        diaryId,
                        day,
                        dayOfWeek,
                        diaryTitle,
                        diaryCreated: hour+':'+createdTime.split(':')[1]+'pm',
                        categoryReason,
                    }
                    diaryObj.push(diaryPost); // 일기 담는 배열에 diary 딕셔너리 푸시
                }
            }
            diary['diary'] = diaryObj.sort((a,b) => a.day - b.day); // 일기담은 배열 날짜 순
            diaryList[i] = diary;
        }
        reports['diaries'] = diaryList;
        console.log(reports);
        return reports;
    }
}
