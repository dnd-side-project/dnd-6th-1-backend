import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DiariesRepository } from 'src/diaries/diaries.repository';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(ReportsRepository)
            private reportsRepository: ReportsRepository,
        @InjectRepository(DiariesRepository)
            private diariesRepository: DiariesRepository,
    ) {}
    private readonly logger = new Logger(ReportsService.name);

    @Cron('0 57 11 * * 1-5', {
      name: 'report',
      timeZone: 'Asia/Seoul',
    })
    async createReport(date: Date) {
        // 해당 날짜가 몇째주인지 확인하고 그걸 넘김


        

        // const diaries = await this.diariesRepository.getWeeklyReport(year, month, week, userId);
        const categoryName = [1,2,3,4,5];
        const emotionCnt = new Array();
        for(var i=0;i<5;i++){ // 감정 array 초기화
            emotionCnt[i]={
                category:categoryName[i],
                cnt:0
            }
        }
    }
    triggerNotifications() {}
}
