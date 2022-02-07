import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class UserCredentialsDto {
    
    // itzza
    // email, password, nickname, userStatus, breakupDate
    
    @ApiProperty({
        example: 'test1@naver.con',
        description: 'email',
        required: true,
    })
    @IsEmail()      // 이메일 유효성 검사
    @IsNotEmpty()
    email: string;


    @ApiProperty({
        example: '12345',
        description: '비밀번호',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @Length(4,20)   // 비밀번호 몇자이상?
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