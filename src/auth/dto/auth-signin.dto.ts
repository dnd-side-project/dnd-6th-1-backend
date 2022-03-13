import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class AuthSignInDto {
    
    // itzza
    // email, password, nickname, userStatus, breakupDate
    @ApiProperty({
        example: 'test1@naver.com',
        description: 'email',
        required: true,
    })
    @IsEmail(/^(\w+)@(\w+)[.](\w+)$/, { 
        message: '올바른 이메일 형식이 아닙니다' 
    })      
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: "test12345",
        description: '비밀번호',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Za-z0-9\d]{8,20}$/, { 
        message : '올바른 비밀번호 형식이 아닙니다'
    })
    password: string;


}