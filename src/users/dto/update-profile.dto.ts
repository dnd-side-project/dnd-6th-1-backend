import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, Length } from "class-validator";

export class UpdateProfileDto {
    @ApiProperty({ 
        example: '닉네임3',
        description: '닉네임',
        required: false,
    })
    @IsNotEmpty()
    @IsString()
    readonly nickname: string;

    @ApiProperty({
        description: '수정할 프로필 이미지',
        type: 'string',
        format: 'binary',
        required: false
    })
    readonly file: Express.Multer.File;
}