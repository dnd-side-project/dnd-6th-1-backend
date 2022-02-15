import { ApiProperty, ApiResponse } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

// 회원가입 
export class AuthCredentialsDto {
    
    // itzza
    // email, password, nickname, userStatus, breakupDate
    
    @ApiProperty({
        example: 'test1@naver.com',
        description: 'email',
        required: true,
    })
    @IsEmail(/^(\w+)@(\w+)[.](\w+)$/, { 
        message: '올바른 이메일 형식이 아닙니다' 
    })      // 이메일 유효성 검사
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'test12345',
        description: '비밀번호',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Za-z0-9\d]{8,20}$/, { 
        message : '올바른 비밀번호 형식이 아닙니다'
    })
    password: string;

    @ApiProperty({
        example: '테스트1',
        description: '닉네임',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Length(1,10)
    @Matches(/^\S[가-힣a-zA-Z0-9-\s]*$/, {
        message: '닉네임은 1-10사이의 한글,영어,숫자만 입력 가능합니다.'
    })
    nickname: string;

}