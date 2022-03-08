import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Iot } from 'aws-sdk';
import { type } from 'os';
import { BoardsService } from 'src/boards/boards.service';
import { BoardsRepository } from 'src/boards/repository/boards.repository';
import { HistoriesRepository } from 'src/boards/repository/histories.repository';
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

    async getWeeklyReport(year: number, month: number, week: number, userId: number){
        // this.reportsRepository.createReport(year, month, )
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
        reports['emotion']=emotionCnt.sort((a,b) => b.cnt - a.cnt); // 내림차순 정렬

        const maxCategory = new Array();         // 가장 많은 감정들을 배열에 담기
        for(var i=0;i<diaries.length;i++){
            if(emotionCnt[i].cnt == reports['emotion'][0].cnt)
                maxCategory.push(reports['emotion'][i].category);
        }
        // const diaryList = new Array();
        const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const maxDiaries = diaries.filter(diary => maxCategory.includes(diary.categoryId)); // 많은 감정이 담긴 배열만 필터링
        const diaryList = new Array(); // diaries : [] 에 해당하는 배열


        for(var i=0;i<maxCategory.length;i++){ // maxCnt 인 카테고리 번호가 담긴 배열            
            const diary = new Object(); // 각 카테고리별로 담을 딕셔너리 생성
            diary['category'] = maxCategory[i]; // 딕셔너리 첫 요소 -  카테고리 번호
            const diaryObj = new Array();  // 각 카테고리에 해당하는 일기 담을 배열 생성
            for(var j=0;j<maxDiaries.length;j++){ // maxCnt인 카테고리로 필터링된 다이어리 배열 
                if(maxCategory[i] == maxDiaries[j].categoryId){
                    const { diaryId, date, categoryReason, diaryTitle } = maxDiaries[j];
                    const day = date.getDate();
                    const dayOfWeek = WEEKDAY[date.getDay()]; // 요일계산
                    const diaryPost = {
                        diaryId,
                        day,
                        dayOfWeek,
                        diaryTitle,
                        categoryReason,
                    }
                    diaryObj.push(diaryPost); // 일기 담는 배열에 diary 딕셔너리 푸시
                }
            }
            diary['diary'] = diaryObj.sort((a,b) => a.day - b.day); // 일기담은 배열 날짜 순
            diaryList[i] = diary;
        }
        reports['diaries'] = diaryList;
        return reports;
    }

    
}
