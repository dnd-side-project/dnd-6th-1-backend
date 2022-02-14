import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersRepository } from "src/users/users.repository";
import { AuthRepository } from "../auth.repository";
import { Users } from "../users.entity";
require("dotenv").config();

// 다른 곳에서도 주입해서 사용
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(AuthRepository)
            private authRepository: AuthRepository
    ) {
        super({
            // 토큰 유효한지 체크
            secretOrKey: process.env.SECRET_KEY,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() 
            // Header의 Token으로부터 JWT를 추출하고, SecretKey와 만료기간 설정
        })
    }

    async validate(payload) {
        const { userId, email } = payload;
        const user: Users = await this.authRepository.findByUserId(userId, email);

        if(!user) {
            throw new UnauthorizedException('UnAuthrozized User');
        }

        return user;
    }
}