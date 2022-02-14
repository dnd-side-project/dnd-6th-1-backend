import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('마이페이지 API')
export class UsersController {
    constructor(
        private readonly usersService : UsersService,
    ){}

    @Get('/:userId/histories')   // 최근 검색어 기록 조회 (커뮤니티에서 검색 버튼을 누른 경우)
    @ApiOperation({ 
        summary : '특정 유저의 최근 검색어 조회',
    })
    @ApiParam({
        name: 'userId',
        required: true, 
        description: '유저 ID'
    })
    async getAllhistory(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
    ){
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })  
        const histories = await this.usersService.getAllHistories(userId);

        return res
            .status(HttpStatus.OK)
            .json(histories);
    }

    @Delete('/:userId/histories/:historyId') // 검색어 개별 삭제
    @ApiOperation({ 
        summary : '검색어 기록 개별 삭제 API',
    })
    @ApiParam({
        name: 'userId',
        required: true, 
        description: '유저 ID'
    })
    @ApiParam({
        name: 'historyId',
        required: true, 
        description: '검색기록 ID'
    })
    async deleteHistory(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
        @Param("historyId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        historyId: number,
    ){
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })  
        
        // 해당유저가 historyId 의 검색기록을 작성한 경우
        const history = await this.usersService.findByHistoryId(historyId);
        console.log(history);
        if(!history)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`검색기록 번호 ${historyId}번에 해당하는 검색 기록이 없습니다.`
                })
        
                console.log(history.userId)
        if(history.userId != userId) // 검색한 사람 id랑 history 남긴 id가 다른 경우
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    message:`검색기록 번호 ${historyId}번을 삭제할 권한이 없습니다.`
                })   

        await this.usersService.deleteHistory(userId, historyId);

        return res
            .status(HttpStatus.OK)
            .json({
                message: '검색어가 삭제 되었습니다.'
            });
    }

    @Delete('/:userId/histories') // 검색어 모두 삭제 
    @ApiOperation({ 
        summary : '검색어 기록 전체 삭제 API',
    })
    @ApiParam({
        name: 'userId',
        required: true, 
        description: '유저 ID'
    })
    async deleteAllHistories(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
    ){
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })  
        
        const histories = await this.usersService.getAllHistories(userId);
        if(histories.length==0)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`삭제할 검색기록이 없습니다.`
                })  

        await this.usersService.deleteHistories(userId);

        return res
            .status(HttpStatus.OK)
            .json({
                message: '검색어가 전체삭제 되었습니다.'
            });
    }

    @Get('/:userId/boards')
    @ApiOperation({ 
        summary : '특정 유저가 쓴 글 조회 API',
    })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '유저 ID'
    })
    async getAllBoardsByUserId(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
    ){
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })  
        const boards = await this.usersService.getAllBoardsByUserId(userId);
        if(boards.length == 0)
            return res
                .status(HttpStatus.OK)
                .json({
                    message:`작성한 게시글이 없습니다.`
                })

        return res
            .status(HttpStatus.OK)
            .json(boards);
    }

    @Get('/:userId/comments')
    @ApiOperation({ 
        summary : '특정 유저가 댓글을 단 글 조회 API',
    })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '유저 ID'
    })
    async getAllBoardsByComments(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
    ){
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })   

        const boards = await this.usersService.getAllBoardsByComments(userId);
        if(boards.length == 0)
            return res
                .status(HttpStatus.OK)
                .json({
                    message:`댓글 단 게시글이 없습니다.`
                })
                
        return res
            .status(HttpStatus.OK)
            .json(boards);
    }

    @Get('/:userId/bookmarks')
    @ApiOperation({ 
        summary : '특정 유저가 북마크한 글 조회 API',
    })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '유저 ID'
    })
    async getAllBoardsByBookmark(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
    ){
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })   

        const boards = await this.usersService.getAllBoardsByBookmark(userId);
        if(boards.length == 0)
            return res
                .status(HttpStatus.OK)
                .json({
                    message:`북마크 한 게시글이 없습니다.`
                })

        return res
            .status(HttpStatus.OK)
            .json(boards);
    }
}
