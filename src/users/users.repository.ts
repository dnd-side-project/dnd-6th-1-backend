import { EntityRepository, getRepository, Repository } from "typeorm";
import { Users } from "src/auth/users.entity";
import { Boards } from "src/boards/entity/boards.entity";

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
    async findByUserId(userId: number){
        return await this.findOne(userId);
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
            .where("user.userId=:userId", {userId})
            .select([
                "user.nickname", 
                "boards.categoryName", 
                "boards.postTitle", 
                "boards.postCreated", 
                "boards.postContent", 
                "images"
            ])
            .getMany();
    }

    // 댓글을 단 게시물 가져오기
    async getBoardsByComments(userId: number){
        return await this.createQueryBuilder("user") 
            .innerJoinAndSelect("user.boards","boards") // user 테이블에 boards 게시물 join
            .leftJoinAndSelect("boards.comments","comments") // board 테이블에 comment 게시물 join
            .where("user.userId=:userId", {userId})
            .select([
                "user.nickname", 
                "comments"
            ])
            .getMany();
    }
}
    