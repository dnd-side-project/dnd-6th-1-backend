import { ExpressAdapter } from "@nestjs/platform-express";
import { ApiBody, ApiProperty, PickType } from "@nestjs/swagger";
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class CreateDiaryDto {

    @ApiProperty({ 
        example: '2022-02-02',
        description: '다이어리 날짜 (글 쓴 날짜X)',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    readonly date: string;


    @ApiProperty({ 
        example: 1,
        description: '카테고리 번호 _ 1:화남/2:편안함/3:혼란/4:서글픔/5:외로움',
        required: true
    })
    @IsIn(["1","2","3","4","5"])
    @IsNotEmpty()
    @IsString()
    readonly categoryId: string;


    @ApiProperty({ 
        example: '지가먼데 날 차',
        description: '감정 선택 이유', 
        required: true
    })
    @IsNotEmpty()
    @Length(2,20, { message : '2글자 이상 20자 미만으로 입력해주세요.'}) // 영어로하나 한글로하나 똑같더라고요
    readonly categoryReason: string;



    @ApiProperty({ 
        example: '오늘 헤어졌다',
        description: '일기글 제목', 
        required: true
    })
    @IsNotEmpty()
    @Length(2,20, { message : '2글자 이상 20자 미만으로 입력해주세요.'}) // 영어로하나 한글로하나 똑같더라고요
    readonly diaryTitle: string;


    @ApiProperty({ 
        example: '걔랑 헤어졌는데 어쩌고저쩌고',
        description: '글 본문', 
        required: true
    })
    @IsNotEmpty()
    readonly diaryContent: string;


    @ApiProperty({
        description: '업로드 할 이미지',
        type: 'array',
        items: {
            type: 'string',
            format: 'binary'
        },
        maxItems:3,             // 업로드할 이미지 수
        required: false
    })
    readonly files: Express.Multer.File[];
}