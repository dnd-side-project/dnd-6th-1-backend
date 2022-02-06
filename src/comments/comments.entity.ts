import { Boards } from "src/boards/entity/boards.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comments extends BaseEntity {
    @PrimaryGeneratedColumn()
    commentId: number;

    @Column() // 누가 쓴건지
    userId: number;

    @Column()
    commentContent: string;

    @Column({ default : 1 }) // 댓글 삭제 여부 
    commentStatus: boolean;

    @Column({ default : 0 }) // 부모인 경우 0
    class: number; // 부모, 자식 계층
    
    @Column()
    groupId: number; // commentId 그대로 넣기 

    // Board(1) <> BoardImage(*)
    @ManyToOne(
        () => Boards,
        (board) => board.comments
    )
    @JoinColumn({name:"boardId"})
    boardId: number;

    @Column({ type: 'timestamp' })
    commentCreated: Date;
}