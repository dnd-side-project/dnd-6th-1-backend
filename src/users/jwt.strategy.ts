import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { validate } from "class-validator";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersRepository } from "./users.repository";
import { Users } from "./users.entity";


// 다른 곳에서도 주입해서 사용
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UsersRepository)
        private userRepository: UsersRepository
    ) {
        super({
            // 토큰 유효한지 체크
            secretOrKey: 'Secret1234',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload) {
        const { email } = payload;
        const user: Users = await this.userRepository.findOne({ email });

        if(!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}