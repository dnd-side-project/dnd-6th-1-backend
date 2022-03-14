import { EntityRepository, Repository } from "typeorm";
import { Users } from "../users/users.entity";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import * as bcrypt from "bcryptjs";
import { UserImportBuilder } from "firebase-admin/lib/auth/user-import-builder";


require("dotenv").config();
@EntityRepository(Users)
// users라는 테이블을 참조함
export class AuthRepository extends Repository<Users> {
    
    async findByAuthEmail(email: string) {
        // 현재 Users의 Query를 만들겠다 -> "users"로 접근하겠다.
        return await this.createQueryBuilder("users")
            // "".뭐뭐뭐
            .where("users.email =:email", {email})
            .andWhere("users.userStatus =:status", {status: true})
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
        const salt = await bcrypt.genSalt();         // salt 생성 - 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, salt);
        const rand = Math.floor(Math.random()*5)+1; // 랜덤값 생성
        const profileImage = `${process.env.AWS_S3_URL}/basicImages/${rand}.png`
        const user = this.create({
            email, 
            nickname, 
            password: hashedPassword,
            profileImage
        });

        // user 생성
        return await this.save(user);  
    }

    async findByUserId(userId: number, email: string){
        return this.createQueryBuilder('user')
            .select([
                'user.userId',
                'user.email',
                'user.nickname',
            ])
            .where('user.userId =:userId', {userId})
            .getOne();
    }
  
    // 로그인
    async signIn(userId: number, accessToken: string) {
        await this.update({userId},{ accessToken });
        // 토큰 값 update 
    }

    async signOut(userId: number) {
        await this.update({userId}, { accessToken: "" }); 
        // 토큰 값 삭제
    }

    async sendEmail(user: Users, password: string){
        console.log(password);
        const { userId, email, nickname, userStatus, loginStatus, profileImage } = user;
        const updateUser = {
            userId,
            email,
            nickname,
            password: password,
            userStatus,
            loginStatus,
            profileImage
        }
        await this.update(user, updateUser);
        console.log(updateUser);
    }
}
    