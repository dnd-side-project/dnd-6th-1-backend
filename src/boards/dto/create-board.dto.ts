import { IsNotEmpty } from "class-validator";

export class CreateBoardDto {

    @IsNotEmpty()
    categoryName: string;

    @IsNotEmpty()
    postTitle: string;

    @IsNotEmpty()
    postContent: string;

    
}