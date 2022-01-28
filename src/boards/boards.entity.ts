import { BoardImages } from "src/board-images/board-images.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

// @Entity()
// export class Boards extends BaseEntity {
//     @PrimaryGeneratedColumn()
//     boardId: number;

//     // @Column()
//     // userId: number;

//     // ! 연산자는 컴파일러에게 "변수x는 무조건 값이 할당되어 있으므로 걱정말고 사용하면 된다고 주장
//     @Column()
//     categoryName: string;

//     @Column({type: 'varchar', length: 80}) // 40 byte 제한
//     postTitle: string;

//     @Column()
//     postContent: string;

//     // Board(1) <> BoardImage(*)
//     @OneToMany(
//         () => BoardImages,
//         (boardImage) => boardImage.boardId
//     )
//     images: BoardImages[];
// }

@Entity()
export class Boards extends BaseEntity {
    @PrimaryGeneratedColumn()
    boardId: number;

    @Column()
    categoryName: string;

    @Column({type: 'varchar', length: 80}) 
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