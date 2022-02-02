import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comments } from './comments.entity';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(CommentsRepository)
            private commentsRepository: CommentsRepository,
    ){}

    // 특정 글의 모든 댓글 조회
    async getAllComments(): Promise <Comments[]> {
        return await this.commentsRepository.find();
    }

    // 특정 글에 댓글 작성
    async createComment(boardId: number, commentContent: string): Promise<Comments> {
        const comment = await this.commentsRepository.createComment(boardId, commentContent); // board DB에 저장
        return comment;
    }

    // async getBoardById(boardId: number): Promise <Comments> {
    //     return await this.commentsRepository.findOne(boardId);
    // }      
}
