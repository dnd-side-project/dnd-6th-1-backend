import { ApiProperty } from "@nestjs/swagger";
import { Users } from "src/users/users.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Boards } from "./boards.entity";

@Entity()
export class Bookmarks extends BaseEntity {
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 북마크 ID', 
    })
    @PrimaryGeneratedColumn()
    bookmarkId: number;

    @ApiProperty({ 
        example: 1,
        description: '북마크한 유저 ID', 
    })
    @ManyToOne(
        () => Users,
        (user) => user.bookmarks
    )
    @JoinColumn({name:"userId"})
    @Column() // 작성자 아이디 
    userId: number;

    @ApiProperty({ 
        example: 21,
        description: '북마크한 게시글 ID', 
    })
    @ManyToOne(
        () => Boards,
        (board) => board.bookmarks
    )
    @JoinColumn({name:"boardId"})
    @Column()
    boardId: number;

    @ApiProperty({ 
        example: true,
        description: '북마크 여부 _ 북마크 삭제한 경우 : false', 
    })
    @Column({ default : 1 }) // 북마크 여부
    bookmarkStatus: boolean;
}