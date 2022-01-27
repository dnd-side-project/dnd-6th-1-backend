import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { Boards } from './boards.entity';
import { BoardRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(BoardRepository) // boardservice 안에서 boardrepository 사용하기 위해서
            private boardsRepository: BoardRepository,
        @InjectRepository(BoardImagesRepository) 
            private boardImagesRepository: BoardImagesRepository
    ){}

    async getBoardById(boardId: number): Promise <Boards> {
        return this.boardsRepository.findOne(boardId);
    }

    async getAllBoards(category: string, keyword: string): Promise <Boards[]> {
        if(keyword==null && category==null) // 전체 글 조회
            return this.boardsRepository.find();
        else if(keyword!=null && category==null) // 검색어별 조회 
            return this.boardsRepository.findByKeyword(keyword);
        else if(keyword==null && category!=null) // 카테고리별 조회
            return this.boardsRepository.find({categoryName : category});
    }
    
    async createBoard(files: Express.Multer.File[], createBoardDto: CreateBoardDto): Promise<Boards> {
        const board = await this.boardsRepository.createBoard(createBoardDto); // board DB에 저장
        await this.boardImagesRepository.createBoardImage(files, board.boardId); // boardImage DB에 저장
        return board;
    }

    updateBoard(boardId: number, updateBoardDto: UpdateBoardDto) {
        this.boardsRepository.updateBoard(boardId, updateBoardDto);
    }

    deleteBoard(boardId: number) {
        return this.boardsRepository.deleteBoard(boardId);
    }
}
