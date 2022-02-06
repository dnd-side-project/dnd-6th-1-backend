import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Boards } from "./boards.entity";

@Entity()
export class Likes extends BaseEntity {
    @PrimaryGeneratedColumn()
    likeId: number;

    @Column() // 작성자 아이디 
    userId: number;
    
    @ManyToOne(
        () => Boards,
        (board) => board.likes
    )
    @JoinColumn({name:"boardId"})
    boardId: number;

    @Column({ default : 1 }) // 북마크 여부
    likeStatus: boolean;
}