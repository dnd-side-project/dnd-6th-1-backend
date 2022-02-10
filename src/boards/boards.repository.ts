import { Users } from "src/auth/users.entity";
import { EntityRepository, getRepository, Like, Repository } from "typeorm";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { Boards } from "./entity/boards.entity";


@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardsRepository extends Repository<Boards>{
    // const user = await this.users.findOne({ email }, { select: ['id', 'password'] });

    // async findByBoardId(boardId: number): Promise<Boards>{ // 삭제 안 된 게시물들만 반환
        // return await this.findOne({boardId, postStatus: true}, { 
        //     relations: ["images"],
        // });
    // }

    // 이미지의 
    async findByBoardId(boardId: number){ // 삭제 안 된 게시물들만 반환
        const query = await this.createQueryBuilder("boards") 
            .leftJoinAndSelect("boards.images","images") // board 테이블에 image 게시물 join (이미지가 없는 애도 갯수 세야 하므로)
            .where("images.imageStatus=:status", {status: true}) // 이미지가 삭제되지 않은 경우만
            .andWhere("boards.boardId=:boardId", {boardId})
            .andWhere("boards.postStatus=:status", {status: true}) // 게시글이 삭제되지 않은 경우만
            .getMany();
        console.log(query);
        return query[0];   
    }

    
    async getAllBoards(): Promise<Boards[]> {
        return await this.find({
            where: {
                postStatus: true
            },
            relations: ["images"] 
        });
    }

    // 게시글 등록시 board DB
    async createBoard(createBoardDto: CreateBoardDto): Promise<Boards> {
        const { userId, categoryName, postTitle, postContent } = createBoardDto;
        const userIdToNumber = +userId; // form-data 형태로 받아야해서 userId가 string 값이므로 number로 변환
        const board = {
            userId: userIdToNumber,
            categoryName,
            postTitle, 
            postContent,
            postCreated: new Date(),
        };
        return await this.save(board);
    }

    // 커뮤니티 글 수정 - 편집 가능한 요소 : 감정 카테고리, 제목, 글 내용, 이미지 
    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto) {
        const board = await this.findOne(boardId);
        const { userId, categoryName, postTitle, postContent } = updateBoardDto;
        // userId를 string->number로 바꿔야 해서 ...updateBoardDto 로 못쓰기 때문에 일일히 null 값이면 db에 이미 저장된 값으로 초기화해줌
        const userIdToNumber = +userId;       
        const category = (categoryName==null) ? board.categoryName : categoryName
        const title = (postTitle==null) ? board.postTitle : postTitle
        const content = (postContent==null) ? board.postContent : postContent
        await this.update({boardId}, {userId: userIdToNumber, categoryName: category, postTitle: title, postContent: content});
    }

    // 커뮤니티 글 삭제 -> postStatus = false 로 변경
    async deleteBoard(boardId: number) {
        await this.update({boardId},{postStatus: false});
    }
}