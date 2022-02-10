import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('마이페이지 API')
export class UsersController {
    constructor(
        private readonly usersService : UsersService,
    ){}

    // @Get('/:userId/history')   // 최근 검색어 기록 조회 (커뮤니티에서 검색 버튼을 누른 경우)
    // async getAllhistory(){

    // }

    @Post('/:userId/histories') // 검색어 입력한 경우 최근 검색어 db에 넣기
    @ApiOperation({ 
        summary : '특정 유저가 검색어 입력한 경우',
    })
    @ApiParam({
        name: 'userId',
        required: true, 
        description: '유저 ID'
    })
    @ApiBody({
        description: "검색 키워드", 
        schema: {
          properties: {
            keyword: { 
                type: "string",
                example:"테스트"
            }
          }
        }
    })
    async createHistory(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
        @Body('keyword') keyword: string
    ){
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })  
        const history = await this.usersService.createHistory(userId, keyword);

        return res
            .status(HttpStatus.OK)
            .json(history);
    }

    // @Delete('/:userId/history') // 검색어 모두 삭제 
    // async deleteHistory(){
        
    // }

    // @Delete('/:userId/history/:historyId') // 검색어 개별 삭제
    // async deleteAllHistory(){
        
    // }


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
