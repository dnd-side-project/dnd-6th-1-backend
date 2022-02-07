import { EntityRepository, Like, Repository } from "typeorm";
import { CreateBoardFirstDto } from "./dto/create-board-first.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { Boards } from "./entity/boards.entity";


@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardsRepository extends Repository<Boards>{
    
    async findByBoardId(boardId: number){ // 삭제 안 된 게시물들만 반환
        return await this.findOne({boardId, postStatus: true}, { relations: ["images"] });
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
    async createBoard(createBoardFirstDto: CreateBoardFirstDto): Promise<Boards> {
        const { userId, categoryName, postTitle, postContent } = createBoardFirstDto;
        const userIdToNumber: number = +userId;
        const board = {
            userId: userIdToNumber,
            categoryName,
            postTitle, 
            postContent,
            postCreated: new Date(),
        };
        const newBoard = await this.save(board);
        return newBoard;
    }

    // 커뮤니티 글 수정 - 편집 가능한 요소 : 감정 카테고리, 제목, 글 내용, 이미지 
    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto) {  
        const { userId, categoryName, postTitle, postContent } = updateBoardDto;
        let userIdToNumber = +userId;        
        await this.update({boardId}, {userId: userIdToNumber, categoryName, postTitle, postContent});
    }

    // 커뮤니티 글 삭제 -> postStatus = false 로 변경
    async deleteBoard(boardId: number) {
        await this.update({boardId},{postStatus: false});
    }
}