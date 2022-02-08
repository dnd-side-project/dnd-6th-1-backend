import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { GetUser } from './get-user.decorator';
import { Users } from './users.entity';
import { ApiTags, ApiOperation, ApiCreatedResponse, } from '@nestjs/swagger';
import { AuthService } from './auth.service';



@Controller('auth')
@ApiTags('유저 API')
export class AuthController {
    constructor( 
        private authService: AuthService,
    ){}

    @Post('/signup')
    @ApiOperation({ summary: '회원가입 API', description: '이메일, 비밀번호, 닉네임 입력' })
    @ApiCreatedResponse({ description: '유저를 생성합니다', type: Users })
    signUp(@Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(authcredentialsDto);
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
    signIn(@Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto) {
        return this.authService.signIn(authcredentialsDto)
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user: Users) {
        console.log('user', user);
    } 
}
