import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
    
    // itzza
    // email, password, nickname, userStatus, breakupDate
    
    @ApiProperty({
        example: 'test1@naver.com',
        description: 'email',
        required: true,
    })
    @IsEmail()      // 이메일 유효성 검사
    @IsNotEmpty()
    @Matches(/^(\w+)@(\w+)[.](\w+)$/ig)
    email: string;


    @ApiProperty({
        example: '12345',
        description: '비밀번호',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Length(8)   // 숫자+영어 8자리 이상
    // 최소 8자 및 최대 16자, 하나 이상의 대문자, 하나의 소문자, 하나의 숫자 및 하나의 특수 문자
    @Matches(/^[A-Za-z\d]{8,16}$/)
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