import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { Users } from "src/users/users.entity";
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
        example: '2022',
        description: '레포트 글 연도', 
    })
    @IsNotEmpty()
    @IsNumber()
    @Column()        
    year: number;

    @ApiProperty({ 
        example: '1',
        description: '레포트 글 주', 
    })
    @IsNotEmpty()
    @IsNumber()
    @Column()         
    week: number;

    @ApiProperty({ 
        example: 1,
        description: '감정 등수', 
    })
    @IsNotEmpty()
    @IsNumber()
    @Column()        
    rank: number;

    @ApiProperty({ 
        example: 1,
        description: '카테고리 번호', 
    })
    @IsIn([1,2,3,4,5])
    @IsNotEmpty()
    @IsNumber()
    @Column()
    categoryId: number;

    @ApiProperty({ 
        example: 3,
        description: '감정 횟수', 
    })
    @IsNotEmpty()
    @IsNumber()
    @Column()        
    cnt: number;

    @ApiProperty({ 
        example: 4,
        description: '레포트가 만들어진 유저 ID', 
    })
    @IsNotEmpty()
    @IsNumber()
    @ManyToOne(
        () => Users,
        (user) => user.reports
    )
    @JoinColumn({name:"userId"})
    @Column() // 아이디 
    userId: number;
}