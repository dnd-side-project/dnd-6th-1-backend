import { EntityRepository, Like, Repository } from "typeorm";
import { Comments } from "./comments.entity";

@EntityRepository(Comments) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class CommentsRepository extends Repository<Comments>{
    // 댓글 등록시 comment DB
    async createComment(boardId: number, commentContent: string): Promise<Comments> {
        const comment = {
            commentContent,
            boardId,
            commentCreated: new Date()
        };
        const newComment = await this.save(comment);
        await this.update({commentId: newComment.commentId},{ // groupId는 commentId가 생긴 후 업뎃
            groupId: newComment.commentId
        });
        return newComment;
    }
}