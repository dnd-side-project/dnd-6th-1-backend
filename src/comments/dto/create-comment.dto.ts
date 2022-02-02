import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateCommentDto {
    
    @ApiProperty({ 
        example: '첫번째 댓글입니다.',
        description: '댓글 내용', 
        required: true
    })
    @IsNotEmpty()
    readonly commentContent: string;
}