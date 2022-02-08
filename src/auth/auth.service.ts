import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthRepository)
            private authRepository: AuthRepository,
        @InjectRepository(JwtService)
            private jwtService: JwtService
    ) { }

    // itzza
    // 회원가입
    async signUp(authCredentialsDto: AuthCredentialsDto) : Promise<void> {

        return this.authRepository.createUser(authCredentialsDto);
    }

    // 로그인 : email, pw 입력
    // 로그인
    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string}> {
        const {email, password} = authCredentialsDto;
        // username 찾기
        const user = await this.authRepository.findOne({email});

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {
            // 유저 토큰 생성 (Secret + Payload) -> payload에 중요한 정보는 넣으면 안됨
            const payload = { email };
            const accessToken = await this.jwtService.sign(payload);

            return { accessToken };
        } else {        // 로그인 실패
            throw new UnauthorizedException('login faild')
        }
    }
}
