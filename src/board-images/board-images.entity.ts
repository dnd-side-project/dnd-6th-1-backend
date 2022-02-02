import { Boards } from "src/boards/boards.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class BoardImages extends BaseEntity{
    @PrimaryGeneratedColumn()
    boardImageId: number;

    @Column()
    originalName: string;

    @Column()
    imageUrl: string;

    // Board(1) <> BoardImage(*)
    @ManyToOne(
        () => Boards,
        (board) => board.images
    )
    @JoinColumn({name:"boardId"})
    boardId: number;
}