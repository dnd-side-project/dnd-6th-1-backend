import { HttpStatus, ParseIntPipe, Inject, Res, UploadedFiles, UseGuards, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesInterceptor} from '@nestjs/platform-express';
import { Diaries } from './diaries.entity';
import { UploadService } from './upload.service';
import { DiariesService } from './diaries.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { GetUser } from 'src/auth/get-user.decorator';

require("dotenv").config();


@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('diaries')
@ApiTags('다이어리 API')
export class DiariesController {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly diariesService: DiariesService,
        private readonly uploadService: UploadService
    ){}


    // 홈화면 해당 연-월 일기글 조회
    @Get('')  
    @ApiOperation({ 
        summary: '홈화면에서 해당 연-월 일기글 조회 API'
    })
    @ApiQuery({
        name: 'month',
        required: false,
        description: '월 입력',
        example:2,
    })
    @ApiQuery({
        name: 'year',
        required: false,
        description: '연도 입력',
        example:2022,
    })
    async getAllDiaries(@Res() res, @Query() query, @GetUser() loginUser): Promise<Diaries[]> {
        const { year, month } = query; // @Query()'에서 해당 쿼리문을 받아 query에 저장하고 변수 받아옴
        const { userId } = loginUser;

        let diaries;

        diaries = await this.diariesService.getMonthDiaries(userId, year, month);
        return res
            .status(HttpStatus.OK)
            .json(diaries);
    }



    // 특정 일기글 조회
    @Get('/:diaryId')  
    @ApiOperation({ 
        summary: '특정 일기글 조회 API'
    })
    @ApiParam({
        name: 'diaryId',
        required: false,
        description: '일기글 번호',
        example:1,
    })
    async getDiary(
        @Res() res, 
        @Param("diaryId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        diaryId: number,
        @GetUser() loginUser) {
        const { userId } = loginUser;
        const diary = await this.diariesService.findByDiaryId(diaryId);
            
        if(!diary)
            return res
                .status(HttpStatus.NOT_FOUND)
                .json({
                    message:'일기글 번호 ${diaryId}번에 해당하는 일기글이 없습니다.'
                })

        const diaryById = await this.diariesService.getDiaryById(userId, diaryId);
        return res
            .status(HttpStatus.OK)
            .json(diaryById);

    }


    @Post()
    @ApiOperation({ summary : '일기 작성 API' })
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
                    message:'일기를 업로드했습니다'
                })
    }



    @Patch('/:diaryId') // 일기 글 수정
    @ApiOperation({ summary : '특정 일기 수정 API' })
    @ApiParam({
        name: 'diaryId',
        required: true,
        description: '일기글 번호',
    })
    @UseInterceptors(FilesInterceptor('files'))
    @ApiConsumes('multipart/form-data') // swagger에 input file 추가
    @ApiBody({ type : CreateDiaryDto })
    async updateBoard(
        @Res() res, 
        @Param("diaryId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        diaryId: number, 
        @UploadedFiles() files: Express.Multer.File[],
        @Body() updateDiaryDto: UpdateDiaryDto,
        @GetUser() loginUser
    ): Promise<any>{ 
        try{
            const { userId } = loginUser;
            const diary = await this.diariesService.findByDiaryId(diaryId);
            if(!diary)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`일기 번호 ${diaryId}번에 해당하는 일기가 없습니다.`
                    })

            if(diary.userId != userId) // 글 작성자와 현재 로그인한 사람이 다른 경우 
                return res
                    .status(HttpStatus.FORBIDDEN)
                    .json({
                        message:`일기를 수정할 권한이 없습니다.`
                    })  
            
            if(files.length!=0) // 파일이 있는 경우만 파일 수정 업로드 진행
                await this.uploadService.updateFiles(files, diary.diaryId); // s3에 이미지 업로드 후 boardImage 에 업로드
            const updateDiary = await this.diariesService.updateDiary(diaryId, updateDiaryDto);

            return res
                .status(HttpStatus.OK)
                .json({
                    data: updateDiary,
                    message:'일기를 수정했습니다'
                })
        } catch(error){
            this.logger.error('일기 수정 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);            
        }    
    }



    @Delete('/:diaryId')
    @ApiOperation({ summary : '일기 삭제 API' })
    @ApiParam({
        name: 'diaryId',
        required: true,
        description: '일기글 번호',
    })
    async deleteDiary(
        @Res() res, 
        @Param("diaryId", new ParseIntPipe({
            errorHttpStatusCode: HttpStatus.BAD_REQUEST
        }))
        diaryId: number,
        @GetUser() loginUser
    ){
        try{
            const { userId } = loginUser;
            const diary = await this.diariesService.findByDiaryId(diaryId);
            if(!diary)
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({
                        message:`일기 번호 ${diaryId}번에 해당하는 일기가 없습니다.`
                    })

            if(diary.userId != userId) // 글 작성자와 현재 로그인한 사람이 다른 경우 
            return res
                .status(HttpStatus.FORBIDDEN)
                .json({
                    message:`일기를 삭제할 권한이 없습니다.`
                })

            // 일기글 삭제 될 때 s3에 있는 이미지도 삭제 -> rds image 도 삭제
            const diaryImages = await this.uploadService.findByDiaryImageId(diaryId);

            await this.uploadService.deleteFiles(diaryId);
            await this.diariesService.deleteDiary(diaryId);

            return res
                .status(HttpStatus.OK)
                .json({
                    message:'일기글이 삭제되었습니다'
                })
        } catch(error){
            this.logger.error('일기 글 삭제 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);            
        }   
    }


}
