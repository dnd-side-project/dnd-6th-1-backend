import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './users.service';
import { UserCredentialsDto } from './dto/users-credential.dto';
import { GetUser } from './get-user.decorator';
import { Users } from './users.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';



@Controller('users')
@ApiTags('유저 API')
export class UserController {
    constructor( private userService: UserService){}

    @Post('/signup')
    @ApiOperation({ summary: '회원가입 API', description: '이메일, 비밀번호, 닉네임 입력' })
    @ApiCreatedResponse({ description: '유저를 생성합니다', type: Users })
    signUp(@Body(ValidationPipe) usercredentialsDto: UserCredentialsDto): Promise<void> {
        return this.userService.signUp(usercredentialsDto);
    }

    @Post('/signin')
    signIn(@Body() userCredentialsDto: UserCredentialsDto) {
        return this.userService.signIn(userCredentialsDto)
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user: Users) {
        console.log('user', user);
    } 
}
