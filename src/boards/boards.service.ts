import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './boards.entity';
import { BoardRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(BoardRepository) // boardservice 안에서 boardrepository 사용하기 위해서
        private boardsRepository: BoardRepository){
        }
    
    async getAllBoards(): Promise <Board[]> {
        return this.boardsRepository.find();
    }

    createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
        return this.boardsRepository.createBoard(createBoardDto);
    }
}
