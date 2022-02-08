import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersRepository } from "src/users/users.repository";
import { AuthRepository } from "./auth.repository";
import { Users } from "./users.entity";


// 다른 곳에서도 주입해서 사용
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UsersRepository)
        private userRepository: UsersRepository,
        @InjectRepository(AuthRepository)
        private authRepository: AuthRepository
    ) {
        super({
            // 토큰 유효한지 체크
            secretOrKey: 'Secret1234',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload) {
        const { email } = payload;
        const user: Users = await this.authRepository.findOne({ email });

        if(!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}