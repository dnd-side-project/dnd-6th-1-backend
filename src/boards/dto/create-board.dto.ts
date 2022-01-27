import { IsNotEmpty, IsString } from "class-validator";
import { BoardImages } from "src/board-images/board-images.entity";

export class CreateBoardDto {

    @IsNotEmpty()
    @IsString()
    categoryName: string;

    @IsNotEmpty()
    postTitle: string;

    @IsNotEmpty()
    postContent: string;

    images: BoardImages[];
}