import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthSignInDto } from './dto/auth-signin.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthRepository)
        private authRepository: AuthRepository,
        private jwtService : JwtService,
    ) { }


    async findByAuthEmail(email: string) {
        return this.authRepository.findByAuthEmail(email);
    } 

    // 회원가입
    async signUp(authCredentialsDto: AuthCredentialsDto) : Promise<any> {
        // const user = await this.authRepository.createUser(authCredentialsDto);
        
        return await this.authRepository.createUser(authCredentialsDto);      // User DB에 저장
    }   


    // 닉네임 중복 조회
    async findByAuthNickname(nickname: string) {
        const user = this.authRepository.findByAuthNickname(nickname);
        return user;
    }

    // 로그인 : email, pw 입력
    // 로그인
    async signIn(authsigninDto: AuthSignInDto): Promise<string> {
        const {email, password} = authsigninDto;
        // username 찾기
        const user = await this.authRepository.findOne({email});

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {
            // 로그인 상태 업데이트
            //await this.authRepository.signIn(userId, authsigninDto);
            // 유저 토큰 생성 (Secret + Payload) -> payload에 중요한 정보는 넣으면 안됨
            const payload = { userId: user.userId, email };
            const accessToken = await this.jwtService.sign(payload);
            return accessToken;
            // JWT에 들어갈 payload에 User id와 account를 넣고 JWT를 생성하여 반환
        } else {
            throw new UnauthorizedException('login faild');
        }
    }
}
