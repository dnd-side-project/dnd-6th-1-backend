import { TestScheduler } from "rxjs/testing";
import { EntityRepository, Repository } from "typeorm";
import { Tested } from "./test.entity";

@EntityRepository(Tested)
export class TestedRepository extends Repository<Tested> {
    // 매주 월요일 00:00 시에 넣기
    async createReport(userId: number) {
        // console.log(reports);

        const report = {
            userId,
            title:'하이',
            created:new Date()
        }
        await this.save(report);
    }
}
