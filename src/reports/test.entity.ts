import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { Users } from "src/users/users.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tested extends BaseEntity {
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 레포트 ID', 
    })
    @PrimaryGeneratedColumn()
    testId: number;

    @Column()
    title: string;

    @Column()
    created: Date;

    
    @ApiProperty({ 
        example: 21,
        description: '게시글을 작성한 유저 ID', 
    })
    @IsNotEmpty()
    @IsNumber()
    @ManyToOne(
        () => Users,
        (user) => user.tests
    )
    @JoinColumn({name:"userId"})
    @Column() //작성자 아이디 
    userId: number;
}
