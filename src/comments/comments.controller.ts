import { HttpStatus, ParseIntPipe, Req, Res, UploadedFiles } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BoardsService } from 'src/boards/boards.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
require("dotenv").config();

@Controller('boards/:boardId/comments')
@ApiTags('커뮤니티 댓글 API')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly boardsService: BoardsService
    ){}

    // @Get() // 특정 글의 댓글 조회
    // @ApiOperation({ 
    //     summary: '커뮤니티 특정 글의 모든 댓글 조회 API'
    // })
    // @ApiParam({
    //     name: 'boardId',
    //     required: true,
    //     description: '게시글 번호'
    // })
    // async getAllComments(
    //     @Res() res, 
    //     @Param("boardId", new ParseIntPipe({
    //         errorHttpStatusCode: HttpStatus.BAD_REQUEST
    //     }))
    //     boardId: number
    // ){
    //     const board = await this.boardsService.findByBoardId(boardId);
    //     console.log(board);
    //     if(!board)
    //         return res
    //             .status(HttpStatus.NOT_FOUND)
    //             .json({
    //                 message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
    //             })

    //     const comments = await this.boardsService.getAllComments(boardId);
    //     if(comments.length==0)
    //         return res
    //             .status(HttpStatus.OK)
    //             .json({
    //                 message:`게시물 번호 ${boardId}번 게시물에 댓글이 없습니다`
    //             })
    //     return res
    //         .status(HttpStatus.OK)
    //         .json(comments)
    // }

    @Post() // 특정 글의 댓글 작성
    @ApiOperation({ summary : '커뮤니티 특정 글에 댓글 작성 API' })
    @ApiBody({ type : CreateCommentDto })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    async createComment(
        @Res() res, 
        @Body() createCommentDto: CreateCommentDto,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number
    ): Promise<any> {
        const comment = await this.commentsService.createComment(boardId, createCommentDto);
        return res
            .status(HttpStatus.CREATED)
            .json({
                data: comment,
                message:'댓글을 등록했습니다.'
            });
    }

    @Post('/:commentId') // 특정 글의 대댓글 작성
    @ApiOperation({ summary : '커뮤니티 대댓글 작성 API' })
    @ApiBody({ type : UpdateCommentDto })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    @ApiParam({
        name: 'commentId',
        required: true,
        description: '댓글 번호'
    })
    async createReply(
        @Res() res, 
        @Body() createReplyDto: CreateCommentDto,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
        @Param("commentId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        commentId: number
    ): Promise<any> {
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
                })

        const comment = await this.commentsService.getCommentById(commentId);
        if(!comment)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`댓글 번호 ${commentId}번에 해당하는 댓글이 없습니다.`
                })

        const reply = await this.commentsService.createReply(boardId, commentId, createReplyDto);
        
        return res
            .status(HttpStatus.CREATED)
            .json({
                data: reply,
                message:'대댓글을 등록했습니다.'
            });
    }

    @Patch('/:commentId') // 특정 글의 댓글/ 대댓글 수정
    @ApiOperation({ summary : '커뮤니티 특정 댓글 수정 API' })
    async updateComment(
        @Res() res,
        @Body() updateCommentDto: UpdateCommentDto,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number, 
        @Param("commentId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        commentId: number
    ){
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
                })

        const comment = await this.commentsService.getCommentById(commentId);
        if(!comment)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`댓글 번호 ${commentId}번에 해당하는 댓글이 없습니다.`
                })
        const updatedComment = await this.commentsService.updateComment(commentId, updateCommentDto);
        return res
            .status(HttpStatus.OK)
            .json({
                data: updatedComment,
                message:'댓글을 수정했습니다'
            })
    }

    @Delete('/:commentId') // 특정 글의 댓글 삭제
    @ApiOperation({ summary : '커뮤니티 특정 댓글 삭제 API' })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    @ApiParam({
        name: 'commentId',
        required: true,
        description: '댓글 번호'
    })
    async deleteBoard(
        @Res() res, 
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
        @Param("commentId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        commentId: number
    ){
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
                })

        const comment = await this.commentsService.getCommentById(commentId);
        if(!comment)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`댓글 번호 ${commentId}번에 해당하는 댓글이 없습니다.`
                })
        this.commentsService.deleteComment(commentId);
        return res
            .status(HttpStatus.OK)
            .json({
                message:'댓글이 삭제되었습니다'
            })
    }
}
