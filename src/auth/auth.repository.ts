import { EntityRepository, getRepository, Repository } from "typeorm";
import { Users } from "./users.entity";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";


@EntityRepository(Users)
export class AuthRepository extends Repository<Users> {
    
    // itzza
    async createUser(authCredentialsDto: AuthCredentialsDto) : Promise<void> {
        
        const { email, nickname, password } = authCredentialsDto;

        // salt 생성 - 비밀번호 암호화
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = this.create({email, nickname, password: hashedPassword});

        
        try {
            // user 생성
            await this.save(user); 
        } catch (error) {
            // 이미 존재하는 nickname
            if(error.code === '23505') {
                throw new ConflictException('이미 존재하는 닉네임입니다.');
            } else {
                throw new InternalServerErrorException();
            }
        }        
    }
}
    