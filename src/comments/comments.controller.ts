import { HttpStatus, Inject, ParseIntPipe, Req, Res, UploadedFiles, UseGuards } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { BoardsService } from 'src/boards/boards.service';
import { UsersService } from 'src/users/users.service';
import { Comments } from './comments.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
require("dotenv").config();

@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/comments')
@ApiTags('커뮤니티 댓글 API')
export class CommentsController {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly commentsService: CommentsService,
        private readonly boardsService: BoardsService,
        private readonly usersService : UsersService    
    ){}    

    @Post() // 특정 글의 댓글 작성
    @ApiOperation({ summary : '커뮤니티 특정 글에 댓글 작성 API' })
    @ApiCreatedResponse({ description: '댓글을 생성합니다', type: Comments })
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
        boardId: number,
        @GetUser() loginUser
    ): Promise<any> {
        try{
            const { userId } = loginUser;
            const board = await this.boardsService.findByBoardId(boardId);
            if(!board)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
                    })

            const comment = await this.commentsService.createComment(userId, boardId, createCommentDto);
            return res
                .status(HttpStatus.CREATED)
                .json({
                    data: comment,
                    message:'댓글을 등록했습니다.'
                });
        } catch(error){
            this.logger.error('커뮤니티 특정 글에 댓글 작성 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
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
        commentId: number,
        @GetUser() loginUser
    ): Promise<any> {
        try{
            const { userId } = loginUser; 
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

            const reply = await this.commentsService.createReply(userId, boardId, commentId, createReplyDto);
            
            return res
                .status(HttpStatus.CREATED)
                .json({
                    data: reply,
                    message:'대댓글을 등록했습니다.'
                });
        } catch(error){
            this.logger.error('커뮤니티 대댓글 작성 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @Patch('/:commentId') // 특정 글의 댓글/ 대댓글 수정
    @ApiOperation({ summary : '커뮤니티 특정 댓글/대댓글 수정 API' })
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
        commentId: number,
        @GetUser() loginUser
    ){
        try{
            const { userId } = loginUser;
            const user = await this.usersService.findByUserId(userId);
            if(!user)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                    })

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

            if(loginUser.userId != comment.userId) // 현재 로그인한 사람과 댓글 작성자가 다른 경우
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        message:`댓글을 수정할 권한이 없습니다.`
                    })     
                    
            const updatedComment = await this.commentsService.updateComment(commentId, updateCommentDto);
            return res
                .status(HttpStatus.OK)
                .json({
                    data: updatedComment,
                    message:'댓글을 수정했습니다'
                })
        } catch(error){
            this.logger.error('커뮤니티 특정 댓글/대댓글 수정 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
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
        commentId: number,
        @GetUser() loginUser
    ){
        try{
            const { userId } = loginUser;
            const user = await this.usersService.findByUserId(userId);
            if(!user)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                    })

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

            if(loginUser.userId != comment.userId) // 현재 로그인한 사람과 댓글 작성자가 다른 경우
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        message:`댓글을 삭제할 권한이 없습니다.`
                    })      
                    
            this.commentsService.deleteComment(commentId);
            return res
                .status(HttpStatus.OK)
                .json({
                    message:'댓글이 삭제되었습니다'
                })
        } catch(error){
            this.logger.error('커뮤니티 댓글 삭제 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }
}
