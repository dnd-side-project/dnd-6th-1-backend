import { HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { Comments } from 'src/comments/comments.entity';
import { CommentsRepository } from 'src/comments/comments.repository';
import { Boards } from './boards.entity';
import { BoardsRepository } from './boards.repository';
import { CreateBoardFirstDto } from './dto/create-board-first.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(BoardsRepository) // boardservice 안에서 boardrepository 사용하기 위해서
            private boardsRepository: BoardsRepository,
        @InjectRepository(BoardImagesRepository) 
            private boardImagesRepository: BoardImagesRepository,
        @InjectRepository(CommentsRepository)
            private commentsRepository: CommentsRepository,
        @InjectRepository(UserRepository)
            private userRepository: UserRepository   
    ){}

    // 날짜계산 -> 2초전 / 1분전 / 1시간전 / 1일전 / 
    async calculateTime(date: Date, created: Date): Promise<string>{
        var distance = date.getTime() - created.getTime();
        var day = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hour = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var second = Math.floor((distance % (1000 * 60)) / 1000);
        var time = "";

        if(day!=0)
            time = day+'일 전';
        else if(hour!=0)
            time = hour+'시간 전';
        else if(minute!=0)
            time = minute+'분 전';
        else if(second!=0)
            time = second+'초 전';
        
        return time;
    }

    // 댓글 개수 세는 함수
    async countComment(comments: Comments[]) {
        var commentCnt = 0;
        for(var j=0;j<comments.length;j++){
            if(comments[j]['comment']!=='삭제된 댓글입니다.') // 원댓글이 삭제되지 않은 경우만 count
                commentCnt++;
            commentCnt += comments[j]['replies'].length; // 대댓글 갯수   
        }
        return commentCnt;
    }

    // 댓글 목록 가져오기
    async getAllComments(boardId: number): Promise <Comments[]> {
        const totalComments = new Array();
        const parentComments = await this.commentsRepository.getParentComments(boardId); // 부모 댓글 가져오기

        for(var i=0;i<parentComments.length;i++){ // 부모 댓글 for문 돌고 
            var allComments = new Array();
            parentComments[i]['createdAgo'] = await this.calculateTime(new Date(), parentComments[i].commentCreated); // 부모 댓글 시간 계산
            const replies = await this.commentsRepository.getChildComments(boardId, parentComments[i].groupId); // 각 부모댓글에 해당하는 대댓글 가져오기

            for(var j=0;j<replies.length;j++){
                replies[i]['createdAgo'] = await this.calculateTime(new Date(), replies[i].commentCreated); // 자식 댓글 시간 계산
                allComments[j]=replies[j];
            }
            totalComments[i] = {
                comment: (parentComments[i].commentStatus == false)? '삭제된 댓글입니다.' : parentComments[i],
                replies: allComments
            }
        }
        return totalComments;
    } 
     
    // 커뮤니티 특정 글 조회
    async getBoardById(boardId: number) {
        const boardById = await this.boardsRepository.getBoardById(boardId);
        const { userId, postTitle, postContent, postCreated, images }= boardById;
        const user = await this.userRepository.findById(userId);
        const { nickname, profileImage } = user;   // 사용자  프로필이미지, 닉네임

        const createdAt = await this.calculateTime(new Date(), postCreated); // 게시글 쓴 시간        
        const likeCnt = 10; // 좋아요 개수
        const comments = await this.getAllComments(boardId); // 댓글 목록
        var commentCnt = await this.countComment(comments); // 댓글 개수 세기

        const board = {
            profileImage,
            nickname,
            createdAt,
            postTitle,
            postContent,
            images,
            likeCnt,
            commentCnt,
            comments,
        }    
        return board;
    }      
    
    // 게시판 전체 글 조회
    async getAllBoards() {
        const totalBoards = new Array();
        const boards = await this.boardsRepository.getAllBoards(); // 전체 게시글 다가져오기
        for(var i=0;i<boards.length;i++){
            const { boardId, categoryName, postTitle, postContent, postCreated } = boards[i];
            var createdAt = await this.calculateTime(new Date(), postCreated);        
            const user = await this.userRepository.findById(boards[i].userId);
            const { nickname, profileImage } = user;
            const comments = await this.getAllComments(boards[i].boardId);
            var commentCnt = await this.countComment(comments); // 댓글 개수 세기
            
            const imageCnt = boards[i].images.length // 게시글 사진 개수
            const likeCnt = 10; // 좋아요 개수
            const board = {
                boardId,
                categoryName,
                profileImage,
                nickname,
                postTitle,
                postContent,
                createdAt,
                imageCnt,
                commentCnt,
                likeCnt,
            }
            totalBoards[i] = board;
        }    
        return totalBoards;
    }

    async getAllBoardsByKeyword(keyword: string) { // 검색어별 조회
        const totalBoards = await this.getAllBoards();
        console.log(totalBoards)
        const boardsByKeyword = totalBoards.filter(board =>  // true를 반환하는 요소를 기준으로 신규 배열을 만들어 반환
            board.postTitle.includes(keyword) || board.postContent.includes(keyword)
        );
        const keywordResults = {
            resultCnt: boardsByKeyword.length,
            searchResult: boardsByKeyword
        }
        return keywordResults;
    }

    async getAllBoardsByCategory(category: string) { // 카테고리별 조회
        const totalBoards = await this.getAllBoards();
        const boardsByCategory = totalBoards.filter(board => 
            board.categoryName === category
        );
        return boardsByCategory;
    }

    async createBoard(files: Express.Multer.File[], createBoardFirstDto: CreateBoardFirstDto): Promise<Boards> {
        const board = await this.boardsRepository.createBoard(createBoardFirstDto); // board DB에 저장
        await this.boardImagesRepository.createBoardImage(files, board.boardId); // boardImage DB에 저장        
        return board;
    }

    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto) {
        await this.boardsRepository.updateBoard(boardId, updateBoardDto);
        const board = await this.getBoardById(boardId);
        return board;
    }

    async deleteBoard(boardId: number) {
        this.boardsRepository.deleteBoard(boardId);
    }
}
