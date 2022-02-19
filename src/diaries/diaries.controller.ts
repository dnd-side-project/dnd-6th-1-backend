import { HttpStatus, Inject, Res, UploadedFiles, UseGuards, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesInterceptor} from '@nestjs/platform-express';
import { Diaries } from './diaries.entity';
import { UploadService } from './upload.service';
import { DiariesService } from './diaries.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { GetUser } from 'src/auth/get-user.decorator';

require("dotenv").config();



@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('diaries')
@ApiTags('일기 글 API')
export class DiariesController {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly diariesService: DiariesService,
        private readonly uploadService: UploadService
    ){}


    /*
    // 홈화면 해당 월 일기글 조회
    @Get('')  
    @ApiOperation({ 
        summary: '홈화면에서 해당 월 일기글 조회 API'
    })
    getAllTask(): Promise<Diaries[]> {
        return this.diariesService.getAllDiaries();
    }
    */



    // 홈화면 해당 월 일기글 조회
    @Get('')  
    @ApiOperation({ 
        summary: '홈화면에서 해당 월 일기글 조회 API'
    })
    @ApiQuery({
        name: 'month',
        required: false,
        description: '해당 월',
        example:1,
    })
    async getAllDiaries(@Res() res, @Query() query, @GetUser() loginUser): Promise<Diaries[]> {
        const { month } = query; // @Query()'에서 해당 쿼리문을 받아 query에 저장하고 변수 받아옴
        const { userId } = loginUser;

        let diaries;

        diaries = await this.diariesService.getMonthDiaries(userId, month);
        return res
            .status(HttpStatus.OK)
            .json(diaries);
    }


    @Post()
    @ApiOperation({ summary : '다이어리 글 작성 API' })
    @UseInterceptors(FilesInterceptor('files'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type : CreateDiaryDto })
    async createDiary(
        @Res() res,
        @UploadedFiles() files: Express.Multer.File[],
        @GetUser() loginUser,
        @Body() createDiaryDto: CreateDiaryDto
        ): Promise<any> {
            const { userId } = loginUser;
            const { date } = createDiaryDto;
            const diaryDate = await this.diariesService.findByDiaryDate(date);

            // 날짜에 다이어리 글이 작성되어 있는지 확인
            if(diaryDate) 
                return res.
                    status(HttpStatus.BAD_REQUEST)
                    .json({
                        message: '해당 날짜에 게시물이 존재합니다.',
                    })

            // 다이어리글 작성
            const diary = await this.diariesService.createDiary(userId, createDiaryDto); 
            if(files.length!=0) // 파일이 있는 경우
                await this.uploadService.uploadFiles(files, diary.diaryId); 
            
            // 작성한 다이어리 정보 return
            const createDiary = await this.diariesService.findByDiaryId(diary.diaryId);
            return res
                .status(HttpStatus.CREATED)
                .json({
                    data: createDiary,
                    message:'게시글을 업로드했습니다'
                })
    }


}