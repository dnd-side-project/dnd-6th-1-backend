import { EntityRepository, getRepository, Repository } from "typeorm";
import { Users } from "src/auth/users.entity";



@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
    async findByUserId(userId: number){
        return await this.findOne({userId, userStatus: true});
    }

    async getAllUsers(): Promise<Users[]> {
        return await getRepository(Users)
            .createQueryBuilder("user")
            .select([
                "user.nickname",
                "user.breakUpdate",
                "user.profileImage"
            ])
            .where("user.userStatus =:status", {status: true})
            .getMany();
    }

    // 카테고리명, 제목, 닉네임, 내용,              n시간전, 이미지 개수
    async getAllBoardsByUserId(userId: number){
        return await this.createQueryBuilder("user") 
            .innerJoinAndSelect("user.boards","boards") // user 테이블에 boards 게시물 join
            .leftJoinAndSelect("boards.images","images") // board 테이블에 image 게시물 join
            .select([
                "user.nickname AS nickname", 
                "boards.categoryName AS categoryName", 
                "boards.postTitle AS postTitle", 
                "boards.postCreated AS createdAt", 
                "boards.postContent AS postContent",
                "COUNT(images.originalName) AS imageCnt"
            ])
            .where("user.userId=:userId", {userId})
            .groupBy("boards.boardId")
            .getRawMany();    
    }
}
