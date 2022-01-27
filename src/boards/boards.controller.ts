import { Logger } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Boards } from './boards.entity';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
    constructor(private boardsService: BoardsService){}

    @Get() // 커뮤니티 전체 글 조회 / 카테고리별 조회 / 검색어별 조회
    getAllBoards(@Query() query): Promise <Boards[]>{
        const { category, keyword } = query;
        return this.boardsService.getAllBoards(category, keyword);
    }

    @Get('/:boardId') // 커뮤니티 특정 글 조회
    getBoard(@Param("boardId") boardId: number): Promise <Boards> {
        return this.boardsService.getBoardById(boardId);
    }

    @Post() // 커뮤니티 글 작성
    createBoard(@Body() createBoardDto: CreateBoardDto): Promise<Boards> {
        return this.boardsService.createBoard(createBoardDto);
    }

    @Patch('/:boardId') // 커뮤니티 글 수정
    updateBoard(@Param("boardId") boardId: number, @Body() updateBoardDto: UpdateBoardDto) {
        this.boardsService.updateBoard(boardId, updateBoardDto);
    }

    @Delete('/:boardId') // 커뮤니티 글 삭제
    deleteBoard(@Param("boardId") boardId: number){
        return this.boardsService.deleteBoard(boardId);
    }

}
