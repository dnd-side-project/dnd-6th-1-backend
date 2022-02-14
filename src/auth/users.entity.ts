import { Boards } from "src/boards/entity/boards.entity";
import { Bookmarks } from "src/boards/entity/bookmarks.entity";
import { Likes } from "src/boards/entity/likes.entity";
import { ProfileImage} from "src/profile-image/profile-image.entity";
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

    /*
    @OneToOne(type => ProfileImage, profileImage => profileImage.userId)
    // @Column({default: S3 URL~~~})
    @JoinColumn()
    profileImage: ProfileImage

    // S3에 올려놓고 URI 디폴트로 넣어주기
    */

    @Column()
    profileImage: string;

    // User(1) <> Likes(*)
    @OneToMany(
        () => Boards,
        (board) => board.userId
    )
    boards: Boards[];

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