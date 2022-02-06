import { Bookmarks } from "src/boards/entity/bookmarks.entity";
import { Likes } from "src/boards/entity/likes.entity";
import { BaseEntity, Column, PrimaryGeneratedColumn, Unique, Entity, OneToMany } from "typeorm";


@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    
    // itzza
    // userId, email, password, nickname, userStatus, breakupDate
    @PrimaryGeneratedColumn()
    userId: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    nickname: string;

    @Column()
    userStatus: boolean;

    @Column({ default : 0 })
    loginStatus: boolean;

    @Column()
    breakupDate: string;

    @Column()
    profileImage: string;

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
}