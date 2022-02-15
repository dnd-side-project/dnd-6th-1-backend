import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comments } from 'src/comments/comments.entity';
import { CommentsRepository } from 'src/comments/comments.repository';
import { Boards } from './entity/boards.entity';
import { BoardsRepository } from './repository/boards.repository';
import { UpdateBoardDto } from './dto/update-board.dto';
import { LikesRepository } from './repository/likes.repository';
import { BookmarksRepository } from './repository/bookmarks.repository';
import { Likes } from './entity/likes.entity';
import { Bookmarks } from './entity/bookmarks.entity';
import { UsersRepository } from 'src/users/users.repository';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(BoardsRepository) // boardservice 안에서 boardrepository 사용하기 위해서
            private boardsRepository: BoardsRepository,
        @InjectRepository(CommentsRepository)
            private commentsRepository: CommentsRepository,
        @InjectRepository(UsersRepository)
            private usersRepository: UsersRepository,
        @InjectRepository(LikesRepository)
            private likesRepository: LikesRepository,
        @InjectRepository(BookmarksRepository)
            private bookmarksRepository: BookmarksRepository,
    ){}

    async findByBoardId(boardId: number): Promise<Boards> {
        return await this.boardsRepository.findByBoardId(boardId);
    }

    // 날짜계산 -> 1초전 / 1분전 / 1시간전 / 1일전 / 
    static async calculateTime(date: Date, created: Date): Promise<string>{
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
    async getAllComments(loginUserId, boardId: number): Promise <Comments[]> {
        const totalComments = new Array();
        const board = await this.boardsRepository.findByBoardId(boardId);
        const parentComments = await this.commentsRepository.getParentComments(boardId); // 부모 댓글 가져오기
        for(var i=0;i<parentComments.length;i++){ // 부모 댓글 for문 돌고 
            const { commentCreated, commentContent, userId, commentStatus } = parentComments[i]; // 부모 댓글 정보
            const commentUser = await this.usersRepository.findByUserIdWithDeleted(userId); // 댓글 작성자
            const { nickname, profileImage, userStatus } = commentUser;      

            const createdAt = await BoardsService.calculateTime(new Date(), commentCreated); // 부모 댓글 시간 계산
            var canEdit = (loginUserId == commentUser.userId)? true : false // 댓글 작성자 / 로그인한 사용자가 동일한 경우
            var writerOrNot = (userId == board.userId) ? true : false // 댓글 작성자 / 글 작성자가 동일한 경우
            const comment = { // 부모댓글
                nickname : ((userStatus == false) ? '탈퇴한 회원입니다' : nickname) ,
                profileImage, // 바뀔 가능성 있음
                commentContent,
                createdAt,
                canEdit,
                writerOrNot
            }

            const allReplies = new Array();
            const replies = await this.commentsRepository.getChildComments(boardId, parentComments[i].groupId); // 각 부모댓글에 해당하는 대댓글 가져오기
            for(var j=0;j<replies.length;j++){
                const { commentCreated, commentContent, userId } = replies[j];
                const replyUser = await this.usersRepository.findByUserIdWithDeleted(userId);
                const { nickname, profileImage, userStatus } = replyUser;

                const createdAt = await BoardsService.calculateTime(new Date(), commentCreated); // 자식 댓글 시간 계산
                var canEdit = (loginUserId == replyUser.userId) ? true : false // 대댓글 작성자 / 로그인한 사용자가 동일한 경우
                var writerOrNot = (userId == board.userId) ? true : false // 대댓글 작성자와 글 작성자가 동일한 경우
                 const reply = {
                    nickname : ((userStatus == false) ? '탈퇴한 회원입니다' : nickname),
                    profileImage, // 바뀔 가능성 있음
                    commentContent,
                    createdAt,
                    canEdit,
                    writerOrNot
                }
                allReplies[j]=reply;
            }
            totalComments[i] = {
                comment: (commentStatus == false)? '삭제된 댓글입니다.' : comment,
                replies: allReplies
            }
        }
        return totalComments;
    } 
     
    // 커뮤니티 특정 글 조회
    async getBoardById(loginUserId: number, boardId: number) {
        const boardById = await this.findByBoardId(boardId);
        const { userId, categoryId, postTitle, postContent, postCreated, images } = boardById;
        const user = await this.usersRepository.findByUserIdWithDeleted(userId); // 게시글 올린 사람
        const { nickname, profileImage, userStatus } = user;   // 게시글 올린 사람 프로필이미지, 닉네임, 탈퇴여부
        const createdAt = await BoardsService.calculateTime(new Date(), postCreated); // 게시글 쓴 시간        
        const likeCnt = (await this.likesRepository.getAllLikes(boardId)).length; // 좋아요 수
        const comments = await this.getAllComments(loginUserId, boardId); // 댓글 목록
        const bookmarkStatus = await this.bookmarksRepository.findByUserId(boardId, loginUserId); // 북마크 여부 
        const likeStatus = await this.likesRepository.findByUserId(boardId, loginUserId); // 좋아요 여부
        const commentCnt = (await this.commentsRepository.getAllComments(boardById.boardId)).length;
        const canEdit = (userId == loginUserId)? true : false // 글 작성자 / 로그인한 사용자가 동일한 경우
        console.log(user.userId)
        const board = {
            profileImage, // 바뀔 수 있음
            nickname : ((userStatus == false) ? '탈퇴한 회원입니다' : nickname),
            categoryId,
            createdAt,
            postTitle,
            postContent,
            images,
            likeCnt,
            commentCnt,
            comments,
            canEdit,
            bookmarkStatus,
            likeStatus
        }    
        return board;
    }      
    
    // 게시판 전체 글 조회 (메인화면)
    async getAllBoards(loginUserId: number) {
        const totalBoards = new Array();
        const boards = await this.boardsRepository.getAllBoards(); // 전체 게시글 다가져오기
        for(var i=0;i<boards.length;i++){
            const { userId, boardId, categoryId, postTitle, postContent, postCreated } = boards[i];
            var createdAt = await BoardsService.calculateTime(new Date(), postCreated);        
            const user = await this.usersRepository.findByUserIdWithDeleted(userId);
            const { nickname, profileImage, userStatus } = user;
            var commentCnt = (await this.commentsRepository.getAllComments(boardId)).length;
            const imageCnt = boards[i].images.length // 게시글 사진 개수
            const likeCnt = (await this.likesRepository.getAllLikes(boardId)).length; // 좋아요 수
            const bookmarkStatus = await this.bookmarksRepository.findByUserId(boardId, loginUserId); // 북마크 여부 
            const likeStatus = await this.likesRepository.findByUserId(boardId, loginUserId); // 좋아요 여부
            const board = {
                boardId,
                categoryId,
                profileImage,
                nickname : ((userStatus == false) ? '탈퇴한 회원입니다' : nickname),
                postTitle,
                postContent,
                createdAt,
                imageCnt,
                commentCnt,
                likeCnt,
                bookmarkStatus,
                likeStatus
            }
            totalBoards[i] = board;
        }    
        return totalBoards;
    }

    async getAllBoardsByKeyword(loginUserId: number, keyword: string) { // 검색어별 조회
        const totalBoards = await this.getAllBoards(loginUserId);
        const boardsByKeyword = totalBoards.filter(board =>  // true를 반환하는 요소를 기준으로 신규 배열을 만들어 반환
            board.postTitle.includes(keyword) || board.postContent.includes(keyword)
        );

        const totalUsers = await this.usersRepository.getAllUsers(); // 탈퇴한 회원은 검색x
        const usersByKeyword = totalUsers.filter(user => 
            user.nickname.includes(keyword) 
        );

        const keywordResults = {
            contentResult: boardsByKeyword,
            userResult: usersByKeyword   
        }
        return keywordResults;
    }

    async getAllBoardsByCategory(loginUserId: number, category: number) { // 카테고리별 조회
        const totalBoards = await this.getAllBoards(loginUserId);
        const boardsByCategory = totalBoards.filter(board => 
            board.categoryId == category
        );
        return boardsByCategory;
    }
    
    async createBoard(loginUserId: number, createBoardDto: CreateBoardDto): Promise<Boards> {
        return await this.boardsRepository.createBoard(loginUserId, createBoardDto); // board DB에 저장
    }

    async updateBoard(boardId: number, updateBoardDto: UpdateBoardDto) {
        await this.boardsRepository.updateBoard(boardId, updateBoardDto);
        const board = await this.findByBoardId(boardId);
        return board;
    }

    async deleteBoard(boardId: number) {
        this.boardsRepository.deleteBoard(boardId);
    }

    async createLike(boardId: number, loginUserId: number): Promise<Likes>{
        return this.likesRepository.createLike(boardId, loginUserId);
    }

    async updateLikeStatus(boardId: number, loginUserId: number) {
        this.likesRepository.updateLikeStatus(boardId, loginUserId);
    }

    async createBookmark(boardId: number, loginUserId: number): Promise<Bookmarks>{
        return this.bookmarksRepository.createBookmark(boardId, loginUserId);
    }

    async updateBookmarkStatus(boardId: number, loginUserId: number) {
        this.bookmarksRepository.updateBookmarkStatus(boardId, loginUserId);
    }
}