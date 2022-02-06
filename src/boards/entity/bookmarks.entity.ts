import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bookmarks extends BaseEntity {
    @PrimaryGeneratedColumn()
    bookmarkId: number;

    @Column() // 작성자 아이디 
    userId: number;
    
    @Column() // 게시물 아이디
    boardId: number;

    @Column({ default : 1 }) // 북마크 여부
    bookmarkStatus: boolean;
}