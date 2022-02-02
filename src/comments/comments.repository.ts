import { EntityRepository, Repository } from "typeorm";
import { Comments } from "./comments.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@EntityRepository(Comments) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class CommentsRepository extends Repository<Comments>{

    // 댓글 조회시 댓글 / 대댓글 구분해서 가져오기
    async getAllComments(boardId: number): Promise <Comments[]> {
        // 댓글 
        const totalComments = new Array();
        const comments = await this.find({boardId, class:0}); // 부모 댓글 가져오기
        for(var i=0;i<comments.length;i++){
            var allComments = new Array();
            const replies = await this.find({boardId, class:1, groupId:comments[i].groupId}) // 각 부모댓글에 해당하는 대댓글 가져오기
            for(var j=0;j<replies.length;j++){
                allComments[j]=replies[j];
            }
            totalComments[i] = {
                comment: comments[i],
                replies: allComments
            }
        }
        console.log(totalComments)
        return totalComments;
    } 


    // 댓글 등록시 comment DB
    async createComment(boardId: number, createCommentDto: CreateCommentDto): Promise<Comments> {
        const { commentContent } = createCommentDto;
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

    // 대댓글 등록시
    async createReply(boardId: number, commentId: number, createReplyDto: CreateCommentDto): Promise<Comments> {
        const { commentContent } = createReplyDto;
        const reply = {
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

    // 커뮤니티 댓글 삭제
    async deleteBoard(commentId: number) {
        this.delete(commentId);
    }
}