import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthSignInDto } from './dto/auth-signin.dto';
import generator from 'generate-password';
import { Users } from '../users/users.entity';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthRepository)
        private authRepository: AuthRepository,
        private jwtService : JwtService,
        private readonly mailerService: MailerService,
    ) { }


    async findByAuthEmail(email: string) {
        return await this.authRepository.findByAuthEmail(email);
    } 

    // 회원가입
    async signUp(authCredentialsDto: AuthCredentialsDto) : Promise<any> {        
        return await this.authRepository.createUser(authCredentialsDto);      // User DB에 저장
    }   

    // 닉네임 중복 조회
    async findByAuthNickname(nickname: string) {
        const user = await this.authRepository.findByAuthNickname(nickname);
        return user;
    }

    // 로그인 : email, pw 입력
    // 로그인
    async signIn(authsigninDto: AuthSignInDto): Promise<string> {
        const {email, password} = authsigninDto;
        // username 찾기
        const user = await this.authRepository.findByAuthEmail(email);

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {
            // 유저 토큰 생성 (Secret + Payload) -> payload에 중요한 정보는 넣으면 안됨
            const payload = { userId: user.userId, email };
            const accessToken = await this.jwtService.sign(payload);
            // 로그인 상태 업데이트
            await this.authRepository.signIn(user.userId, accessToken);            
            return accessToken;
            // JWT에 들어갈 payload에 User id와 account를 넣고 JWT를 생성하여 반환
        }
    }
    
    async signOut(userId: number){
        return await this.authRepository.signOut(userId);
    }


    // 비밀번호 재설정 & 이메일 전송
    async sendEmail(user: Users): Promise<string> {
        // 랜덤 임시 비밀번호 생성
        var generator = require('generate-password');
        const password = generator.generate({ length: 10, numbers: true });
        // 비밀번호 암호화 (회원가입-로그인 비밀번호 암호화 로직과 동일)
        const salt = await bcrypt.genSalt();         // salt 생성 - 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(password);
        
        const originUser = await this.authRepository.findOne(user.userId);
        // 임시 비밀번호 저장
        await this.authRepository.sendEmail(originUser, hashedPassword);
        try {
            await this.mailerService.sendMail({
              to: user.email, // list of receivers
              from: 'ITZZAteam', // sender address
              subject: '[ITZZA] 임시 비밀번호 발급', // Subject line
              html: "<h1 >ITZZA에서 임시 비밀번호를 알려드립니다.</h1> <h2> 비밀번호 : " + password + "</h2>" +'<h3 style="color: crimson;">임시 비밀번호로 로그인 하신 후, 반드시 비밀번호를 수정해 주세요.</h3>'
            });
            return password;
          } catch (err) {
            console.log(err);
        }
    }

}
