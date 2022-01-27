import { Boards } from "src/boards/boards.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class BoardImages extends BaseEntity{
    @PrimaryGeneratedColumn()
    boardImageId: number;

    @Column()
    boardId: number;

    @Column()
    originalName: string;

    @Column()
    imageUrl: string;

    // Board(1) <> BoardImage(*)
    @ManyToOne(
        () => Boards,
        (board) => board.images
    )
    board: Boards;
}