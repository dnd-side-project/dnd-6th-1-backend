import { ApiProperty } from "@nestjs/swagger";
import { Users } from "src/users/users.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Histories extends BaseEntity{
    
    @ApiProperty({ 
        example: 1,
        description: '최근 검색어 ID', 
    })
    @PrimaryGeneratedColumn()
    historyId: number;

    @ApiProperty({ 
        example: '헤어진지 2주',
        description: '검색 키워드', 
        required: true
    })
    @Column()
    keyword: string;

    @ApiProperty({ 
        example: '2022-02-04 16:47:24',
        description: '검색어를 입력한 시간', 
    })
    @Column({ type:'timestamp'})
    keywordSearched: Date;

    @ApiProperty({ 
        example: true,
        description: '검색 기록 삭제 여부 _ 기록 삭제한 경우 : false', 
    })
    @Column({ default : 1 })
    historyStatus: boolean;

    @ApiProperty({ 
        example: 21,
        description: '검색한 유저 ID', 
    })
    @ManyToOne(
        () => Users,
        (user) => user.histories
    )
    @JoinColumn({ name: "userId" })
    @Column()
    userId: number;
}