import { EntityRepository, Like, Repository } from "typeorm";
import { Boards } from "./boards.entity";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";


@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardRepository extends Repository<Boards>{
    
    // 검색어별 조회 
    async findByKeyword(keyword: string){
        return await this.find({
            where: [
                {postTitle: Like(`%${keyword}%`)},
                {postContent: Like(`%${keyword}%`)}
            ],
            relations: ['images']
        })
        /** QueryBuilder 이용
         * return this.createQueryBuilder("boards")
                .where("boards.postTitle like :keyword", { keyword: `%${keyword}%`})
                .orWhere("boards.postContent like :keyword", { keyword: `%${keyword}%`})                
                .getMany();
         */   
    }

    // 카테고리별 조회
    async findByCategory(category: string){
        return await this.find({
            where: {
                categoryName: category
            },
            relations: ['images']
        });
    }

    // 게시글 등록시 board DB
    async createBoard(createBoardDto: CreateBoardDto): Promise<Boards> {
        const {categoryName, postTitle, postContent } = createBoardDto;

        const board = {
            categoryName,
            postTitle, 
            postContent,
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