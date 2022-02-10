// import { ApiProperty, PickType } from "@nestjs/swagger";
// import { IsIn, IsNotEmpty, IsString, Length } from "class-validator";
// import { Boards } from "../entity/boards.entity";

// // export class CreateBoardFirstDto extends PickType(Boards, [
// //     'userId',
// //     'categoryName',
// //     'postTitle',
// //     'postContent'
// // ] as const) {}

// // postman 으로 테스트 할 때는 userId 를 text로 밖에 못받아서 string 으로 선언함
// export class CreateBoardFirstDto {
//     @ApiProperty({ 
//         example: 21,
//         description: '작성자 userId', 
//         required: true
//     })
//     @IsNotEmpty()
//     @IsString()
//     readonly userId: string; // 작성자

//     @ApiProperty({ 
//         example: '타협',
//         description: '카테고리명', 
//         required: true
//     })
//     @IsIn(['부정','화','타협','슬픔','수용'])
//     @IsNotEmpty()
//     @IsString()
//     readonly categoryName: string;

//     @ApiProperty({ 
//         example: '제자신과 타협하겠습니다',
//         description: '글 제목', 
//         required: true
//     })
//     @IsNotEmpty()
//     @Length(2,20, { message : '2글자 이상 20자 미만으로 입력해주세요.'}) // 영어로하나 한글로하나 똑같더라고요
//     readonly postTitle: string;

//     @ApiProperty({ 
//         example: '제자신과 타협하는 본문',
//         description: '글 본문', 
//         required: true
//     })
//     @IsNotEmpty()
//     readonly postContent: string;
// }