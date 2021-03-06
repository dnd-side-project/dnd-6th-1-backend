import { Boards } from "src/boards/entity/boards.entity";
import { Bookmarks } from "src/boards/entity/bookmarks.entity";
import { Histories } from "src/histories/histories.entity";
import { Likes } from "src/boards/entity/likes.entity";
import { Diaries } from "src/diaries/entity/diaries.entity";
import { BaseEntity, Column, PrimaryGeneratedColumn, Unique, Entity, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Reports } from "src/reports/reports.entity";

@Entity()
@Unique(['email'])
export class Users extends BaseEntity {

    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ type: 'varchar', length: 200})
    email: string;

    @Column()
    password: string;

    @Column()
    accessToken: string;

    @Column({ type: 'varchar', length: 200})
    nickname: string;

    @Column({ default: true })
    userStatus: boolean;

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

    // User(1) <> Reports(*)
    @OneToMany(
        () => Reports,
        (report) => report.userId
    )
    reports: Reports[];
}
