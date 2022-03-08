import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { Users } from 'src/auth/users.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DiaryImages } from 'src/diary-images/diary-images.entity';

@Entity()
export class Diaries extends BaseEntity {
    @ApiProperty({
      example: 1,
      description: '자동생성되는 다이어리 ID',
    })
    @PrimaryGeneratedColumn()
    diaryId: number;

    @ApiProperty({
      example: 21,
      description: '일기를 작성한 유저 ID',
    })
    @IsNotEmpty()
    @IsNumber()
    @ManyToOne(() => Users, (user) => user.diaries)
    @JoinColumn({ name: 'userId' })
    @Column() //작성자 아이디
    userId: number;

    @ApiProperty({
      example: '2022-02-02',
      description: '다이어리 글 날짜 (자동등록시간X)',
    })
    @Column({ type: 'date' }) // datetime은 날짜를 직접 입력, timestamp는 자동 입력
    date: string; // Date도 가능

    @ApiProperty({
      example: 1,
      description: '카테고리 번호',
    })
    @IsIn([1, 2, 3, 4, 5]) // class-validator
    @IsNotEmpty()
    @IsNumber()
    @Column()
    categoryId: number;

    @ApiProperty({
      example: '카톡 프로필 보니까 넘화남',
      description: '감정 선택 이유',
    })
    @IsNotEmpty()
    @Length(2, 20, { message: '2글자 이상 20자 미만으로 입력해주세요.' })
    @Column({ type: 'varchar', length: 40 })
    categoryReason: string;

    @ApiProperty({
      example: '오늘 헤어졌다',
      description: '다이어리 제목',
    })
    @IsNotEmpty()
    @Length(2, 20, { message: '2글자 이상 20자 미만으로 입력해주세요.' })
    @Column({ type: 'varchar', length: 40 })
    diaryTitle: string;

    @ApiProperty({
      example: '그자식 꼭 복수하고 만다. 잘먹고 잘살거야',
      description: '다이어리 내용',
    })
    @Column()
    diaryContent: string;

    // Diary(1) <> DiaryImage(*)
    @OneToMany(() => DiaryImages, (diaryImage) => diaryImage.diaryId)
    images: DiaryImages[];

    @ApiProperty({
      example: '2022-02-04 16:47:24',
      description: '다이어리 글이 등록된 시간',
    })
    @Column({ type: 'timestamp' })
    diaryCreated: Date;

    @ApiProperty({
      example: '2022',
      description: '다이어리 글 연도',
    })
    @Column({ type: 'int' }) // datetime은 날짜를 직접 입력, timestamp는 자동 입력
    year: number;

    @ApiProperty({
      example: '02',
      description: '다이어리 글 월',
    })
    @Column({ type: 'int' })
    month: number;

    @ApiProperty({
      example: '1',
      description: '다이어리 글 주',
    })
    @Column({ type: 'int' })
    week: number;

    @ApiProperty({
      example: true,
      description: '다이어리 글 삭제 여부 _ 삭제된 경우 : false',
    })
    @Column({ default: 1 }) // 글 삭제 여부
    diaryStatus: boolean;
}
