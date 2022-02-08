import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredentialsDto } from './dto/users-credential.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
        private userRepository: UsersRepository,
        private jwtService: JwtService
    ) { }

    
    // itzza
    // 회원가입
    async signUp(userCredentialsDto: UserCredentialsDto) : Promise<void> {
        return this.userRepository.createUser(userCredentialsDto);
    }


    // 로그인 : email, pw 입력
    async signIn(userCredentialsDto: UserCredentialsDto): Promise<{accessToken: string}> {
        
        const { email, password } = userCredentialsDto;
        // user 찾기 : email
        const user = await this.userRepository.findOne({email});

        //로그인 성공 - user가 데이터베이스에 있고, pw비교
        if(user && (await bcrypt.compare(password, user.password))) {

            // 유저 토큰 생성 (Secret + Payload)
            const payload = { email };
            const accessToken = await this.jwtService.sign(payload);

            return { accessToken };
        } else {        // 로그인 실패
            throw new UnauthorizedException('login faild')
        }
    }

    
    // 닉네임 중복 조회
    async ckNickname(nickname: string) {
        const user = await this.userRepository.findOne({nickname});

    }

    

    // 회원탈퇴
    async signOut(id: string): Promise<void>{
        await this.userRepository.delete(id);
    }


    async findByUserId(userId: number) {
        return this.userRepository.findByUserId(userId);
    }
}
