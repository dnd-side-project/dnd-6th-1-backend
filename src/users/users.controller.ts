import { Body, Controller, Post, Req, Get, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UserCredentialsDto } from './dto/users-credential.dto';
import { GetUser } from './get-user.decorator';
import { Users } from './users.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';



@Controller('users')
@ApiTags('유저 API')
export class UserController {
    constructor( private usersService: UsersService){}

    @Post('/signup')
    @ApiOperation({ summary: '회원가입 API', description: '이메일, 비밀번호, 닉네임 입력' })
    @ApiCreatedResponse({ description: '유저를 생성합니다', type: Users })
    signUp(@Body(ValidationPipe) usercredentialsDto: UserCredentialsDto): Promise<void> {
        return this.usersService.signUp(usercredentialsDto);
    }

    @Get('/signup/check-nickname')
    @ApiOperation({ summary: '닉네임 중복 조회', description: '닉네임 입력' })
    @ApiCreatedResponse({ description: '닉네임 중복 조회', type: Users })
    ckNickname(@Body(ValidationPipe) userCredentialsDto: UserCredentialsDto): Promise<void> {
        const nickname = userCredentialsDto.nickname;
        return this.usersService.ckNickname(nickname);
    }

    
    @Post('/signin')
    signIn(@Body(ValidationPipe) userCredentialsDto: UserCredentialsDto): Promise<{accessToken:string}>{
        return this.usersService.signIn(userCredentialsDto);
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user: Users) {
        console.log('user', user);
    } 
}
