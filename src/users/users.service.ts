import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsRepository } from 'src/boards/boards.repository';
import { BoardsService } from 'src/boards/boards.service';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        @InjectRepository(BoardsRepository) // boardservice 안에서 boardrepository 사용하기 위해서
            private boardsRepository: BoardsRepository,
    ) { }
    

    async findByUserId(userId: number) {
        return this.usersRepository.findByUserId(userId);
    } 

    async getAllBoardsByUserId(userId: number) {
        const boardsById = await this.usersRepository.getAllBoardsByUserId(userId);
        for(var i=0;i<boardsById.length;i++){
            boardsById[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsById[i]['createdAt']);
        }
        return boardsById;
    }
}
