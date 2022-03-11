import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Iot } from 'aws-sdk';
import { type } from 'os';
import { BoardsService } from 'src/boards/boards.service';
import { BoardsRepository } from 'src/boards/repository/boards.repository';
import { HistoriesRepository } from 'src/histories/histories.repository';
import { CommentsRepository } from 'src/comments/comments.repository';
import { DiariesRepository } from 'src/diaries/repository/diaries.repository';
import { ReportsRepository } from 'src/reports/reports.repository';
import { PasswordDto } from './dto/password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
            private usersRepository: UsersRepository,
        @InjectRepository(BoardsRepository)
            private boardsRepository: BoardsRepository,
        @InjectRepository(CommentsRepository)
            private commentsRepository: CommentsRepository,
        @InjectRepository(HistoriesRepository)
            private historiesRepository: HistoriesRepository,
        @InjectRepository(DiariesRepository)
            private diariesRepository: DiariesRepository,
        @InjectRepository(ReportsRepository)
            private reportsRepository: ReportsRepository,
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
        const recentBoard = await this.boardsRepository.getRecentBoard(userId);
        const recentComment = await this.commentsRepository.getRecentComment(userId);
        let recentPost;
        if(!recentBoard && !recentComment) // 작성글과 댓글이 모두 없는 경우
            recentPost = ""
        else if(!recentBoard)
            recentPost = recentComment.commentCreated;
        else if(!recentComment)
            recentPost = recentBoard.postCreated;
        else{ // 둘다 있다면 최신꺼
            if(recentBoard.postCreated.getTime()-recentComment.commentCreated.getTime())
                recentPost = recentBoard.postCreated;
            else
                recentPost = recentComment.commentCreated;
        }

        recentPost = JSON.stringify(recentPost).substring(1,11).replace(/-/gi,'.');

        myPage['user'] = {
            email,
            nickname,
            profileImage,
            recentPost
        }
    
        const boardsById = await this.usersRepository.getAllBoardsByUserId(userId); // 내가 쓴 글 갯수
        myPage['writeCnt'] = boardsById.length;
        const boardsByComment = await this.usersRepository.getAllBoardsByComments(userId); // 댓글 단 글의 개수
        myPage['commentCnt'] = boardsByComment.length;
        const boardsByBookmark = await this.usersRepository.getAllBoardsByBookmark(userId); // 북마크 한 글의 개수
        myPage['bookmarkCnt'] = boardsByBookmark.length;
        return myPage;
    }

    async deleteUser(userId: number){
        return await this.usersRepository.deleteUser(userId);
    }

    // 프로필 이미지 및 닉네임 변경 저장
    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        return await this.usersRepository.updateProfile(userId, updateProfileDto);
    }

    async updatePassword(userId: number, passwordDto: PasswordDto){
        return await this.usersRepository.updatePassword(userId, passwordDto);
    }   

    async getAllBoardsByUserId(userId: number) {
        const boardsById = await this.usersRepository.getAllBoardsByUserId(userId);
        for(var i=0;i<boardsById.length;i++){
            boardsById[i]['imageCnt'] = +boardsById[i]['imageCnt'] // 이미지 개수 정수형으로
            boardsById[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsById[i]['createdAt']);
        }
        return boardsById;
    }

    async getAllBoardsByComments(userId: number){
        const boardsByComment = await this.usersRepository.getAllBoardsByComments(userId);
        for(var i=0;i<boardsByComment.length;i++){
            boardsByComment[i]['imageCnt'] = +boardsByComment[i]['imageCnt'] // 이미지 개수 정수형으로
            boardsByComment[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsByComment[i]['createdAt']);
        }
        return boardsByComment;
    }

    async getAllBoardsByBookmark(userId: number){
        const boardsByBookmark = await this.usersRepository.getAllBoardsByBookmark(userId);
        for(var i=0;i<boardsByBookmark.length;i++){
            boardsByBookmark[i]['imageCnt'] = +boardsByBookmark[i]['imageCnt'] // 이미지 개수 정수형으로
            boardsByBookmark[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsByBookmark[i]['createdAt']);
        }
        return boardsByBookmark;
    }

    async getAllBoardsByAll(userId: number){
        const boardsByAll = new Object();
        const boardsById = await this.usersRepository.getAllBoardsByUserId(userId);
        for(var i=0;i<boardsById.length;i++){
            boardsById[i]['imageCnt'] = +boardsById[i]['imageCnt'] // 이미지 개수 정수형으로
            boardsById[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsById[i]['createdAt']);
        }
        boardsByAll['boards']= boardsById;

        const boardsByComment = await this.usersRepository.getAllBoardsByComments(userId);
        for(var i=0;i<boardsByComment.length;i++){
            boardsByComment[i]['imageCnt'] = +boardsByComment[i]['imageCnt'] // 이미지 개수 정수형으로
            boardsByComment[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsByComment[i]['createdAt']);
        }
        boardsByAll['comments'] = boardsByComment;

        const boardsByBookmark = await this.usersRepository.getAllBoardsByBookmark(userId);
        for(var i=0;i<boardsByBookmark.length;i++){
            boardsByBookmark[i]['imageCnt'] = +boardsByBookmark[i]['imageCnt'] // 이미지 개수 정수형으로
            boardsByBookmark[i]['createdAt'] = await BoardsService.calculateTime(new Date(), boardsByBookmark[i]['createdAt']);
        }
        boardsByAll['bookmarks']= boardsByBookmark;
        return boardsByAll;
    }
    
}
