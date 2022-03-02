import { EntityRepository, Repository } from 'typeorm';
import { Reports } from './reports.entity';

@EntityRepository(Reports)
export class ReportsRepository extends Repository<Reports> {
  // 일기 등록
  //     // 매주 월요일 00:00 시에 넣기
  //     async createReport(userId: number, year: number, month: number, week: number) {
  //         const diaries = await this.diariesRepository.getWeeklyReport(year, month, week, userId);
  //         const categoryIdToNumber = +categoryId;
  //         const diary = {
  //             userId: loginUserId,
  //             date,
  //             categoryId: categoryIdToNumber,
  //             categoryReason,
  //             diaryTitle,
  //             diaryContent,
  //             diaryCreated: new Date(),
  //             year: year,
  //             month: month,
  //             week: week
  //         };
  //         // 게시글 저장
  //         console.log(month);
  //         return await this.save(diary);
  //     }
}
