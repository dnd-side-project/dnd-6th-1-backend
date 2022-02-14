import { EntityRepository, getRepository, Repository } from "typeorm";
import { Users } from "./users.entity";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { AuthSignInDto } from "./dto/auth-signin.dto";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";


@EntityRepository(Users)
// users라는 테이블을 참조함
export class AuthRepository extends Repository<Users> {
    
    async findByAuthEmail(email: string) {
        // 현재 Users의 Query를 만들겠다 -> "users"로 접근하겠다.
        return await this.createQueryBuilder("users")
            // "".뭐뭐뭐
            .where("users.email =:email", {email})
            .getOne();
    }

    async findByAuthNickname(nickname: string) {
        return await this.createQueryBuilder("users")
            // "".뭐뭐뭐
            .where("users.nickname =:nickname", {nickname})
            .getOne();
    }

    async createUser(authCredentialsDto: AuthCredentialsDto) : Promise<any> {
        
        const { email, nickname, password } = authCredentialsDto;

        // 프로필 이미지 생성 (랜덤값을 생성해서 ... )
        // const profileImage = this.createQueryBuilder("profileImage")
        //     .where("profileImage.profileImageId =:")

        // salt 생성 - 비밀번호 암호화
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = this.create({email, nickname, password: hashedPassword});

        // user 생성
        return await this.save(user);  
    }

    // 로그인
    async signIn(userId: number) {
        await this.update({userId},{loginStatus: true}); 
    }



}
    