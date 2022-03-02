import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, ParseIntPipe, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { UploadService } from 'src/boards/upload.service';
import { PasswordDto } from './dto/password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly uploadService: UploadService
    ){}

    @ApiTags('마이페이지 API')
    @Get('/:userId') 
    @ApiOperation({ 
        summary : '마이페이지 메인 화면 조회 API',
    })
    @ApiParam({
        name: 'userId',
        required: true, 
        description: '유저 ID'
    })
    async getMyPage(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST // 파라미터 변수값이 맞지 않은 상태
        }))
        userId: number,
    ){
        try{
            const user = await this.usersService.findByUserId(userId);
            if(!user)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                    })  
            const myPage =await this.usersService.getMyPage(userId);
            return res
                .status(HttpStatus.OK)
                .json(myPage);
        } catch(error){
            this.logger.error('마이페이지 메인 화면 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('최근 검색어 API')
    @Get('/:userId/histories')   // 최근 검색어 기록 조회 (커뮤니티에서 검색 버튼을 누른 경우)
    @ApiOperation({ 
        summary : '특정 유저의 최근 검색어 조회 API',
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
        try{
            const user = await this.usersService.findByUserId(userId);
            if(!user)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                    })  
            const histories = await this.usersService.getAllHistories(userId);
            console.log(histories);

            return res
                .status(HttpStatus.OK)
                .json(histories);
        } catch(error){
            this.logger.error('특정 유저의 최근 검색어 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('마이페이지 API')
    @Patch('/:userId/password') // 비밀번호 재설정
    @ApiOperation({ summary: '비밀번호 재설정 API' })
    @ApiParam({
        name: 'userId',
        required: true, 
        description: '유저 ID'
    })
    @ApiBody({ type : PasswordDto })
    async updatePassword(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
        @Body() passwordDto: PasswordDto
    ) {
        try{
            await this.usersService.updatePassword(userId, passwordDto);
            return res
                .status(HttpStatus.OK)
                .json({
                    success: true,
                    message: '비밀번호가 재설정되었습니다'
                })
        } catch(error){
            this.logger.error('비밀번호 재설정 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('마이페이지 API')
    @Patch('/:userId/profile') //프로필 이미지 및 닉네임 변경한 것 저장
    @ApiOperation({ summary : '마이페이지 개인정보 수정 API' })
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type : UpdateProfileDto })
    async updateProfile(
        @Res() res, 
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number, 
        @UploadedFile() file: Express.Multer.File,
        @Body() updateProfileDto: UpdateProfileDto
    ): Promise<any>{     
        try{
            if(file) // 파일이 있는 경우만 파일 수정 업로드 진행
                await this.uploadService.uploadFile(file, userId); 
            
            // 수정할 때는 닉네임 중복처리가 이미 된 상태에서 진행해야 함
            const nickName = await this.authService.findByAuthNickname(updateProfileDto.nickname);
            if(nickName) 
                return res
                    .status(HttpStatus.CONFLICT)
                    .json({
                        success: false,
                        message: "같은 닉네임이 존재합니다.",
                    })

            // 닉네임과 파일을 같이 함께 넘긴다. 
            await this.usersService.updateProfile(userId, updateProfileDto);

            return res
                .status(HttpStatus.OK)
                .json({
                    message:'프로필을 수정했습니다'
                })
        } catch(error){
            this.logger.error('마이페이지 개인정보 수정 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('마이페이지 API')
    @Delete('/:userId')
    @ApiOperation({ summary : '회원 탈퇴 API' })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '유저 ID',
    })
    async deleteUser(
        @Res() res, 
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
    ){       
        try{ 
            await this.usersService.deleteUser(userId);
            return res
                .status(HttpStatus.OK)
                .json({
                    message:'회원탈퇴가 완료되었습니다'
                })
        } catch(error){
            this.logger.error('회원 탈퇴 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('최근 검색어 API')
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
        try{
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
                    .status(HttpStatus.FORBIDDEN) // 서버 자체 또는 서버에 있는 파일에 접근할 권한이 없을 경우
                    .json({
                        message:`검색기록 번호 ${historyId}번을 삭제할 권한이 없습니다.`
                    })   

            await this.usersService.deleteHistory(userId, historyId);

            return res
                .status(HttpStatus.OK)
                .json({
                    message: '검색어가 삭제 되었습니다.'
                });
        } catch(error){
            this.logger.error('검색어 기록 개별 삭제 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('최근 검색어 API')
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
        try{
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
                    .status(HttpStatus.OK)
                    .json({
                        message:`삭제할 검색기록이 없습니다.`
                    })  

            await this.usersService.deleteHistories(userId);

            return res
                .status(HttpStatus.OK)
                .json({
                    message: '검색어가 전체삭제 되었습니다.'
                });
        } catch(error){
            this.logger.error('검색어 기록 전체 삭제 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('마이페이지 API')
    @Get('/:userId/boards')
    @ApiOperation({ 
        summary : '특정 유저가 작성한 글 조회 API',
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
        try{
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
        } catch(error){
            this.logger.error('특정 유저가 쓴 글 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('마이페이지 API')
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
        try{
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
        } catch(error){
            this.logger.error('특정 유저가 댓글을 단 글 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('마이페이지 API')
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
        try{
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
        } catch(error){
            this.logger.error('특정 유저가 북마크한 글 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('마이페이지 API')
    @Get('/:userId/all')
    @ApiOperation({ 
        summary : '특정 유저가 작성한 글/댓글단 글/북마크한 글 조회 API',
    })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '유저 ID'
    })
    async getAllBoardsByAll(
        @Res() res,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number,
    ){
        try{
            const user = await this.usersService.findByUserId(userId);
            if(!user)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`유저 번호 ${userId}번에 해당하는 유저가 없습니다.`
                    })  
            const boards = await this.usersService.getAllBoardsByAll(user.userId);
            return res
                .status(HttpStatus.OK)
                .json(boards);
        } catch(error){
            this.logger.error('특정 유저 마이페이지 통합 글 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiTags('주간레포트 API')
    @Get('/:userId/reports')
    @ApiOperation({ summary: '주간 레포트 조회 API' })
    @ApiQuery({
        name: 'week',
        required: true, 
        description: '주'
    })
    @ApiQuery({
        name: 'month',
        required: true, 
        description: '월'
    })
    @ApiQuery({
        name: 'year',
        required: true, 
        description: '연도'
    })
    @ApiParam({
        name: 'userId',
        required: true,
        description: '유저 ID'
    })
    async getWeeklyReport(
        @Res() res,
        @Query() query,
        @Param("userId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        userId: number
    ) {
        try{
            const { year, month, week } = query;
            const report = await this.usersService.getWeeklyReport(year, month, week, userId);
            return res
                .status(HttpStatus.OK)
                .json(report);

        } catch(error){
            this.logger.error('주간레포트 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    // 1. 닉네임 중복확인
    @ApiTags('마이페이지 API')
    @Get('/:userId/:nickname')
    @ApiOperation({ summary: '닉네임 중복 조회 API', description: '닉네임 입력' })
    @ApiParam({
        name: 'userId',
        required: true, 
        description: '유저 ID'
    })
    @ApiParam({
        name: 'nickname',
        required: true, 
        description: '변경할 닉네임'
    })
    async checkNickname(
        @Res() res,
        @Param("nickname") nickname: string,
    ): Promise<string> {
        try{
            const nickName = await this.authService.findByAuthNickname(nickname);
            if(nickName) 
                return res
                    .status(HttpStatus.CONFLICT)
                    .json({
                        success: false,
                        message: "같은 닉네임이 존재합니다.",
                    })
            
            return res
                .status(HttpStatus.OK)
                .json({
                    success: true,
                    message: "사용 가능한 닉네임입니다.",
                })
        } catch(error){
            this.logger.error('닉네임 중복 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }
}
