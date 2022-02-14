import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class AuthSignInDto {
    
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

    

}