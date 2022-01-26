import { EntityRepository, Repository } from "typeorm";
import { Boards } from "./boards.entity";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";

@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardRepository extends Repository<Boards>{
    // entity를 컨트롤하기 위해서는 extends Repository를 해줘야함
    
    // 카테고리별 검색
    async findByCategory(category: string){
        console.log(category);
        return await this.createQueryBuilder("boards")
            .where("boards.categoryName = :category", {category})
            .getMany();
    }

    // 검색어별 검색
    async findByKeyword(keyword: string){
        return this.createQueryBuilder("boards")
            .where("boards.postTitle like :keyword", { keyword: `%${keyword}%`})
            .orWhere("boards.postContent like :keyword", { keyword: `%${keyword}%`})                
            .getMany();
    }


    /*
        select * from boards
            where postTitle like '%keyword%' or
            where postContent like '%keyword%'
    */

    async createBoard(createBoardDto: CreateBoardDto): Promise<Boards> {
        const {categoryName, postTitle, postContent} = createBoardDto;

        const board = this.create({
            categoryName,
            postTitle, 
            postContent,
        });
        await this.save(board);
        return board;
    }

    // 커뮤니티 글 수정
    // 편집 가능한 요소 : 감정 카테고리, 제목, 글 내용, 이미지 삭제여부
    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto): Promise<Boards> {
        const board = this.findOne(boardId);
        console.log(board);
        this.deleteBoard(boardId);
        const updatedBoard = { 
            ...board,
            ...updateBoardDto
        }; 
        console.log(updatedBoard);
        await this.save(updatedBoard);
        return updatedBoard;
    }

    // 커뮤니티 글 삭제
    async deleteBoard(boardId: number) {
        this.createQueryBuilder("boards")
            .delete()
            .where("boards.boardId = :boardId", {boardId})
            .execute();
    }
}