import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) { }

    /*
    // 회원가입
    async signUp(authCredentialsDto: AuthCredentialsDto) : Promise<void> {
        return this.userRepository.createUser(authCredentialsDto);
    }

    // 로그인
    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const {username, password} = authCredentialsDto;
        // username 찾기
        const user = await this.userRepository.findOne({username});

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {
            return 'login success'
        } else {        // 로그인 실패
            throw new UnauthorizedException('login faild')
        }
    }
    */

    // itzza
    // 회원가입
    async signUp(authCredentialsDto: AuthCredentialsDto) : Promise<void> {
        return this.userRepository.createUser(authCredentialsDto);
    }

    // 로그인
    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const {email, password} = authCredentialsDto;
        // user 찾기 : email
        const user = await this.userRepository.findOne({email});

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {
            return 'login success'
        } else {        // 로그인 실패
            throw new UnauthorizedException('login faild')
        }
    }
}
