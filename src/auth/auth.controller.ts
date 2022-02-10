import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthSignInDto } from './dto/auth-signin.dto';
import { GetUser } from './get-user.decorator';
import { Users } from './users.entity';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessToken } from 'aws-sdk/clients/amplify';



@Controller('auth')
@ApiTags('유저 API')
export class AuthController {
    constructor( 
        private authService: AuthService,
    ){}

    @Post('/signup')
    @ApiOperation({ 
        summary: '회원가입 API', 
        description: '이메일, 비밀번호, 닉네임 입력'
    })
    @ApiBody({ type: AuthCredentialsDto})
    @ApiCreatedResponse({ description: '유저를 생성합니다', type: Users })
    signUp(
        @Res() res,
        @Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto
        ): Promise<void> {
            const user = this.authService.signUp(authcredentialsDto);
            
            return res
                .status(HttpStatus.CREATED)
                .json({
                    data: user,
                    message: '회원가입을 완료했습니다.',
                    flag: 1
                })
    }


    /*
    @Get('/signup/check-nickname')
    @ApiOperation({ summary: '닉네임 중복 조회', description: '닉네임 입력' })
    @ApiCreatedResponse({ description: '닉네임 중복 조회', type: Users })
    ckNickname(@Body(ValidationPipe) userCredentialsDto: UserCredentialsDto): Promise<void> {
        const nickname = userCredentialsDto.nickname;
        return this.authService.ckNickname(nickname);
    }
    */
    

    
    @Post('/signin')
    async signIn(
        @Res() res,
        @Body(ValidationPipe) authsigninDto: AuthSignInDto
        ): Promise<string> {
            
            const accessToken = await this.authService.signIn(authsigninDto);
            if(accessToken){
                console.log(accessToken);
                return res
                        .json({
                            accessToken: accessToken,
                            message: '로그인 성공',
                            flag: 1
                        })
            }
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user: Users) {
        console.log('user', user);
    } 
}
