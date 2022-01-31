import { BoardImages } from "src/board-images/board-images.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Boards extends BaseEntity {
    @PrimaryGeneratedColumn()
    boardId: number;

    @Column()
    categoryName: string;

    @Column({type: 'varchar', length: 40}) 
    postTitle: string;

    @Column()
    postContent: string;

    // Board(1) <> BoardImage(*)
    @OneToMany(
        () => BoardImages,
        (boardImage) => boardImage.boardId
    )
    images: BoardImages[];
}

// [
//     {
//       "boardId": 2,
//       "categoryName": "부정",
//       "postTitle": "아 배고프다",
//       "postContent": "햄버거먹고싶어요",
//       "images": [
//         {
//           "boardImageId": 5,
//           "originalName": "mongoose.jpg",
//           "imageUrl": "https://dnd-project-1.s3.ap-northeast-2.amazonaws.com/boardImages/1643626016740-mongoose.jpg"
//         },
//         {
//           "boardImageId": 6,
//           "originalName": "image01.png",
//           "imageUrl": "https://dnd-project-1.s3.ap-northeast-2.amazonaws.com/boardImages/1643626016740-image01.png"
//         }
//       ], // 숫자 세는건지 배열인지 미정
//       "nickname": "닉네임", // 사용자 닉네임
//       "profileImg":"프로필 사진링크", // 프로필 사진
//       "likes":10, // 좋아요 수 
//       "comments":50, // 댓글 수 
//       "bookmarks":100, // 북마크수 
//       "createdAt": "N시간 OR 1일 전 게시"// 시간 계산
//     },
//     {
//       "boardId": 3,
//       "categoryName": "부정",
//       "postTitle": "아 배고프다222 ",
//       "postContent": "햄버거먹고싶어요",
//       "images": [
//         {
//           "boardImageId": 5,
//           "originalName": "mongoose.jpg",
//           "imageUrl": "https://dnd-project-1.s3.ap-northeast-2.amazonaws.com/boardImages/1643626016740-mongoose.jpg"
//         },
//         {
//           "boardImageId": 6,
//           "originalName": "image01.png",
//           "imageUrl": "https://dnd-project-1.s3.ap-northeast-2.amazonaws.com/boardImages/1643626016740-image01.png"
//         }
//       ]
//     }
//   ]