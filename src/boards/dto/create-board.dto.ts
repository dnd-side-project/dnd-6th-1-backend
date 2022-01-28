import { IsNotEmpty, IsString } from "class-validator";

export class CreateBoardDto {

    @IsNotEmpty()
    @IsString()
    categoryName: string;

    @IsNotEmpty()
    postTitle: string;

    @IsNotEmpty()
    postContent: string;
}