import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comments } from './comments.entity';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(CommentsRepository)
            private commentsRepository: CommentsRepository,
    ){}

    // 특정 댓글이 있는 지 확인
    async getCommentById(commentId: number): Promise <Comments> {
        return await this.commentsRepository.findOne(commentId);
    }   

    // 특정 글에 댓글 작성
    async createComment(boardId: number, createCommentDto: CreateCommentDto): Promise<Comments> {
        const comment = await this.commentsRepository.createComment(boardId, createCommentDto); // board DB에 저장
        return comment;
    }

    // 특정 댓글에 대댓글 작성
    async createReply(boardId: number, commentId: number, createReplyDto: CreateCommentDto): Promise<Comments> {
        const reply = await this.commentsRepository.createReply(boardId, commentId, createReplyDto); // board DB에 저장
        return reply;
    }

    // 댓글 수정
    async updateComment(commentId: number, updateCommentDto: UpdateCommentDto): Promise<Comments> {
        await this.commentsRepository.updateComment(commentId, updateCommentDto);
        const comment = await this.getCommentById(commentId);
        return comment;
    }

    // 댓글 삭제
    async deleteComment(commentId: number) {
        this.commentsRepository.deleteBoard(commentId);
    }
}

