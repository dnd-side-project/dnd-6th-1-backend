import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { Users } from "src/users/users.entity";
import { BoardImages } from "src/board-images/board-images.entity";
import { Comments } from "src/comments/comments.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bookmarks } from "./bookmarks.entity";
import { Likes } from "./likes.entity";

@Entity()
export class Boards extends BaseEntity {
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 게시글 ID', 
    })
    @PrimaryGeneratedColumn()
    boardId: number;

    @ApiProperty({ 
        example: 21,
        description: '게시글을 작성한 유저 ID', 
    })
    @IsNotEmpty()
    @IsNumber()
    @ManyToOne(
        () => Users,
        (user) => user.boards
    )
    @JoinColumn({name:"userId"})
    @Column() //작성자 아이디 
    userId: number;
    
    @ApiProperty({ 
        example: 1,
        description: '카테고리 번호', 
    })
    @IsIn([0,1,2,3,4,5])
    @IsNotEmpty()
    @IsNumber()
    @Column()
    categoryId: number;

    @ApiProperty({ 
        example: '아오화나',
        description: '게시글 제목',
    })
    @IsNotEmpty()
    @Length(2,20, { message : '2글자 이상 20자 미만으로 입력해주세요.'})
    @Column({type: 'varchar', length: 40}) 
    postTitle: string;

    @ApiProperty({ 
        example: '아 진짜화나네 진짜왜안되냐 이거',
        description: '게시글 내용', 
    })
    @Column()
    postContent: string;

    // Board(1) <> BoardImage(*)
    @OneToMany(
        () => BoardImages,
        (boardImage) => boardImage.boardId
    )
    images: BoardImages[];

    // Board(1) <> Comments(*)
    @OneToMany(
        () => Comments,
        (comment) => comment.boardId
    )
    comments: Comments[];

    // Board(1) <> Likes(*)
    @OneToMany(
        () => Likes,
        (like) => like.boardId
    )
    likes: Likes[];

    // Board(1) <> Bookmarks(*)
    @OneToMany(
        () => Bookmarks,
        (bookmark) => bookmark.boardId
    )
    bookmarks: Bookmarks[];

    @ApiProperty({ 
        example: '2022-02-04 16:47:24',
        description: '게시글이 등록된 시간', 
    })
    @Column({ type:'timestamp'})
    postCreated: Date;

    @ApiProperty({ 
        example: true,
        description: '게시글 삭제 여부 _ 게시글 삭제된 경우 : false', 
    })
    @Column({ default : 1 }) // 글 삭제 여부 
    postStatus: boolean;

}