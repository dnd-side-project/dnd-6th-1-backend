import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { create } from 'domain';
import { DiariesService } from 'src/diaries/diaries.service';
import { DiariesRepository } from 'src/diaries/repository/diaries.repository';
import { UsersRepository } from 'src/users/users.repository';
import { ReportsRepository } from './reports.repository';
import { TestedRepository } from './test.repository';

@Injectable()
export class ReportsService {
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        private testRepository: TestedRepository,
        private usersRepository: UsersRepository,
        private diariesService: DiariesService,
        private diariesRepository: DiariesRepository,
        private reportsRepository: ReportsRepository
    ) {}
    private readonly logger = new Logger(ReportsService.name);

    @Cron('55 01 11 * * 1-5', {
      name: 'report',
      timeZone: 'Asia/Seoul',
    })
    async createReport() {
        const users = await this.usersRepository.getAllUsers(); // 모든 유저
        for(let i=0;i<users.length;i++){
            const userId = users[i].userId;
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth()+1; // 1 더해줘야 우리가 찾는 달이 나옴
            const lastWeek = await this.diariesService.getWeek(today)-1; // 이번주(월)요일 전 주의 레포트 생성해야함
            const { reports } = await this.emotionCount(year, month, lastWeek, userId);
            await this.reportsRepository.createReport(year, month, lastWeek, userId, reports);
        }
        // this.schedulerRegistry.getCronJob('report');
    }
    triggerNotifications() {}

    // 감정 개수 세는 함수
    async emotionCount(year: number, month: number, lastWeek: number, userId: number){ 
        const diaries = await this.diariesRepository.getWeeklyReport(year,month,lastWeek, userId);
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


        // const emotionCnt = new Array();
        // // console.log(diaries);
        // diaries.forEach((x) => { 
        //     console.log(x);
        //     result[x.categoryId]= (result[x.categoryId] || 0)+1; 
        // });
        // console.log(JSON.stringify(result));

        return { reports, diaries };
    }

    // 주간 리포트 조회
    async getWeeklyReport(year: number, month: number, week: number, userId: number){   
        const { reports, diaries } = await this.emotionCount(year, month, week, userId);
        const maxCategory = new Array();
        for(let i=0;i<5;i++){
            if(reports['emotion'][i].cnt == reports['emotion'][0].cnt)
                maxCategory.push(reports['emotion'][i].category);
        }
        const maxDiaries = diaries.filter(diary => maxCategory.includes(diary.categoryId)); // 최닥 감정이 담긴 배열만 필터링
        for(let i=0;i<5;i++){         // 지난 주와 감정 순위 비교
            let categoryId = reports['emotion'][i].category;
            let rank = reports['emotion'][i].rank;
            const lastRank = await this.reportsRepository.findRankByCategory(year, month, week, userId, categoryId);
            console.log(lastRank);
            // reports['emotion'][i]['rank'] = rank-lastRank;
        }

        // 가장 많은 감정의 일기 데이터
        const diaryList = new Array(); // diaries : [] 에 해당하는 배열
        const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        for(var i=0;i<maxCategory.length;i++){ // maxCnt 인 카테고리 번호가 담긴 배열            
            const diary = new Object(); // 각 카테고리별로 담을 딕셔너리 생성
            diary['period'] = 
            diary['category'] = maxCategory[i]; // 딕셔너리 첫 요소 -  카테고리 번호
            const diaryObj = new Array();  // 각 카테고리에 해당하는 일기 담을 배열 생성
            for(var j=0;j<maxDiaries.length;j++){ // maxCnt인 카테고리로 필터링된 다이어리 배열 
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
