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

    async getMyPage(userId: number){
        const myPage = new Object();

        // 프로필 이미지, 이메일, 비밀번호
        const user = await this.usersRepository.findByUserId(userId);
        const { email, nickname, profileImage } = user;
        myPage['user'] = {
            email,
            nickname,
            profileImage
        }
        
        // 내가 쓴 글 갯수
        const boardsById = await this.usersRepository.getAllBoardsByUserId(userId);
        myPage['writeCnt'] = boardsById.length;

        // 댓글 단 글의 개수
        const boardsByComment = await this.usersRepository.getAllBoardsByComments(userId);
        myPage['commentCnt'] = boardsByComment.length;

        // 북마크 한 글의 개수
        const boardsByBookmark = await this.usersRepository.getAllBoardsByBookmark(userId);
        myPage['bookmarkCnt'] = boardsByBookmark.length;
        return myPage;
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
