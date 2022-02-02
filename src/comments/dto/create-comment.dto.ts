import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateBoardDto {
    @ApiProperty({ 
        example: '헤어질까요 말까요',
        description: '글 제목', 
        required: true
    })
    @IsNotEmpty()
    @Length(2,20, { message : '2글자 이상 20자 미만으로 입력해주세요.'}) // 영어로하나 한글로하나 똑같더라고요
    readonly postTitle: string;

    @ApiProperty({ 
        example: '헤어질까요 말까요 본문',
        description: '글 본문', 
        required: true
    })
    @IsNotEmpty()
    readonly postContent: string;
}