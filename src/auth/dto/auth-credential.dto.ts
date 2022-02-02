import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
    
    // itzza
    // email, password, nickname, userStatus, breakupDate
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(4,20)   // 비밀번호 몇자이상?
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(1,10)
    // @Matches(/^[a-zA-Z0-9]*$/, {
    //     message: 'password only accepts english and number'
    // })
    nickname: string;


}