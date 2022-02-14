import { Body, ConflictException, Controller, Get, Query, HttpStatus, Param, ParseIntPipe, Post, Req, Res, UseGuards, UsePipes, ValidationPipe, UploadedFile, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthSignInDto } from './dto/auth-signin.dto';
import { GetUser } from './get-user.decorator';
import { Users } from './users.entity';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AccessToken } from 'aws-sdk/clients/amplify';
import { userInfo } from 'os';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
require("dotenv").config();




const s3 = new AWS.S3();
let check = false

@Controller('auth')
@ApiTags('유저 API')
export class AuthController {
    constructor( 
        private authService: AuthService
    ){}

    

    @Post('/signup')
    @ApiOperation({ 
        summary: '회원가입 API', 
        description: '이메일, 비밀번호, 닉네임 입력'
    })
    @ApiBody({ type: AuthCredentialsDto})
    @ApiCreatedResponse({ description: '유저를 생성합니다', type: Users })
    @UseInterceptors(FilesInterceptor('file', 3, {
        storage: multerS3({
          s3: s3,
          bucket: process.env.AWS_S3_BUCKET_NAME,
          acl: 'public-read',
          key: function(req, file, cb) {
            cb(null, file.originalname)
          }
        })
      }))
    async signUp(
        @Res() res,
        @UploadedFiles() file: Express.Multer.File,
        @Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto
        ): Promise<any> {
            // const user = this.authService.signUp(file, authcredentialsDto);
            const user = this.authService.signUp(authcredentialsDto);
            // 중복조회 통과
            if (check === true){
                if(user) {
                    return res
                        .status(HttpStatus.CREATED)
                        .json({
                            data: user,
                            message: '회원가입을 완료했습니다.',
                            flag: 1
                        })
                } else {
                    return res
                        .json({
                            message: '회원가입 실패',
                            flag: 0
                    })
                }
            } else {
                return res
                        .json({
                            message: '중복된 닉네임이 있습니다.',
                            flag: 0
                        })
            }
            
    }



    @Get('/signup')
    @ApiOperation({ summary: '닉네임 중복 조회', description: '닉네임 입력' })
    @ApiCreatedResponse({ description: '닉네임 중복 조회', type: Users })
    async findByNickname(
            @Res() res,
            @Query() query
            ): Promise<string> {
                const { nickname } = query; // @Query()'에서 해당 쿼리문을 받아 query에 저장하고 변수 받아옴
                //const nickname = authcredentialsDto.nickname
                const user = await this.authService.findByAuthNickname(nickname);
                if(user) {
                    return res.json({
                        message: "중복된 닉네임이 있습니다.",
                        flag: 0
                    })
                } else {
                    check = true
                }
                
    }

    

    
    @Post('/signin')
    @ApiOperation({ 
        summary: '로그인 API', 
        description: '이메일, 비밀번호 입력'
    })
    @ApiBody({ type: AuthSignInDto})
    @ApiCreatedResponse({ description: '로그인을 수행합니다. token 값이 유효한 시간은 1시간으로 해두었는데, 말씀해주시면 수정이 가능합니다. \
    로그인 유지시키는 (자동로그인)은 좀 더 개발해야 합니다.' })
    async signIn(
        @Res() res,
        @Body(ValidationPipe) authsigninDto: AuthSignInDto
        ): Promise<string> {
            // async - await은 값을 가져올때 유용함.
            const accessToken = await this.authService.signIn(authsigninDto);
            if(accessToken){
                return res
                        .json({
                            accessToken: accessToken,
                            message: '로그인 성공',
                            flag: 1
                        })
            } else {
                const userEmail = authsigninDto.email;
                console.log(userEmail);
                const email = await this.authService.findByAuthEmail(userEmail);
                console.log(email);
                if(!email) {
                    return res
                    .json({
                        message: '유효한 이메일이 없습니다.',
                        flag: 0
                    })
                } else {
                    return res
                    .json({
                        message: '비밀번호가 일치하지 않습니다.',
                        flag: 0
                    })
                }
            }   
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    test(@GetUser() user: Users) {
        console.log('user', user);
    } 
}
