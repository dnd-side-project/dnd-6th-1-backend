import { HttpStatus, ParseIntPipe, Res, UploadedFiles } from '@nestjs/common';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor} from '@nestjs/platform-express';
import { Boards } from './entity/boards.entity';
import { BoardsService } from './boards.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UsersService } from 'src/users/users.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UploadService } from './upload.service';
require("dotenv").config();

@Controller('boards')
@ApiTags('커뮤니티 글 API')
export class BoardsController {
    constructor(
        private readonly boardsService: BoardsService, 
        private readonly usersService : UsersService,
        private readonly uploadService: UploadService
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
    @ApiOperation({ summary : '커뮤니티 글 작성 API' })
    @UseInterceptors(FilesInterceptor('files'))
    @ApiConsumes('multipart/form-data') // swagger에 input file 추가
    @ApiBody({ type : CreateBoardDto })
    async createBoard(
        @Res() res,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createBoardDto: CreateBoardDto
    ): Promise<any> {
        const userId = +createBoardDto.userId
        const user = await this.usersService.findByUserId(userId);
        if(!user)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                })

        const board = await this.boardsService.createBoard(createBoardDto); // 내용만 board에 업로드
        if(files.length!=0) // 파일이 있는 경우만 업로드 진행
            await this.uploadService.uploadFile(files, board.boardId); // s3에 이미지 업로드 후 boardImage 에 업로드 (boardId 받아서 해야돼서 뒤에 위치)
        const createdboard = await this.boardsService.findByBoardId(board.boardId);

        return res
            .status(HttpStatus.CREATED)
            .json({
                data: createdboard,
                message:'게시글을 업로드했습니다'
            })
    }

    @Patch('/:boardId') // 커뮤니티 글 수정
    @ApiOperation({ summary : '커뮤니티 특정 글 수정 API' })
    @ApiParam({
        name: 'boardId',
        required: true,
        description: '게시글 번호',
    })
    @UseInterceptors(FilesInterceptor('files'))
    @ApiConsumes('multipart/form-data') // swagger에 input file 추가
    @ApiBody({ type : CreateBoardDto })
    //기존의 boardImage에 boardId 에 해당하는 이미지명을 s3에서 찾아서 삭제하고 
    //flag=0으로 바꿔주고 이미지 재업로드 후 디비에 저장
    async updateBoard(
        @Res() res, 
        @Param("boardId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        boardId: number, 
        @UploadedFiles() files: Express.Multer.File[],
        @Body() updateBoardDto: UpdateBoardDto
    ): Promise<any>{ 
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
        
        if(files.length!=0) // 파일이 있는 경우만 파일 수정 업로드 진행
            await this.uploadService.updateFile(files, board.boardId); // s3에 이미지 업로드 후 boardImage 에 업로드
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
        await this.uploadService.deleteFile(boardId); 
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