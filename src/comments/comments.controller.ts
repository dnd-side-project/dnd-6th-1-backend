import { HttpStatus, ParseIntPipe, Req, Res, UploadedFiles } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
require("dotenv").config();

@Controller('boards/:boardId/comments')
@ApiTags('커뮤니티 댓글 API')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService){}

    @Get('') // 특정 글의 댓글 조회
    async getAllComments(@Res() res){
       const comments = await this.commentsService.getAllComments();
       return res
            .status(HttpStatus.OK)
            .json(comments)
    }

    @Post() // 특정 글의 댓글 작성
    @ApiOperation({ summary : '커뮤니티 댓글 작성 API' })
    async createComment(
        @Res() res, 
        @Body('commentContent') commentContent: string,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number
    ): Promise<any> {
        const comment = await this.commentsService.createComment(boardId, commentContent);
        
        return res
            .status(HttpStatus.CREATED)
            .json({
                data: comment,
                message:'댓글을 등록했습니다.'
            });
    }



    // @Patch('/:commentId') // 특정 글의 댓글 수정

    // @Delete('/:commentId') // 특정 글의 댓글 삭제
}
