import { EntityRepository, getRepository, Repository } from "typeorm";
import { Users } from "src/auth/users.entity";
import { Boards } from "src/boards/entity/boards.entity";

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

    // 댓글을 단 게시물 가져오기
    async getBoardsByComments(userId: number){
        return await getRepository(Boards)
            .createQueryBuilder("boards")
            .leftJoinAndSelect("boards.comments","comments") // board 테이블에 comments 게시물 join
            .leftJoinAndSelect("boards.images","images") // board 테이블에 images 게시물 join
            .select([
                "boards.categoryName AS categoryName", 
                "boards.postTitle AS postTitle", 
                "boards.postCreated AS createdAt", 
                "boards.postContent AS postContent",
                "COUNT(images.originalName) AS imageCnt"
            ])
            .where("comments.userId=:userId", {userId}) // 이은 데이터에서 댓글단 사용자가 userId인 애만
            .getRawMany();    
    }
}
