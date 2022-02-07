import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/auth/user.repository';
import { BoardImagesRepository } from 'src/board-images/board-images.repository';
import { Comments } from 'src/comments/comments.entity';
import { CommentsRepository } from 'src/comments/comments.repository';
import { Boards } from './entity/boards.entity';
import { BoardsRepository } from './boards.repository';
import { CreateBoardFirstDto } from './dto/create-board-first.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { LikesRepository } from './likes.repository';
import { BookmarksRepository } from './bookmarks.repository';
import { Likes } from './entity/likes.entity';
import { Bookmarks } from './entity/bookmarks.entity';

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
            private userRepository: UserRepository,
        @InjectRepository(LikesRepository)
            private likesRepository: LikesRepository,
        @InjectRepository(BookmarksRepository)
            private bookmarksRepository: BookmarksRepository     
    ){}

    async findByBoardId(boardId: number){
        return this.boardsRepository.findByBoardId(boardId);
    }

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

    // 댓글 목록 가져오기
    async getAllComments(boardId: number): Promise <Comments[]> {
        const totalComments = new Array();
        const board = await this.boardsRepository.findByBoardId(boardId);
        const parentComments = await this.commentsRepository.getParentComments(boardId); // 부모 댓글 가져오기
        for(var i=0;i<parentComments.length;i++){ // 부모 댓글 for문 돌고 
            const { commentContent, userId } = parentComments[i]; // 댓글 작성자
            const commentUser = await this.userRepository.findByUserId(userId);
            const { nickname, profileImage } = commentUser;
            const createdAt = await this.calculateTime(new Date(), parentComments[i].commentCreated); // 부모 댓글 시간 계산
            var canEdit = (commentUser.loginStatus == true)? true : false // 댓글 작성자 / 로그인한 사용자가 동일한 경우
            var writerOrNot = (userId == board.userId) ? true : false // 댓글 작성자 / 글 작성자가 동일한 경우
            const comment = { // 부모댓글
                nickname,
                profileImage,
                commentContent,
                createdAt,
                canEdit,
                writerOrNot
            }

            const allReplies = new Array();
            const replies = await this.commentsRepository.getChildComments(boardId, parentComments[i].groupId); // 각 부모댓글에 해당하는 대댓글 가져오기
            for(var j=0;j<replies.length;j++){
                const { commentContent, userId } = replies[j];
                const replyUser = await this.userRepository.findByUserId(userId);
                const { nickname, profileImage } = replyUser;
                const createdAt = await this.calculateTime(new Date(), replies[i].commentCreated); // 자식 댓글 시간 계산
                var canEdit = (replyUser.loginStatus == true) ? true : false // 대댓글 작성자 / 로그인한 사용자가 동일한 경우
                var writerOrNot = (userId == board.userId) ? true : false // 대댓글 작성자와 글 작성자가 동일한 경우
                 const reply = {
                    nickname,
                    profileImage,
                    commentContent,
                    createdAt,
                    canEdit,
                    writerOrNot
                }
                allReplies[j]=reply;
            }
            totalComments[i] = {
                comment: (parentComments[i].commentStatus == false)? '삭제된 댓글입니다.' : comment,
                replies: allReplies
            }
        }
        return totalComments;
    } 
     
    // 커뮤니티 특정 글 조회
    async getBoardById(boardId: number) {
        const boardById = await this.findByBoardId(boardId);
        const { userId, categoryName, postTitle, postContent, postCreated, images }= boardById;
        const user = await this.userRepository.findByUserId(userId);
        const { nickname, profileImage } = user;   // 사용자  프로필이미지, 닉네임
        const createdAt = await this.calculateTime(new Date(), postCreated); // 게시글 쓴 시간        
        const likeCnt = (await this.likesRepository.getAllLikes(boardId)).length; // 좋아요 수
        const comments = await this.getAllComments(boardId); // 댓글 목록
        var commentCnt = (await this.commentsRepository.getAllComments(boardById.boardId)).length;
        var canEdit = (user.loginStatus == true)? true : false // 글 작성자 / 로그인한 사용자가 동일한 경우
        
        const board = {
            profileImage,
            nickname,
            categoryName,
            createdAt,
            postTitle,
            postContent,
            images,
            likeCnt,
            commentCnt: `총 ${commentCnt}개의 댓글`,
            comments,
            canEdit
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
            const user = await this.userRepository.findByUserId(boards[i].userId);
            const { nickname, profileImage } = user;
            var commentCnt = (await this.commentsRepository.getAllComments(boardId)).length;
            const imageCnt = boards[i].images.length // 게시글 사진 개수
            const likeCnt = (await this.likesRepository.getAllLikes(boardId)).length; // 좋아요 수
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
        const boardsByKeyword = totalBoards.filter(board =>  // true를 반환하는 요소를 기준으로 신규 배열을 만들어 반환
            board.postTitle.includes(keyword) || board.postContent.includes(keyword)
        );
        const keywordResults = {
            resultCnt: boardsByKeyword.length+'개',
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
        const board = await this.findByBoardId(boardId);
        return board;
    }

    async deleteBoard(boardId: number) {
        this.boardsRepository.deleteBoard(boardId);
    }

    async createLike(boardId: number, userId: number): Promise<Likes>{
        return this.likesRepository.createLike(boardId, userId);
    }

    async changeLikeStatus(boardId: number, userId: number) {
        this.likesRepository.changeLikeStatus(boardId, userId);
    }

    async createBookmark(boardId: number, userId: number): Promise<Bookmarks>{
        return this.bookmarksRepository.createBookmark(boardId, userId);
    }

    async changeBookmarkStatus(boardId: number, userId: number) {
        this.bookmarksRepository.changeBookmarkStatus(boardId, userId);
    }
}