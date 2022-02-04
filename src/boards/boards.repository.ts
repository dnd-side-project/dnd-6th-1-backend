import { UserRepository } from "src/auth/user.repository";
import { EntityRepository, Like, Repository } from "typeorm";
import { Boards } from "./boards.entity";
import { CreateBoardFirstDto } from "./dto/create-board-first.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";


@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardsRepository extends Repository<Boards>{
    
    async getAllBoards(): Promise<Boards[]> {
        return await this.find({ relations: ["images"] });
    }

    async getBoardById(boardId: number): Promise<Boards> {
        return await this.findOne({boardId}, { relations: ["images"] });
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
        await this.update({boardId}, {...updateBoardDto});
    }

    // 커뮤니티 글 삭제
    async deleteBoard(boardId: number) {
        this.delete(boardId);
    }
}