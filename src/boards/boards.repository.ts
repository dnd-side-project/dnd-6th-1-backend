import { BoardImages } from "src/board-images/board-images.entity";
import { EntityRepository, Repository } from "typeorm";
import { Boards } from "./boards.entity";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";


@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardRepository extends Repository<Boards>{
    // entity를 컨트롤하기 위해서는 extends Repository를 해줘야함
    
    async getAllBoards(){
        return this.find();
    }

    // 검색어별 조회 
    async findByKeyword(keyword: string){
        return this.createQueryBuilder("boards")
                .where("boards.postTitle like :keyword", { keyword: `%${keyword}%`})
                .orWhere("boards.postContent like :keyword", { keyword: `%${keyword}%`})                
                .getMany();
    }

    // 카테고리별 조회
    async findByCategory(category: string){
        return this.find({categoryName : category});
    }

    async createBoard(createBoardDto: CreateBoardDto): Promise<Boards> {
        const {categoryName, postTitle, postContent, images } = createBoardDto;

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
        // 현재 있었던 애는 남기고 수정사항만 반영해서 저장,,

    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto) {        
        await this.update({boardId}, {...updateBoardDto});
        // UPDATE boards SET ...updateBoardDto = updateBoardDto where boardId = x
    }

    // 커뮤니티 글 삭제
    async deleteBoard(boardId: number) {
        await this.delete(boardId);
    }
}