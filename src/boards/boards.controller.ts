import { HttpStatus, ParseIntPipe, Req, Res, UploadedFiles } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor} from '@nestjs/platform-express';
import { Boards } from './boards.entity';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateBoardFirstDto } from './dto/create-board-first.dto';
require("dotenv").config();

const s3 = new AWS.S3();

@Controller('boards')
@ApiTags('커뮤니티 글 API')
export class BoardsController {
    constructor(private readonly boardsService: BoardsService){}

    @Get() // 커뮤니티 전체 글 조회 / 카테고리별 조회 / 검색어별 조회
    @ApiOperation({ 
        summary: '커뮤니티 글 조회 API'
    })
    @ApiQuery({
        name: 'category',
        required: false,
        description: '카테고리별'
    })
    @ApiQuery({
        name: 'keyword',
        required: false,
        description: '검색어별'
    })
    async getAllBoards(@Res() res, @Query() query): Promise <Boards[]>{
        const { category, keyword } = query; // @Query()'에서 해당 쿼리문을 받아 query에 저장하고 변수 받아옴
        let boards;
        if(keyword==null && category==null){ // 전체 글 조회
            boards = await this.boardsService.getAllBoards();
            console.log(boards);
        }
        else if(keyword!=null && category==null){ // 검색어별 조회
            if(keyword.length < 2){
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        message:'2글자 이상 입력해주세요.'
                    }) 
            }
            boards = await this.boardsService.getAllBoardsByKeyword(keyword);
            console.log(boards);
            if(boards['resultCnt']==0){
                return res
                    .status(HttpStatus.NO_CONTENT)
                    .json({
                        message:'검색 결과가 없습니다.'
                    })
            }
            // else
            //     return res
            //         .status(HttpStatus.OK)
            //         .json({
            //             message:'하잉'
            //         })   
        }    
        else if(keyword==null && category!=null){ // 카테고리별 조회
            if(['부정','화','타협','슬픔','수용'].includes(category))
                boards = await this.boardsService.getAllBoardsByCategory(category);
            else
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        message:'잘못된 카테고리입니다.'
                    })  
        }
        console.log(boards);
        return res
            .status(HttpStatus.OK)
            .json(boards);
    }

    @Get('/:boardId') // 커뮤니티 특정 글 조회 (상세페이지에서도 댓글 시간체크!!!!!!!!!)
    @ApiOperation({ summary : '커뮤니티 특정 글 조회 API' })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    async getBoard(
        @Res() res,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number
    ) {
        const board = await this.boardsService.getBoardById(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
                })
        return res
            .status(HttpStatus.OK)
            .json(board);
    }

    @Post() // 커뮤니티 글 작성
    @ApiOperation({ summary : '커뮤니티 글 작성 API' })
    @ApiBody({ type : CreateBoardDto })
    @UseInterceptors(
        FilesInterceptor('files', 3, {
            storage: multerS3({ 
            s3: s3,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            contentType: multerS3.AUTO_CONTENT_TYPE, 
            acl: 'public-read',
            key: function (request, file, cb) { // files  for문 돌듯이 먼저 실행
                file.encoding = 'utf-8';
                let S3ImageName = `boardImages/${Date.now().toString()}-${file.originalname}`; // 파일 올리면 해당 파일의 이름을 받아옴 -> S3에 저장되는 이름
                cb(null, S3ImageName);   
            },
        }),
    }))
    async createBoard(
        @Res() res, 
        @UploadedFiles() files: Express.Multer.File[], 
        @Body() createBoardFirstDto: CreateBoardFirstDto,
    ): Promise<any> {
        console.log(createBoardFirstDto);
        // console.log(userId);
        // const board = await this.boardsService.createBoard(files, createBoardDto, userId);
        const board = await this.boardsService.createBoard(files, createBoardFirstDto);

        return res
            .status(HttpStatus.CREATED)
            .json({
                data: board,
                message:'게시물을 등록했습니다.'
            });
    }

    // @Patch('/:boardId') // 커뮤니티 글 수정
    // @ApiOperation({ summary : '커뮤니티 특정 글 수정 API' })
    // @ApiBody({ type : UpdateBoardDto })
    // @ApiParam({
    //     name: 'boardId',
    //     required: true,
    //     description: '게시글 번호'
    // })
    // @UseInterceptors(
    //     FilesInterceptor('files', 3, {
    //         storage: multerS3({ 
    //         s3: s3,
    //         bucket: process.env.AWS_S3_BUCKET_NAME,
    //         contentType: multerS3.AUTO_CONTENT_TYPE, 
    //         acl: 'public-read',
    //         key: function (request, file, cb) { // files  for문 돌듯이 먼저 실행
    //             file.encoding = 'utf-8';
    //             let S3ImageName = `boardImages/${Date.now().toString()}-${file.originalname}`; // 파일 올리면 해당 파일의 이름을 받아옴 -> S3에 저장되는 이름
    //             cb(null, S3ImageName);   
    //         },
    //     }),
    // }))
    // async updateBoard(
    //     @Res() res, 
    //     @Param("boardId", new ParseIntPipe({
    //         errorHttpStatusCode: HttpStatus.BAD_REQUEST
    //     }))
    //     boardId: number, 
    //     @Body() updateBoardDto: UpdateBoardDto
    // ){
    //     const board = await this.boardsService.getBoardById(boardId);
    //     if(!board)
    //         return res
    //             .status(HttpStatus.NOT_FOUND)
    //             .json({
    //                 message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
    //             })
    //     const updatedBoard = await this.boardsService.updateBoard(boardId, updateBoardDto);
    //     return res
    //         .status(HttpStatus.OK)
    //         .json({
    //             data: updatedBoard,
    //             message:'게시글을 수정했습니다'
    //         })
    // }

    @Delete('/:boardId')
    @ApiOperation({ summary : '커뮤니티 특정 글 삭제 API' })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    async deleteBoard(
        @Res() res, 
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number
    ){
        const board = await this.boardsService.getBoardById(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시물 번호 ${boardId}번에 해당하는 게시물이 없습니다.`
                })
        this.boardsService.deleteBoard(boardId);
        return res
            .status(HttpStatus.OK)
            .json({
                message:'게시글이 삭제되었습니다'
            })
    }
}