import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { BoardsService } from 'src/boards/boards.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService : UsersService,
    ){}

    @Get('/:userId/posts')
    // @ApiOperation({ 
    //     summary : '커뮤니티 특정 글 북마크 API',
    //     description: '북마크 처음 누른 경우'
    // })
    // @ApiParam({
    //     name: 'boardId',
    //     required: true,
    //     description: '게시글 번호'
    // })
    // @ApiBody({
    //     description: "북마크 누르는 유저 ID", 
    //     schema: {
    //       properties: {
    //         userId: { 
    //             type: "number",
    //         },
    //       }
    //     }
    // })
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
        return res
            .status(HttpStatus.OK)
            .json(boards);
    }
}
