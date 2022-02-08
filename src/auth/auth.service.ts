import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredentialsDto } from './dto/users-credential.dto';
import * as bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthRepository)
        private authRepository: AuthRepository,
    ) { }

    // itzza
    // 회원가입
    async signUp(userCredentialsDto: UserCredentialsDto) : Promise<void> {

        return this.authRepository.createUser(userCredentialsDto);
    }

    // 로그인 : email, pw 입력
    async signIn(userCredentialsDto: UserCredentialsDto): Promise<string> {
        const {email, password} = userCredentialsDto;
        // user 찾기 : email
        const user = await this.authRepository.findOne({email});

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {
            return 'login success'
        } else {        // 로그인 실패
            throw new UnauthorizedException('login faild')
        }
    }
}
