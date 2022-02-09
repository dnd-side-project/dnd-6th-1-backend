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

    async getAllBoardsByComments(userId: number){
        const boardsByComment = await this.usersRepository.getBoardsByComments(userId);
        for(var i=0;i<boardsByComment.length;i++){
            boardsByComment[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsByComment[i]['createdAt']);
        }
        return boardsByComment;
    }
}
