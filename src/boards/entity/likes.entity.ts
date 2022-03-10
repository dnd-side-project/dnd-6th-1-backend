import { ApiProperty } from "@nestjs/swagger";
import { Users } from "src/users/users.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Boards } from "./boards.entity";

@Entity()
export class Likes extends BaseEntity {
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 좋아요 ID', 
    })
    @PrimaryGeneratedColumn()
    likeId: number;

    @ApiProperty({ 
        example: 1,
        description: '좋아요한 유저 ID', 
    })
    @ManyToOne(
        () => Users,
        (user) => user.likes
    )
    @JoinColumn({name:"userId"})
    @Column() // 작성자 아이디 
    userId: number;
    
    @ApiProperty({ 
        example: 21,
        description: '좋아요한 게시글 ID', 
    })
    @ManyToOne(
        () => Boards,
        (board) => board.likes
    )
    @JoinColumn({name:"boardId"})
    @Column()
    boardId: number;

    @ApiProperty({ 
        example: true,
        description: '좋아요 여부 _ 좋아요 삭제한 경우 : false', 
    })
    @Column({ default : 1 }) // 좋아요 여부
    likeStatus: boolean;
}