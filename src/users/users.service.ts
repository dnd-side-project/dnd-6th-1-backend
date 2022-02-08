import { Injectable } from '@nestjs/common';
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
        const boardsByUserId = await this.usersRepository.getAllBoardsByUserId(userId);
        const array = new Array();
        array[0] = boardsByUserId[0];
        for(var i=0;i<boardsByUserId[0]['boards'].length;i++){
            var createdAt = boardsByUserId[0]['boards'][i].postCreated;
            var imageCnt = boardsByUserId[0]['boards'][i].images.length;
            array[0]['boards'][i].postCreated = await BoardsService.calculateTime(new Date(), createdAt);
        }
        return array;
    }
}
