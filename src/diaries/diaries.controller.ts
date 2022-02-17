import { UsePipes, ValidationPipe, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { HttpStatus, Inject, ParseIntPipe, Res, UploadedFiles, UseGuards } from '@nestjs/common';
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



    // 일기 홈화면 전체 조회
    @Get()  
    @ApiOperation({ 
        summary: '일기 홈화면에서 전체 글 조회 API'
    })
    getAllTask(): Promise<Diaries[]> {
        return this.diariesService.getAllDiaries();
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

            // 다이어리글 작성
            const diary = await this.diariesService.createDiary(userId, createDiaryDto); 
            if(files.length!=0) // 파일이 있는 경우
                await this.uploadService.uploadFiles(files, diary.diaryId); 
            
            // 작성한 다이어리
            const createDiary = await this.diariesService.findByDiaryId(diary.diaryId);
            
            return res
                .status(HttpStatus.CREATED)
                .json({
                    data: createDiary,
                    message:'게시글을 업로드했습니다'
                })
    }


}
