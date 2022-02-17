import { EntityRepository, getRepository, Like, Repository } from "typeorm";
import { CreateBoardDto } from "../dto/create-board.dto";
import { UpdateBoardDto } from "../dto/update-board.dto";
import { Boards } from "../entity/boards.entity";

@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardsRepository extends Repository<Boards>{
    // const user = await this.users.findOne({ email }, { select: ['id', 'password'] });

    async findByBoardId(boardId: number){ 
        const board = await this.createQueryBuilder("boards")
            .leftJoinAndSelect("boards.images", "images")
            .where("boards.boardId=:boardId", {boardId})
            .andWhere("images.imageStatus=:status", {status: true})
            .getOne();

        if(!board) {// 이미지가 없는 경우 
            return await this.createQueryBuilder("boards")
                .leftJoinAndSelect("boards.images", "images")
                .where("boards.boardId=:boardId", {boardId})
                .getOne();
        }
        return board;
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
    async createBoard(loginUserId: number, createBoardDto: CreateBoardDto): Promise<Boards> {
        const { categoryId, postTitle, postContent } = createBoardDto;
        // const userIdToNumber = +userId; // form-data 형태로 받아야해서 userId가 string 값이므로 number로 변환
        const categoryIdToNumber = +categoryId;
        const board = {
            userId: loginUserId,
            categoryId: categoryIdToNumber,
            postTitle, 
            postContent,
            postCreated: new Date(),
        };
        return await this.save(board);
    }

    // 커뮤니티 글 수정 - 편집 가능한 요소 : 감정 카테고리, 제목, 글 내용, 이미지 
    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto) {
        const board = await this.findOne(boardId);
        const { categoryId, postTitle, postContent } = updateBoardDto;
        // userId를 string->number로 바꿔야 해서 ...updateBoardDto 로 못쓰기 때문에 일일히 null 값이면 db에 이미 저장된 값으로 초기화해줌
        // const userIdToNumber = +userId;       
        const category = (categoryId==null) ? board.categoryId : categoryId
        const categoryIdToNumber = +category; // category (string)
        const title = (postTitle==null) ? board.postTitle : postTitle
        const content = (postContent==null) ? board.postContent : postContent
        await this.update({boardId}, {categoryId: categoryIdToNumber, postTitle: title, postContent: content});
    }

    // 커뮤니티 글 삭제 -> postStatus = false 로 변경
    async deleteBoard(boardId: number) {
        await this.update({boardId},{postStatus: false});
    }
}