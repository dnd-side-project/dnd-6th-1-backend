import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity()
export class Emotions extends BaseEntity {
  @ApiProperty({
    example: 1,
    description: '자동생성되는 감정 ID',
  })
  @PrimaryGeneratedColumn()
  Id: number;


  @ApiProperty({
    example: '화남이',
    description: '감정이름',
  })
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 40 })
  emotionName: string;

  @ApiProperty({
    example: 'Angry',
    description: '감정이름(영)',
  })
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 40 })
  engName: string;


  @ApiProperty({
    example: '4',
    description: '4',
  })
  @IsIn([0, 1,2,3,4,5])
  @Column({ type: 'int' })
  grade: number;

  @ApiProperty({
    example: '공격력만땅',
    description: '감정이 특징',
  })
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 40 })
  summary: string;

  @ApiProperty({
    example: '머리가 텅텅해지고 근육이 빵빵해지는~ ~',
    description: '감정이 소개말',
  })
  @IsNotEmpty()
  @Column()
  character: string;

  @ApiProperty({
    example: 'http:~/hi.png',
    description: '이미지가 저장되는 s3 경로', 
  })
  @Column()
  imageUrl: string;

}
