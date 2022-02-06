import { EntityRepository, Repository } from "typeorm";
import { Comments } from "./comments.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@EntityRepository(Comments) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class CommentsRepository extends Repository<Comments>{

    async getParentComments(boardId: number): Promise <Comments[]>{
        return await this.find({boardId, class: 0, commentStatus: true}); // 부모 댓글 가져오기
    }

    async getChildComments(boardId: number, groupId: number): Promise <Comments[]>{
        return await this.find({boardId, class:1, groupId, commentStatus: true}) // 각 부모댓글에 해당하는 대댓글 가져오기
    }

    async getAllComments(boardId: number): Promise <Comments[]>{ // 게시물의 모든 댓글 가져오기
        return await this.find({boardId, commentStatus: true});
    }

    // 댓글 등록시 comment DB
    async createComment(boardId: number, createCommentDto: CreateCommentDto): Promise<Comments> {
        const { userId, commentContent } = createCommentDto;
        const comment = {
            userId,
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

    // 대댓글 등록시
    async createReply(boardId: number, commentId: number, createReplyDto: CreateCommentDto): Promise<Comments> {
        const { userId, commentContent } = createReplyDto;
        const reply = {
            userId,
            commentContent,
            boardId,
            class: 1,
            groupId: commentId,
            commentCreated: new Date()
        };
        const newReply = await this.save(reply);
        return newReply;
    }

    // 커뮤니티 댓글 수정
    async updateComment(commentId: number, updateCommentDto: UpdateCommentDto) {
        const { commentContent } = updateCommentDto;
        await this.update({commentId}, {commentContent});
    }

    // 커뮤니티 댓글 삭제 -> commentStatus = false 로 변경
    async deleteBoard(commentId: number) {
        await this.update({commentId}, {commentStatus : false})
    }
}