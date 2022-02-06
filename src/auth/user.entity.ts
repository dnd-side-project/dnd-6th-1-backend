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
        (like) => like.boardId
    )
    likes: Likes[];
}