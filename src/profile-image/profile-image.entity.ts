import { ApiProperty } from "@nestjs/swagger";
import { Users } from "src/auth/users.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class ProfileImage extends BaseEntity{
    @ApiProperty({ 
        example: 1,
        description: '자동생성되는 유저 프로필 이미지 ID', 
    })
    @PrimaryGeneratedColumn()
    profileImageId: number;

    @ApiProperty({ 
        example: 'hi.png',
        description: '이미지 원본 파일명', 
    })
    @Column()
    originalName: string;

    @ApiProperty({ 
        example: 'http:~/hi.png',
        description: '이미지가 저장되는 s3 경로', 
    })
    @Column()
    imageUrl: string;

/*
    // User(1) <> UserImage(1)
    @ApiProperty({ 
        example: 21,
        description: '본 이미지가 첨부된 유저 ID', 
    })
    @OneToOne(()=> Users, users=>users.profileImage)
    @JoinColumn()
    userId: number;
    */
}