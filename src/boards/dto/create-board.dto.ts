import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBoardDto {

    @ApiProperty({ description: '카테고리명' })
    @IsNotEmpty()
    @IsString()
    categoryName: string;

    @ApiProperty({ description: '글 제목' })
    @IsNotEmpty()
    postTitle: string;

    @ApiProperty({ description: '글 본문' })
    @IsNotEmpty()
    postContent: string;
}