import { EntityRepository, Repository } from 'typeorm';
import { Reports } from './reports.entity';

@EntityRepository(Reports)
export class ReportsRepository extends Repository<Reports> {
    // 매주 월요일 00:00 시에 넣기
    async createReport(reports: Object) {
        // console.log(reports);

    //     const report = {
    //         categoryId: reports.category, 
    //         cnt: reports.
    //         year,
    //         month,
    //         week,
    //         rank,
    //         userId
    //     }
    //     await this.save(report);
    // }
    }
}
