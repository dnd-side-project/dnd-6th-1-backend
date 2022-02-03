import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { CommentsRepository } from 'src/comments/comments.repository';
import { Boards } from './boards.entity';
import { BoardsRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(BoardsRepository) // boardservice 안에서 boardrepository 사용하기 위해서
            private boardsRepository: BoardsRepository,
        @InjectRepository(BoardImagesRepository) 
            private boardImagesRepository: BoardImagesRepository,
        @InjectRepository(CommentsRepository)
            private commentsRepository: CommentsRepository,
        @InjectRepository(UserRepository)
            private userRepository: UserRepository   
    ){}

    async getBoardById(boardId: number): Promise <Boards> {
        return await this.boardsRepository.findOne(boardId);
    }      
    
    async getAllBoards(): Promise <Boards[]> {
        const totalBoards = new Array();
        const boards = await this.boardsRepository.find({ relations: ["images"] }); // 전체 게시글 다가져오기
        const allBoards = await this.boardsRepository.getAllBoards();
        for(var i=0;i<boards.length;i++){
            const user = await this.userRepository.findOne({ userId: boards[i].userId })
            const comments = await this.commentsRepository.getAllComments(boards[i].boardId);
            var commentCnt=0; // 댓글 개수 세기
            for(var j=0;j<comments.length;j++){
                if(comments[j]['comment']!=='삭제된 댓글입니다.') // 원댓글이 삭제되지 않은 경우만 count
                    commentCnt++;
                commentCnt += comments[j]['replies'].length; // 대댓글 갯수   
            }
            allBoards[i]['commentCnt'] = commentCnt;
            // allBoards[i]['profileImage'] = user.profileImage;
            allBoards[i]['profileImage'] = 'https://dnd-project-1.s3.ap-northeast-2.amazonaws.com/boardImages/1643825809948-mongoose.jpg';
            allBoards[i]['nickname'] = user.nickname; 
            totalBoards[i]=allBoards[i];
        }
        return totalBoards;
    }

    async getAllBoardsByKeyword(keyword: string): Promise <Boards[]> { // 검색어별 조회
        const totalBoards = await this.getAllBoards();
        console.log(totalBoards);
        return await this.boardsRepository.findByKeyword(keyword);
    }

    async getAllBoardsByCategory(category: string): Promise <Boards[]> { // 카테고리별 조회
        return await this.boardsRepository.findByCategory(category);
    }

    async createBoard(files: Express.Multer.File[], createBoardDto: CreateBoardDto): Promise<Boards> {
        const board = await this.boardsRepository.createBoard(createBoardDto); // board DB에 저장
        await this.boardImagesRepository.createBoardImage(files, board.boardId); // boardImage DB에 저장        
        return board;
    }

    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto): Promise<Boards> {
        await this.boardsRepository.updateBoard(boardId, updateBoardDto);
        const board = await this.getBoardById(boardId);
        return board;
    }

    async deleteBoard(boardId: number) {
        this.boardsRepository.deleteBoard(boardId);
    }
}
