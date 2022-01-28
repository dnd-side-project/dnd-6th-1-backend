import { HttpException, HttpStatus, Logger, NotFoundException, Res, UploadedFiles, UseFilters } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor} from '@nestjs/platform-express';
import { Boards } from './boards.entity';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
require("dotenv").config();

const s3 = new AWS.S3();
@Controller('boards')
export class BoardsController {
    constructor(private boardsService: BoardsService){}

    @Get() // 커뮤니티 전체 글 조회 / 카테고리별 조회 / 검색어별 조회
    getAllBoards(@Query() query): Promise <Boards[]>{
        const { category, keyword } = query; // @Query()'에서 해당 쿼리문을 받아 query에 저장하고 변수 받아옴
        const data = this.boardsService.getAllBoards(category, keyword);
        console.log(data)
        return data;
    }

    @Get('/:boardId') // 커뮤니티 특정 글 조회
    async getBoard(@Param("boardId") boardId: number): Promise <Boards> {
        const board = await this.boardsService.getBoardById(boardId);
        if(!board)
            throw new NotFoundException();
        return board;
    }

    @Post() // 커뮤니티 글 작성
    @UseInterceptors(FilesInterceptor('files', 3, {
      storage: multerS3({ 
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        key: function (request, file, cb) { // files  for문 돌듯이 먼저 실행
            let S3ImageName = `${Date.now().toString()}-${file.originalname}`; // 파일 올리면 해당 파일의 이름을 받아옴 -> S3에 저장되는 이름
            cb(null, S3ImageName); // 이게 뭘까?            
        }
      })
    }))
    async createBoard(
        @UploadedFiles() files: Express.Multer.File[], 
        @Body() createBoardDto: CreateBoardDto
    ) {
        return this.boardsService.createBoard(files, createBoardDto);
    }

    @Patch('/:boardId') // 커뮤니티 글 수정
    async updateBoard(@Res() res, @Param("boardId") boardId: number, @Body() updateBoardDto: UpdateBoardDto){
        const board = await this.boardsService.getBoardById(boardId);
        if(!board)
            throw new NotFoundException();
        this.boardsService.updateBoard(boardId, updateBoardDto);
        return res
            .status(HttpStatus.OK)
            .json({
                success: true,
                message:'게시글을 수정했습니다'
            })
    }

    @Delete('/:boardId') // 커뮤니티 글 삭제
    async deleteBoard(@Res() res, @Param("boardId") boardId: number){
        const board = await this.boardsService.getBoardById(boardId);
        if(!board)
            throw new NotFoundException();
        this.boardsService.deleteBoard(boardId);
        return res
            .status(HttpStatus.OK)
            .json({
                success: true,
                message:'게시글이 삭제되었습니다'
            })
    }

}


