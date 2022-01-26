import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Boards } from './boards.entity';
import { BoardRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(BoardRepository) // boardservice 안에서 boardrepository 사용하기 위해서
        private boardsRepository: BoardRepository
    ){}

    async getBoardById(boardId: number): Promise <Boards> {
        return this.boardsRepository.findOne(boardId);
    }

    async getAllBoards(): Promise <Boards[]> {
        return this.boardsRepository.find();
    }
    
    async getAllBoardsByCategory(category: string): Promise <Boards[]> {
        Logger.log(category);
        return this.boardsRepository.findByCategory(category);
    }

    createBoard(createBoardDto: CreateBoardDto): Promise<Boards> {
        return this.boardsRepository.createBoard(createBoardDto);
    }

    updateBoard(boardId: number, updateBoardDto: UpdateBoardDto): Promise<Boards> {
        return this.boardsRepository.updateBoard(boardId, updateBoardDto);
    }

    deleteBoard(boardId: number) {
        return this.boardsRepository.deleteBoard(boardId);
    }
}
