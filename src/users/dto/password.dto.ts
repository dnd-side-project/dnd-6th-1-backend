import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class PasswordDto {
    @ApiProperty({ 
        example: 'test123456',
        description: '새로운 비밀번호',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-z0-9\d]{8,20}$/)
    readonly password: string;
}