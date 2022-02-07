import { BaseEntity, Column, PrimaryGeneratedColumn, Unique, Entity } from "typeorm";


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

    // 프로필 이미지 추가해야함
}