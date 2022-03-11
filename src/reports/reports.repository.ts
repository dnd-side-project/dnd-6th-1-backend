import { EntityRepository, Repository } from 'typeorm';
import { Reports } from './reports.entity';

@EntityRepository(Reports)
export class ReportsRepository extends Repository<Reports> {
    // 매주 월요일 00:00 시에 넣기
    async createReport(year: number, month: number, lastWeek: number, userId: number, reports) {
        for(let i=0;i<5;i++){
            const report = {
                year,
                month,
                week: lastWeek,
                rank: reports['emotion'][i].rank,
                categoryId: reports['emotion'][i].category,
                cnt: reports['emotion'][i].cnt,
                userId
            }
            await this.save(report);
        }
    }

    async findRankByCategory(year: number, month: number, week: number, userId: number, categoryId: number) {
        return await this.findOne({
            select: ["rank"],
            where: {
                year,
                month,
                week,
                userId,
                categoryId
            }
        })
    }
}
