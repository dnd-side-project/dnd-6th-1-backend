import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
    /*
    @IsString()
    @IsNotEmpty()
    @Length(1,10)
    user_nickname: string;

    @IsString()
    @Length(4,20)
    //영어랑 숫자만 가능한 유효성 체크, & 오류 메세지
    @Matches(/^[a-zA-Z0-9]*$/, {
        message: 'password only accepts english and number'
    })
    password: string;
    */

    // itzza
    // email, password, nickname, userStatus, breakupDate
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Length(4,20)   // 비밀번호 몇자이상?
    password: string;

    @IsString()
    @Length(1,10)
    @Matches(/^[a-zA-Z0-9]*$/, {
        message: 'password only accepts english and number'
    })
    nickname: string;



}