import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseGuards, ValidationPipe, UploadedFile, UseInterceptors, UploadedFiles, Patch, Inject } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthSignInDto } from './dto/auth-signin.dto';
import { Users } from './users.entity';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
require("dotenv").config();

@Controller('auth')
@ApiTags('유저 API')
export class AuthController {
    constructor( 
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private authService: AuthService
    ){}

    @Post('/signup')
    @ApiOperation({ 
        summary: '회원가입 API', 
        description: '이메일, 비밀번호, 닉네임 입력'
    })
    @ApiBody({ type: AuthCredentialsDto })
    @ApiCreatedResponse({ description: '유저를 생성합니다', type: Users })
    async signUp(
        @Res() res,
        @Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto
    ): Promise<any> {
        try{
            const { nickname } = authcredentialsDto;
            const nicknameUser = await this.authService.findByAuthNickname(nickname);
            if(nicknameUser)
                return res.
                    status(HttpStatus.CONFLICT)
                    .json({
                        success: false,
                        message: '중복된 닉네임이 있습니다.',
                    })

            const newUser = await this.authService.signUp(authcredentialsDto);
            return res
                .status(HttpStatus.CREATED)
                .json(newUser)
        } catch(error){
            this.logger.error('회원가입 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @Get('/signup/:nickname')
    @ApiOperation({ summary: '닉네임 중복 조회', description: '닉네임 입력' })
    async findByNickname(
        @Res() res,
        @Param("nickname") nickname: string,
    ): Promise<string> {
        try{
            const nickName = await this.authService.findByAuthNickname(nickname);
            if(nickName) 
                return res
                    .status(HttpStatus.CONFLICT)
                    .json({
                        success: false,
                        message: "중복된 닉네임이 존재합니다.",
                    })
            
            return res
                .status(HttpStatus.OK)
                .json({
                    success: true,
                    message: "사용 가능한 닉네임입니다.",
                })
        } catch(error){
            this.logger.error('닉네임 중복 조회 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    // @Get('/signin/:email')
    // @ApiOperation({ summary: '비밀번호 찾을 시 이메일 전송' })
    // async sendEmail(
    //     @Res() res,
    //     @Param("email") email: string,
    // ): Promise<string> {
    //     try{
    //         if(nickName) 
    //             return res
    //                 .status(HttpStatus.CONFLICT)
    //                 .json({
    //                     success: false,
    //                     message: "같은 닉네임이 존재합니다.",
    //                 })
            
    //         return res
    //             .status(HttpStatus.OK)
    //             .json({
    //                 success: true,
    //                 message: "사용 가능한 닉네임입니다.",
    //             })
    //     } catch(error){
    //         this.logger.error('닉네임 중복 조회 ERROR'+error);
    //         return res
    //             .status(HttpStatus.INTERNAL_SERVER_ERROR)
    //             .json(error);
    //     }
    // }

    @Post('/signin')
    @ApiOperation({ 
        summary: '로그인 API', 
        description: '이메일, 비밀번호 입력'
    })
    @ApiBody({ type: AuthSignInDto})
    async signIn(
        @Res() res,
        @Body(ValidationPipe) authsigninDto: AuthSignInDto
    ): Promise<string> {
        try{
            const accessToken = await this.authService.signIn(authsigninDto);
            const user = await this.authService.findByAuthEmail(authsigninDto.email);
            if(accessToken)
                return res
                    .status(HttpStatus.OK)
                    .json({
                        accessToken: accessToken,
                        message: '로그인 되었습니다',
                        userId: user.userId,
                        success: true,
                    })
                
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    message: '비밀번호가 일치하지 않습니다.',
                    success: false
                })
        } catch(error){
            this.logger.error('로그인 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }
    }

    @ApiBearerAuth('accessToken')
    @UseGuards(JwtAuthGuard)
    @Patch('/signout')
    @ApiOperation({ 
        summary: '로그아웃 API', 
    })
    async signout(
        @Res() res,
        @GetUser() user
    ): Promise<any> {
        try{
            const { userId } = user;
            await this.authService.signOut(userId);
            return res
                .status(HttpStatus.OK)
                .json({
                    message: '로그아웃이 완료되었습니다',
                })
        } catch(error){
            this.logger.error('로그아웃 ERROR'+error);
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json(error);
        }    
    }

}
