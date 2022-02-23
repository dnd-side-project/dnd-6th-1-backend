import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { HistoriesRepository } from 'src/boards/repository/histories.repository';
import { DiariesRepository } from 'src/diaries/diaries.repository';
import { PasswordDto } from './dto/password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersRepository)
            private usersRepository: UsersRepository,
        @InjectRepository(HistoriesRepository)
            private historiesRepository: HistoriesRepository,
        @InjectRepository(DiariesRepository)
            private diariesRepository: DiariesRepository,
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

    // async calculateDay(date: string){
    //     console.log(date);
    // }


    async getWeeklyReport(year: number, month: number, week: number, userId: number){
        const diaries = await this.diariesRepository.getWeeklyReport(year, month, week, userId);
        const reports = new Object();
        const categoryName = [1,2,3,4,5];
        const emotionCnt = new Array();
        for(var i=0;i<5;i++){ // 감정 array 초기화
            emotionCnt[i]={
                category:categoryName[i],
                cnt:0
            }
        }
        for(var i=0;i<diaries.length;i++){
            const diary = diaries[i];
            emotionCnt[diary.categoryId-1].cnt++;
        }
        reports['emotion']=emotionCnt.sort(); // 내림차순 정렬

        const diaryList = new Array();
        const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        for(var i=0;i<diaries.length;i++){
            const { diaryId, date, categoryReason, diaryTitle } = diaries[i];
            const day = date.getDate()-1;
            const dayOfWeek = WEEKDAY[date.getDay()]; // 요일계산

            if(diaries[i].categoryId == reports['emotion'][0].category){ // 가장 많은 감정에 대한 일기글 조회 
                diaryList[i]={
                    diaryId,
                    day,
                    dayOfWeek,
                    diaryTitle,
                    categoryReason,
                }
            }
        }
        reports['diaries'] = diaryList.reverse(); // 오름차순 정렬
        return reports;
    }
}
