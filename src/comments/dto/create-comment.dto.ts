import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateCommentDto {
    // @ApiProperty({ 
    //     example: 1,
    //     description: '작성자 userId', 
    //     required: true
    // })
    // @IsNotEmpty()
    // @IsNumber()
    // readonly userId: number; // 작성자

    @ApiProperty({ 
        example: '첫번째 댓글입니다.',
        description: '댓글 내용', 
        required: true
    })
    @IsNotEmpty()
    readonly commentContent: string;
}