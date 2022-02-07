import { Bookmarks } from "src/boards/entity/bookmarks.entity";
import { Likes } from "src/boards/entity/likes.entity";
import { BaseEntity, Column, PrimaryGeneratedColumn, Unique, Entity, OneToMany } from "typeorm";


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