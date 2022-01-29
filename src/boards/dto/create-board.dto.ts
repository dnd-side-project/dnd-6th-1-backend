import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBoardDto {

    @ApiProperty({ 
        example: '털어놓자',
        description: '카테고리명', 
        required: true
    })
    @IsNotEmpty()
    @IsString()
    categoryName: string;

    @ApiProperty({ 
        example: '헤어질까요 말까요',
        description: '글 제목', 
        required: true
    })
    @IsNotEmpty()
    postTitle: string;

    @ApiProperty({ 
        example: '헤어질까요 말까요 본문',
        description: '글 본문', 
        required: true
    })
    @IsNotEmpty()
    postContent: string;
}