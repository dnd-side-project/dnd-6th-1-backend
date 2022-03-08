import { IsEmail } from "class-validator";
import { Boards } from "src/boards/entity/boards.entity";
import { Bookmarks } from "src/boards/entity/bookmarks.entity";
import { Histories } from "src/boards/entity/histories.entity";
import { Likes } from "src/boards/entity/likes.entity";
import { Diaries } from "src/diaries/entity/diaries.entity";
import { BaseEntity, Column, PrimaryGeneratedColumn, Unique, Entity, OneToMany, OneToOne, JoinColumn } from "typeorm";


@Entity()
@Unique(['email'])
export class Users extends BaseEntity {

    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ type: 'varchar', length: 200})
    email: string;

    @Column()
    password: string;

    @Column({ type: 'varchar', length: 200})
    nickname: string;

    @Column({ default: true })
    userStatus: boolean;

    @Column()
    breakupDate: string;

    @Column({ default: false })
    loginStatus: boolean;

    @Column()
    profileImage: string;

    // User(1) <> Boards(*)
    @OneToMany(
        () => Boards,
        (board) => board.userId
    )
    boards: Boards[];


    // User(1) <> Diaries(*)
    @OneToMany(
        () => Diaries,
        (diary) => diary.userId
    )
    diaries: Diaries[];



    // User(1) <> Likes(*)
    @OneToMany(
        () => Likes,
        (like) => like.userId
    )
    likes: Likes[];

    // User(1) <> Bookmarks(*)
    @OneToMany(
        () => Bookmarks,
        (bookmark) => bookmark.userId
    )
    bookmarks: Bookmarks[];

    // User(1) <> Histories(*)
    @OneToMany(
        () => Histories,
        (history) => history.userId
    )
    histories: Histories[];
}
