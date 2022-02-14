import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { HistoriesRepository } from 'src/boards/repository/histories.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
    
        const boardsById = await this.usersRepository.getAllBoardsByUserId(userId); // 내가 쓴 글 갯수
        myPage['writeCnt'] = boardsById.length;
        const boardsByComment = await this.usersRepository.getAllBoardsByComments(userId); // 댓글 단 글의 개수
        myPage['commentCnt'] = boardsByComment.length;
        const boardsByBookmark = await this.usersRepository.getAllBoardsByBookmark(userId); // 북마크 한 글의 개수
        myPage['bookmarkCnt'] = boardsByBookmark.length;
        return myPage;
    }

    // 프로필 이미지 및 닉네임 변경 저장
    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        return await this.usersRepository.updateProfile(userId, updateProfileDto);
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
