import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { Users } from "src/auth/users.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Reports extends BaseEntity {
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 레포트 ID', 
    })
    @PrimaryGeneratedColumn()
    reportId: number;

    @ApiProperty({ 
        example: 4,
        description: '레포트가 만들어진 유저 ID', 
    })
    @IsNotEmpty()
    @IsNumber()
    @ManyToOne(
        () => Users,
        (user) => user.diaries
    )
    @JoinColumn({name:"userId"})
    @Column() //작성자 아이디 
    userId: number;

    @ApiProperty({ 
        example: 1,
        description: '카테고리 번호', 
    })
    @IsIn([1,2,3,4,5])      // class-validator
    @IsNotEmpty()
    @IsNumber()
    @Column()
    categoryId: number;

    @ApiProperty({ 
        example: 3,
        description: '감정 횟수', 
    })
    @Column({ type:'int' })        
    cnt: number;

    @ApiProperty({ 
        example: 1,
        description: '감정 등수', 
    })
    @Column({ type:'int' })        
    rank: number;

    @ApiProperty({ 
        example: '2022',
        description: '레포트 글 연도', 
    })
    @Column({ type:'int' })        
    year: number;

    @ApiProperty({ 
        example: '02',
        description: '레포트 글 월', 
    })
    @Column({ type:'int' })         
    month: number;

    @ApiProperty({ 
        example: '1',
        description: '레포트 글 주', 
    })
    @Column({ type:'int' })         
    week: number;
}