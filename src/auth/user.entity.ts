import { BaseEntity, Column, PrimaryGeneratedColumn, Unique, Entity } from "typeorm";


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

    @Column()
    breakupDate: string;

    @Column()
    profileImage: string;

    // 프로필 이미지 추가해야함
}