import { Logger } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Boards } from './boards.entity';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
export class BoardsController {
    constructor(private boardsService: BoardsService){}

    // param을 사용하는 get 요청이 존재할 시,
    // 그 밑으로의 get의 내부 url이 param으로 인식된다.

    @Get() // 커뮤니티 전체 글 조회
    getAllBoards(): Promise <Boards[]> {
        return this.boardsService.getAllBoards();
    }
    

    @Get('') // 커뮤니티 검색어별 글 조회
    getAllBoardsByKeyword(@Query("keyword") keyword: string): Promise <Boards[]>{
        return this.boardsService.getAllBoardsByKeyword(keyword);
    }

    @Get('') // 커뮤니티 카테고리별 글 조회
    getAllBoardsByCategory(@Query("category") category: string): Promise <Boards[]>{
        Logger.warn(category);
        return this.boardsService.getAllBoardsByCategory(category);
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
