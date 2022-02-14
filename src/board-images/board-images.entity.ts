import { ApiProperty } from "@nestjs/swagger";
import { Boards } from "src/boards/entity/boards.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class BoardImages extends BaseEntity{
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 게시글 이미지 ID', 
    })
    @PrimaryGeneratedColumn()
    boardImageId: number;

    @ApiProperty({ 
        example: 'hi.png',
        description: '이미지 원본 파일명', 
    })
    @Column()
    originalName: string;

    @ApiProperty({ 
        example: '123123-hi.png',
        description: '이미지 업로드 파일명', 
    })
    @Column()
    uploadedName: string;

    @ApiProperty({ 
        example: 'http:~/hi.png',
        description: '이미지가 저장되는 s3 경로', 
    })
    @Column()
    imageUrl: string;

    @Column({ default : 1 }) // 이미지 삭제 여부
    imageStatus: boolean;

    // Board(1) <> BoardImage(*)
    @ApiProperty({ 
        example: 21,
        description: '본 이미지가 첨부된 게시글 ID', 
    })
    @ManyToOne(
        () => Boards,
        (board) => board.images
    )
    @JoinColumn({name:"boardId"})
    boardId: number;
}