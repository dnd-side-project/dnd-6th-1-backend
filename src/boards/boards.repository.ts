import { UserRepository } from "src/auth/user.repository";
import { EntityRepository, Like, Repository } from "typeorm";
import { Boards } from "./boards.entity";
import { CreateBoardFirstDto } from "./dto/create-board-first.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";


@EntityRepository(Boards) // 이 클래스가 Board를 관리하는 repository 라는 것을 알려줌
export class BoardsRepository extends Repository<Boards>{
    
    // 날짜계산 -> 2초전 / 1분전 / 1시간전 / 1일전 / 
    async calculateTime(date: Date, created: Date): Promise<string>{
        var distance = date.getTime() - created.getTime();
        var day = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hour = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var second = Math.floor((distance % (1000 * 60)) / 1000);
        var time;

        if(day!=0)
            time = day+'일 전';
        else if(hour!=0)
            time = hour+'시간 전';
        else if(minute!=0)
            time = minute+'분 전';
        else if(second!=0)
            time = second+'초 전';
        
        return time;
    }

    // 전체 게시물 조회해갈 때
    async getAllBoards() {
        const boards = await this.find({ relations: ["images"] });
        // 닉네임 추가 
        var totalBoards = new Array();
        for(var i=0;i<boards.length;i++){
            const userId = boards[i].userId; //유저 추가된 경우
            const boardId = boards[i].boardId;
            const category = boards[i].categoryName;
            const title = boards[i].postTitle;
            const content = boards[i].postContent;
            const created = boards[i].postCreated; // UTC 시간대여서 Z가 붙음
            var createdAt = await this.calculateTime(new Date(), created);        

            // const date = new Date() // 현재 날짜
            // console.log(date.toLocaleString())
            // console.log(date.toLocaleString(), created.toLocaleString());
        
            const imageCnt = boards[i].images.length // 게시글 사진 개수
            const bookmarkCnt = 3; // 북마크 개수
            const likeCnt = 10; // 좋아요 개수
            const board = {
                boardId,
                category,
                title,
                content,
                createdAt,
                imageCnt,
                bookmarkCnt,
                likeCnt,
            }
            totalBoards[i] = board;
        }    
        return totalBoards;
    }
    
    // 특정 게시물 조회해갈 때
    async getBoardById(boardId: number) {
        const boardById = await this.findOne({boardId}, { relations: ["images"] });
        console.log(boardById);
        
        const title = boardById.postTitle;
        const content = boardById.postContent;
        const created = boardById.postCreated; // UTC 시간대여서 Z가 붙음
        const createdAt = await this.calculateTime(new Date(), created);        
        const likeCnt = 10; // 좋아요 개수
        const board = {
            boardId,
            title,
            content,
            createdAt,
            likeCnt,
        }    
        return board;
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
        console.log(newBoard);
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