import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
    
    // itzza
    // email, password, nickname, userStatus, breakupDate
    
    @ApiProperty({
        example: 'test1@naver.con',
        description: 'email',
        required: true,
    })
    @IsString()
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
    // @Matches(/^[a-zA-Z0-9]*$/, {
    //     message: 'password only accepts english and number'
    // })
    nickname: string;


}