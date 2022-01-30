import { BoardImages } from "src/board-images/board-images.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Boards extends BaseEntity {
    @PrimaryGeneratedColumn()
    boardId: number;

    @Column()
    categoryName: string;

    @Column({type: 'varchar', length: 10}) 
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