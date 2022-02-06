import { BoardImages } from "src/board-images/board-images.entity";
import { Comments } from "src/comments/comments.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Boards extends BaseEntity {
    @PrimaryGeneratedColumn()
    boardId: number;

    @Column() //작성자 아이디 
    userId: number;
    
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

    // Board(1) <> Comments(*)
    @OneToMany(
        () => Comments,
        (comment) => comment.boardId
    )
    comments: Comments[];

    @Column({ type:'timestamp'})
    postCreated: Date;

    @Column({ default : 1 }) // 글 삭제 여부 
    postStatus: boolean;
}