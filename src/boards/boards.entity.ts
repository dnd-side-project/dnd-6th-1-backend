import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Boards extends BaseEntity {
    @PrimaryGeneratedColumn()
    boardId: number;

    // @Column()
    // userId: number;

    @Column()
    categoryName: string;

    @Column()
    postTitle: string;

    @Column()
    postContent: string;
}