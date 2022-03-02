import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class CreateReportDto {
    @ApiProperty({
      example: 1,
      description: '카테고리 번호 _ 1:부정/2:분노/3:타협/4:슬픔/5:수용',
      required: true,
    })
    @IsIn(['1', '2', '3', '4', '5'])
    @IsNotEmpty()
    @IsString()
    readonly categoryId: string;

    @ApiProperty({
      example: 3,
      description: '감정 횟수',
    })
    @Column({ type: 'int' })
    cnt: number;

    @ApiProperty({
      example: 1,
      description: '감정 등수',
    })
    @Column({ type: 'int' })
    rank: number;

    @ApiProperty({
      example: '2022',
      description: '레포트 글 연도',
    })
    @Column({ type: 'int' })
    year: number;

    @ApiProperty({
      example: '02',
      description: '레포트 글 월',
    })
    @Column({ type: 'int' })
    month: number;

    @ApiProperty({
      example: '1',
      description: '레포트 글 주',
    })
    @Column({ type: 'int' })
    week: number;
}
