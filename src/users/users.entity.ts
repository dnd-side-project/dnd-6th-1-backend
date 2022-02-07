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

    @Column({ default : 0 })
    loginStatus: boolean;

    @Column()
    breakupDate: string;

<<<<<<< HEAD:src/users/users.entity.ts
    @Column({ default: false })
    loginStatus: boolean;

    // 프로필 이미지 추가해야함
=======
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
>>>>>>> a27003bd552940b7dbe86bb6f77f92a6850924a1:src/auth/user.entity.ts
}