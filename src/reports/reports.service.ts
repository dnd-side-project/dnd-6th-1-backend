import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'domain';
import { report } from 'process';
import { DiariesRepository } from 'src/diaries/diaries.repository';
import { UsersRepository } from 'src/users/users.repository';
import { CreateReportDto } from './create-report.dto';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(ReportsRepository)
            private reportsRepository: ReportsRepository,
        @InjectRepository(DiariesRepository)
            private diariesRepository: DiariesRepository,
        @InjectRepository(UsersRepository)
            private usersRepository: UsersRepository,
    ) {}
    private readonly logger = new Logger(ReportsService.name);

 
    async weekNumber(date: Date){
        let year = date.getFullYear(); // 2022년
        let month = date.getMonth() + 1; // 3월 월(0–11)을 반환
        let day = date.getDate(); // 3일 일(1–31)을 반환

        // 인풋한 달의 첫 날과 마지막 날의 요일 
        const firstDate = new Date(year, month-1, 1);
        const lastDate = new Date(year, month, 0);
        const firstDayofWeek = firstDate.getDay() === 0 ? 7 : firstDate.getDay();
        const lastDayofWeek = lastDate.getDay();

        console.log(year,month,day, firstDate, lastDate, firstDayofWeek, lastDayofWeek)
            
            // // 인풋한 달의 마지막 일 
            // const lastDay = lastDate.getDate();
            
            // // 첫 날의 요일이 금, 토, 일이라면 true
            // const fistWeekCheck = fistDayOfWeek === 5 || fistDayOfWeek === 6 || fistDayOfWeek ==7;
            // const lastWeekCheck = lastDayOfWeek === 1 || lastDayOfWeek === 2 || lastDayOfWeek === 3;
            
            // // 해당 달이 총 몇주까지 있는지 
            // const lastWeekNo = Math.ceil((fistDayOfWeek -1 + lastDay / 7);
                                        
            // // 날짜 기준으로 몇 주차 인지
            // let weekNo = Math.ceil((fistDayOfWeek -1 + date) / 7);
            // // 인풋한 날짜가 첫 주에 있고 첫 날이 월, 화, 수로 시작한다면 'prev'(전달 마지막 주)
            // if (weekNo === 1 && fistWeekCheck) weekNo = 'prev';
            // // 인풋한 날짜가 마지막 주에 있고 마지막 날이 월, 화, 수로 끝난다면 'next'(다음달 첫 주)
            // else if(weekNo === lastWeekNo && lastWeekCheck) weekNo = 'next'l
            // // 인풋한 날짜의 첫 주는 아니지만 첫 날이 월, 화, 수로 시작하면 -1;
            // else if (fistWeekCheck) weekNo = weekNo -1 ;
            
            // return weekNo;
        
        
    //     // 목요일 기준의 주차 
    //     last weekNo = weekNumberByThurFnc(inputDate);
        
    //     // 이전달의 마지막 주차일때 
    //     const afterDate = new Date(year, month01, 0);
    //     year = month === 1 ? year -1 : year;
    //     month = month === 1 ? 12 : month - 1;
    //     weekNo = weekNumberByThurFnc(afterDate);
    //   }
    //   // 다음달의 첫 주차일 때 
    //   if(weekNo === 'next') {
    //     year = month === 12 ? year+1 : year;
    //     month = month === 12 ? 1 : month + 1;
    //     weekNo = 1;
    //   }
    //     return {
    //       year, month, weekNo
    //     }
    //   }
    }

    // @Cron('0 57 11 * * 1-5', {
    //   name: 'report',
    //   timeZone: 'Asia/Seoul',
    // })
    async createReport(date: Date) {
        console.log(date);
        // 해당 날짜가 몇째주인지 확인하고 그걸 넘김 -> 주에서 -1 해야하고
        // 모든 유저에게 해당되어야 함
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        // 인풋한 달의 첫 날과 마지막 날의 요일
        const firstDate = new Date(year, month, 1);
        const firstDayOfWeek = firstDate.getDay() === 0 ? 7 : firstDate.getDay();
        console.log(firstDate, firstDayOfWeek)
        let week = Math.ceil((firstDayOfWeek - 1 + day) / 7);
        console.log(year,month,week);
        const users = await this.usersRepository.getAllUsers();
        for(let i=0;i<users.length;i++){ // 모든 유저의 리포트 생성
            // 특정 유저의 전 주의 diary를 모두 가져옴
            const diaries = await this.diariesRepository.getWeeklyReport(year, month, week-1, users[i].userId);
            // 리포트 객체 생성
            const reports = new Object();
            // 감정 array
            const categoryName = [1,2,3,4,5];
            const emotionCnt = new Array();
            for(let j=0;j<5;j++){ // 감정 array 초기화
                emotionCnt[j]={
                    category:categoryName[j],
                    cnt:0
                }
            }

            // 감정 세기 
            for(let j=0;j<diaries.length;j++){
                const diary = diaries[j];
                emotionCnt[diary.categoryId-1].cnt++;
            }
            reports['emotion']=emotionCnt.sort((a,b) => b.cnt - a.cnt); // 내림차순 정렬
            console.log(reports);
            for(let j=0;j<diaries.length;j++){
                await this.reportsRepository.createReport(reports);
            }
        }
    }
    triggerNotifications() {}
}
