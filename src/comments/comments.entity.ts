import { ApiExtraModels, ApiHideProperty, ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { Boards } from "src/boards/entity/boards.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comments extends BaseEntity {
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 댓글 ID', 
    })
    @PrimaryGeneratedColumn()
    commentId: number;

    @ApiProperty({ 
        example: 21,
        description: '댓글을 작성한 유저 ID', 
    })
    @Column() // 누가 쓴건지
    userId: number;

    @ApiProperty({ 
        example: '아 전 남자친구 짜증나 진짜로',
        description: '댓글 내용', 
    })
    @Column()
    commentContent: string;

    @ApiProperty({ 
        example: true,
        description: '댓글 삭제 여부 _ 댓글 삭제된 경우 : false', 
    })
    @Column({ default : 1 }) // 댓글 삭제 여부 
    commentStatus: boolean;

    @ApiProperty({ 
        example: 1,
        description: '댓글인지 대댓글인지 _ 댓글: 0 / 대댓글: 1', 
    })
    @Column({ default : 0 }) // 부모인 경우 0
    class: number; // 부모, 자식 계층
    
    @ApiProperty({ 
        example: 8,
        description: '어떤 댓글에 속해있는지 구분하기 위한 댓글 그룹 ID \
        _ commentId=8 인 댓글과 해당 댓글의 대댓글은 모두 groupId=8을 갖는다.', 
    })
    @Column()
    groupId: number; // commentId 그대로 넣기 

    // Board(1) <> BoardImage(*)
    @ApiProperty({ 
        example: 18,
        description: '댓글이 등록된 게시글 번호 ID', 
    })
    @ManyToOne(
        () => Boards,
        (board) => board.comments
    )
    @JoinColumn({name:"boardId"})
    boardId: number;

    @ApiProperty({ 
        example: '2022-02-04 16:47:24',
        description: '댓글이 등록된 시간', 
    })
    @Column({ type: 'timestamp' })
    commentCreated: Date;
}