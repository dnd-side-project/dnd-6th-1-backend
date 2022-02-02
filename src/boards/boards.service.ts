import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, Res } from '@nestjs/common';
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
        return await this.boardsRepository.findOne(boardId);
    }      
    
    async getAllBoards(): Promise <Boards[]> {
        return await this.boardsRepository.find({ relations: ["images"] });
    }

    async getAllBoardsByKeyword(keyword: string): Promise <Boards[]> {
        return await this.boardsRepository.findByKeyword(keyword);
    }

    async getAllBoardsByCategory(category: string): Promise <Boards[]> {
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
