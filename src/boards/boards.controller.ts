import { HttpStatus, ParseIntPipe, Res, UploadedFiles } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor} from '@nestjs/platform-express';
import { Boards } from './entity/boards.entity';
import { BoardsService } from './boards.service';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateBoardFirstDto } from './dto/create-board-first.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UsersService } from 'src/users/users.service';
require("dotenv").config();

const s3 = new AWS.S3();

@Controller('boards')
@ApiTags('커뮤니티 글 API')
export class BoardsController {
    constructor(
        private readonly boardsService: BoardsService, 
        private readonly usersService : UsersService    
    ){}

    @Get() // 커뮤니티 전체 글 조회 / 카테고리별 조회 / 검색어별 조회
    @ApiOperation({ 
        summary: '커뮤니티 메인화면에서 전체 글 조회 API'
    })
    @ApiQuery({
        name: 'category',
        required: false,
        description: '카테고리별',
        example:'슬픔'
    })
    @ApiQuery({
        name: 'keyword',
        required: false,
        description: '검색어별',
        example:'졸려'
    })
    async getAllBoards(@Res() res, @Query() query): Promise <Boards[]>{
        const { category, keyword } = query; // @Query()'에서 해당 쿼리문을 받아 query에 저장하고 변수 받아옴
        let boards;
        if(keyword==null && category==null){ // 전체 글 조회
            boards = await this.boardsService.getAllBoards();
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
        }    
        else if(keyword==null && category!=null){ // 카테고리별 조회
            if(['부정','화','타협','슬픔','수용'].includes(category)){
                boards = await this.boardsService.getAllBoardsByCategory(category);
                if(boards.length == 0)
                    return res
                        .status(HttpStatus.OK)
                        .json({ // 여기 메세지 바꾸기 
                            message:`아직 글이 없어요 혹시 ${category}에 대한 감정이 있으신가요? 글을 통해 다른 분과 소통해보세요`
                        })
            }
            else
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({
                        message:'잘못된 카테고리입니다.'
                    })  
        }
        return res
            .status(HttpStatus.OK)
            .json(boards);
    }

    @Get('/:userId')
    @ApiOperation({ summary : '커뮤니티 글 상세페이지 조회 API' })
    @ApiQuery({
        name: 'keyword',
        required: true,
        description: '검색어별',
        example:'졸려'
    })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '특정 유저',
    })
    async getAllBoardsByNickname(
        @Res() res, 
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
        @Query() query) {
            console.log(query.keyword)
            console.log(userId);
        
    }
        

    @Get('/:boardId') // 커뮤니티 특정 글 조회
    @ApiOperation({ summary : '커뮤니티 글 상세페이지 조회 API' })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호',
    })
    async getBoard(
        @Res() res,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
    ) {
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시글 번호 ${boardId}번에 해당하는 게시글이 없습니다.`
                })
        const boardById = await this.boardsService.getBoardById(boardId);
        return res
            .status(HttpStatus.OK)
            .json(boardById);
    }

    @Post() // 커뮤니티 글 작성
    @ApiOperation({ 
        summary : '커뮤니티 글 작성 API',
        description: '이미지가 포함된 테스트는 postman 을 이용해서 해야 합니다. \
        userId는 원래 type이 number인데 postman 에서 이미지와 함께 테스트 할 때 \
        불가피하게 text로 받아야 해서 string으로 처리했습니다.'
    })
    @ApiBody({ type : CreateBoardFirstDto })
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
        })
    )
    async createBoard(
        @Res() res, 
        @UploadedFiles() files: Express.Multer.File[], 
        @Body() createBoardFirstDto: CreateBoardFirstDto,
    ): Promise<any> {
        const userId = +createBoardFirstDto.userId
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })

        const board = await this.boardsService.createBoard(files, createBoardFirstDto);

        return res
            .status(HttpStatus.CREATED)
            .json({
                data: board,
                message:'게시글을 등록했습니다.'
            });
    }

    @Patch('/:boardId') // 커뮤니티 글 수정
    @ApiOperation({ 
        summary : '커뮤니티 특정 글 수정 API',
        description: '이미지가 포함된 테스트는 postman 을 이용해서 해야 합니다. \
        userId는 원래 type이 number인데 postman 에서 이미지와 함께 테스트 할 때 \
        불가피하게 text로 받아야 해서 string으로 처리했습니다.'
    })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호',
    })
    @ApiBody({ type : CreateBoardFirstDto })
    @UseInterceptors(
        FilesInterceptor('files', 3, {
            storage: multerS3({ 
            s3: s3,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            contentType: multerS3.AUTO_CONTENT_TYPE, 
            acl: 'public-read',
            key: function (request, file, cb) { // files  for문 돌듯이 먼저 실행
                // var params = {
                //     Bucket: process.env.AWS_S3_BUCKET_NAME, 
                //     Key: "objectkey.jpg" //(하나면)
                //     // Objects: [
                //     //     { Key: "어쩌구" },
                //     //     { Key: "저쩌구" }
                //     // ],
                // };
                // s3.deleteObject(params, function(err, data) {
                //     if (err) 
                //        console.log(err, err.stack); // an error occurred
                //     else     
                //        console.log(data);           // successful response
                // });
                
                file.encoding = 'utf-8';
                let S3ImageName = `boardImages/${Date.now().toString()}-${file.originalname}`; // 파일 올리면 해당 파일의 이름을 받아옴 -> S3에 저장되는 이름
                cb(null, S3ImageName);   
            },
        }),
    }))
    async updateBoard(
        @Res() res, 
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number, 
        @Body() updateBoardDto: UpdateBoardDto
    ){ 
        const userId = +updateBoardDto.userId
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
                    message:`게시글 번호 ${boardId}번에 해당하는 게시글이 없습니다.`
                })

        if(board.userId != userId) // 글 작성자와 현재 로그인한 사람이 다른 경우 
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    message:`게시글을 수정할 권한이 없습니다.`
                })  

        const updatedBoard = await this.boardsService.updateBoard(boardId, updateBoardDto);
        return res
            .status(HttpStatus.OK)
            .json({
                data: updatedBoard,
                message:'게시글을 수정했습니다'
            })
    }

    @Delete('/:boardId')
    @ApiOperation({ summary : '커뮤니티 특정 글 삭제 API' })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호',
    })
    @ApiBody({
        description: "글 삭제하는 유저 ID", 
        schema: {
          properties: {
            userId: { 
                type: "number",
            },
          }
        }
    })
    async deleteBoard(
        @Res() res, 
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
        @Body('userId') userId: number,
    ){
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시글 번호 ${boardId}번에 해당하는 게시글이 없습니다.`
                })

        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })

        if(board.userId != userId) // 글 작성자와 현재 로그인한 사람이 다른 경우 
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    message:`게시글을 삭제할 권한이 없습니다.`
                })  

        // 게시글 삭제 될 때 s3에 있는 이미지도 삭제 -> rds image 도 삭제
        this.boardsService.deleteBoard(boardId);
        return res
            .status(HttpStatus.OK)
            .json({
                message:'게시글이 삭제되었습니다'
            })
    }

    @Post('/:boardId/likes')
    @ApiOperation({ 
        summary : '커뮤니티 특정 글 좋아요 API',
        description: '좋아요 처음 누른 경우'
    })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    @ApiBody({
        description: "좋아요 누르는 유저 ID", 
        schema: {
          properties: {
            userId: { 
                type: "number",
            },
          }
        }
    })
    async createLike(
        @Res() res,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
        @Body('userId') userId: number
    ): Promise<any>{
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시글 번호 ${boardId}번에 해당하는 게시글이 없습니다.`
                })

        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })
        
        const like = await this.boardsService.createLike(boardId, user.userId);
        return res
            .status(HttpStatus.CREATED)
            .json({
                data: like,
                message:'좋아요를 눌렀습니다.'
            });
    }

    @Patch('/:boardId/likes')
    @ApiOperation({ 
        summary : '커뮤니티 특정 글 좋아요 상태 수정 API',
        description: '좋아요 누른 후 취소하거나 / 취소했다가 다시 누른 경우'
    })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    @ApiBody({
        description: "좋아요 상태변경한 유저 ID", 
        schema: {
          properties: {
            userId: { 
                type: "number",
            },
          }
        }
    })
    async changeLikeStatus(
        @Res() res,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
        @Body('userId') userId: number
    ){
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시글 번호 ${boardId}번에 해당하는 게시글이 없습니다.`
                })

        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })
        
        await this.boardsService.changeLikeStatus(boardId, user.userId);
        return res
            .status(HttpStatus.OK)
            .json({
                message:'좋아요 상태 변경'
            });
    }

    @Post('/:boardId/bookmarks')
    @ApiOperation({ 
        summary : '커뮤니티 특정 글 북마크 API',
        description: '북마크 처음 누른 경우'
    })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    @ApiBody({
        description: "북마크 누르는 유저 ID", 
        schema: {
          properties: {
            userId: { 
                type: "number",
            },
          }
        }
    })
    async createBookmark(
        @Res() res,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
        @Body('userId') userId: number
    ){
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시글 번호 ${boardId}번에 해당하는 게시글이 없습니다.`
                })

        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })
        
        const bookmark = await this.boardsService.createBookmark(boardId, user.userId);
        return res
            .status(HttpStatus.CREATED)
            .json({
                data: bookmark,
                message:'북마크 완료'
            });
    }

    @Patch('/:boardId/bookmarks')
    @ApiOperation({ 
        summary : '커뮤니티 특정 글 북마크 상태 수정 API',
        description: '북마크 누른 후 취소하거나 / 취소했다가 다시 누른 경우'
    })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호'
    })
    @ApiBody({
        description: "북마크 상태변경한 유저 ID", 
        schema: {
          properties: {
            userId: { 
                type: "number",
            },
          }
        }
    })
    async changeBookmarkStatus(
        @Res() res,
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number,
        @Body('userId') userId: number
    ){
        const board = await this.boardsService.findByBoardId(boardId);
        if(!board)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`게시글 번호 ${boardId}번에 해당하는 게시글이 없습니다.`
                })
        
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })        

        await this.boardsService.changeBookmarkStatus(boardId, user.userId);
        return res
            .status(HttpStatus.OK)
            .json({
                message:'북마크 상태 변경'
            });
    }
}