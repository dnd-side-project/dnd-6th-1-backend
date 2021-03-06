import { EntityRepository, Like, Repository } from "typeorm";
import { Likes } from "../entity/likes.entity";


@EntityRepository(Likes) 
export class LikesRepository extends Repository<Likes>{
    
    async findByBoardId(boardId: number, loginUserId: number){
        // likeStatus 관계없이 모두 리턴
        return await this.findOne({boardId, userId: loginUserId});
    }

    async getAllLikes(boardId: number): Promise<Likes[]> {
        return await this.find({boardId, likeStatus: true});
    }

    // 좋아요 처음 누를 시
    async createLike(boardId: number, userId: number): Promise<Likes>{
        const like = {
            boardId,
            userId
        }
        const newLike = await this.save(like);
        return newLike;
    }

    // 좋아요 상태 변경
    async updateLikeStatus(boardId: number, userId: number) {
        let like = await this.findOne({boardId, userId});
        if (like.likeStatus == true){ // 좋아요가 눌려져 있으면 취소
            await this.update({boardId, userId},{likeStatus: false});
        }
        else { // 좋아요가 안눌려져 있으면 좋아요 완료
            await this.update({boardId, userId},{likeStatus: true});
        }
        return await this.findOne({boardId, userId});
    }

    // 좋아요 여부
    async findByUserId(boardId: number, loginUserId: number) {
        const status = await this.findOne({boardId, userId: loginUserId, likeStatus: true});
        if(!status)
            return false;
        return true;
    }
}