import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'domain';
import { report } from 'process';
import { DiariesRepository } from 'src/diaries/diaries.repository';
import { UsersRepository } from 'src/users/users.repository';
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


        let week = Math.ceil((firstDayofWeek - 1 + day) / 7);
        return {year, month, week};

    }
    // @Cron('0 57 11 * * 1-5', {
    //   name: 'report',
    //   timeZone: 'Asia/Seoul',
    // })
    async createReport(date: Date) {
        // 해당 날짜가 몇째주인지 확인하고 그걸 넘김 -> 주에서 -1 해야하고
        // 모든 유저에게 해당되어야 함
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        // 인풋한 달의 첫 날과 마지막 날의 요일
        const firstDate = new Date(year, month, 1);
        const firstDayOfWeek = firstDate.getDay() === 0 ? 7 : firstDate.getDay();
        let week = Math.ceil((firstDayOfWeek - 1 + day) / 7);

        // console.log(year,month,week);
        const users = await this.usersRepository.getAllUsers();
        for(let i=0;i<users.length;i++){ // 모든 유저의 리포트 생성
            // 특정 유저의 전 주의 diary를 모두 가져옴
            const diaries = await this.diariesRepository.getWeeklyReport(2022,3,1, users[i].userId);
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
            console.log(emotionCnt);
            for(let j=0;j<diaries.length;j++){
                await this.reportsRepository.createReport(reports);
            }
        }
    }
    triggerNotifications() {}
}
