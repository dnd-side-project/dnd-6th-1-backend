import { EntityRepository, Repository } from "typeorm";
import { Users } from "./users.entity";
import { UserCredentialsDto } from "./dto/users-credential.dto";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";


@EntityRepository(Users)
export class UserRepository extends Repository<Users> {
    
    // itzza
    async createUser(userCredentialsDto: UserCredentialsDto) : Promise<void> {
        
        const { email, nickname, password } = userCredentialsDto;

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

    async findByUserId(userId: number){
        return await this.findOne(userId);
    }
}