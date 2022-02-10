import { EntityRepository, Repository } from "typeorm";
import { Histories } from "../entity/histories.entity";

@EntityRepository(Histories) 
export class HistoriesRepository extends Repository<Histories>{
    // async createHistory(){

    // }
    // async getAllLikes(boardId: number): Promise<Likes[]> {
    //     return await this.find({boardId, likeStatus: true});
    // }

    //  검색어 입력 시
    async createHistory(userId: number, keyword: string): Promise<Histories>{
        const history = {
            keyword,
            userId,
            keywordSearched: new Date()
        }
        const newHistory = await this.save(history);
        return newHistory;
    }

    // // 좋아요 상태 변경
    // async changeLikeStatus(boardId: number, userId: number) {
    //     const like = await this.findOne({boardId, userId});
    //     if (like.likeStatus == true){ // 좋아요가 눌려져 있으면 취소
    //         await this.update({boardId, userId},{likeStatus: false});
    //     }
    //     else { // 좋아요가 안눌려져 있으면 좋아요 완료
    //         await this.update({boardId, userId},{likeStatus: true});
    //     }
    //}
}