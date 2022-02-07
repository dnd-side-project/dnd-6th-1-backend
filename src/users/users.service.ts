import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredentialsDto } from './dto/users-credential.dto';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) { }

    
    // itzza
    // 회원가입
    async signUp(userCredentialsDto: UserCredentialsDto) : Promise<void> {

        return this.userRepository.createUser(userCredentialsDto);
    }

    // 로그인 : email, pw 입력
    async signIn(userCredentialsDto: UserCredentialsDto): Promise<string> {
        const {email, password} = userCredentialsDto;
        // user 찾기 : email
        const user = await this.userRepository.findOne({email});

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {
            return 'login success'
        } else {        // 로그인 실패
            throw new UnauthorizedException('login faild')
        }
    }

    async findByUserId(userId: number) {
        return this.userRepository.findByUserId(userId);
    }
}
