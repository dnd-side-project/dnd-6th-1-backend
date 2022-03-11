import { EntityRepository, Repository } from 'typeorm';
import { Reports } from './reports.entity';

@EntityRepository(Reports)
export class ReportsRepository extends Repository<Reports> {
    // 매주 월요일 00:00 시에 넣기
    async createReport(year: number, lastWeek: number, userId: number, reports) {
        for(let i=0;i<5;i++){
            const report = {
                year,
                week: lastWeek,
                rank: reports['emotion'][i].rank,
                categoryId: reports['emotion'][i].category,
                cnt: reports['emotion'][i].cnt,
                userId
            }
            await this.save(report);
        }
    }

    // 이전 데이터가 없는지 확인
    async findByUser(userId: number){
        return await this.find({userId});
    }

    // 주차별 데이터 가져올때
    async findListsByUser(userId: number){
        return await this.find({
            select: ['year', 'week'],
            where: {
                userId
            }
        });
    }

    // 해당 주차에 데이터가 있는지
    async findReportByWeek(year: number, week: number, userId: number){
        return await this.find({
            select: ["cnt"],
            where: {
                year,
                week,
                userId
            }
        })
    }

    // 카테고리별 순위 가져오기
    async findRankByCategory(year: number, week: number, userId: number, categoryId: number) {
        return await this.findOne({
            select: ["rank"],
            where: {
                year,
                week,
                userId,
                categoryId
            }
        })
    }
}
