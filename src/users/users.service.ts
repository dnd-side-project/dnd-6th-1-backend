import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { HistoriesRepository } from 'src/boards/repository/histories.repository';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
            private usersRepository: UsersRepository,
        @InjectRepository(HistoriesRepository)
            private historiesRepository: HistoriesRepository,
    ) { }
    
    async findByUserId(userId: number) {
        return await this.usersRepository.findByUserId(userId);
    } 

    async findByHistoryId(historyId: number) {
        return await this.historiesRepository.findByHistoryId(historyId);
    } 

    async findByKeyword(keyword: string){
        return await this.historiesRepository.findByKeyword(keyword);
    }

    async getAllHistories(userId: number){
        return await this.historiesRepository.getAllHistories(userId);
    }

    async createHistory(userId: number, keyword: string){
        return await this.historiesRepository.createHistory(userId, keyword);
    }

    async deleteHistory(userId: number, historyId: number){
        return await this.historiesRepository.deleteHistory(userId, historyId);
    }

    async deleteHistories(userId: number){
        return await this.historiesRepository.deleteAllHistories(userId);
    }

    async getAllBoardsByUserId(userId: number) {
        const boardsById = await this.usersRepository.getAllBoardsByUserId(userId);
        for(var i=0;i<boardsById.length;i++){
            boardsById[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsById[i]['createdAt']);
        }
        return boardsById;
    }

    async getAllBoardsByComments(userId: number){
        const boardsByComment = await this.usersRepository.getAllBoardsByComments(userId);
        for(var i=0;i<boardsByComment.length;i++){
            boardsByComment[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsByComment[i]['createdAt']);
        }
        return boardsByComment;
    }

    async getAllBoardsByBookmark(userId: number){
        const boardsByBookmark = await this.usersRepository.getAllBoardsByBookmark(userId);
        for(var i=0;i<boardsByBookmark.length;i++){
            boardsByBookmark[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsByBookmark[i]['createdAt']);
        }
        return boardsByBookmark;
    }
}
