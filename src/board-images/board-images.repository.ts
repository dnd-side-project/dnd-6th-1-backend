import { CreateBoardDto } from "src/boards/dto/create-board.dto";
import { EntityRepository, Repository } from "typeorm";
import { BoardImages } from "./board-images.entity";

@EntityRepository(BoardImages)
export class BoardImagesRepository extends Repository<BoardImages> {

    // async createImage(boardId: number, createBoardDto: CreateBoardDto){
    //     const { images } = createBoardDto;

    //     console.log(images);
    //     const boardImage = this.create({
    //         boardId
    //     })

    //     await this.save(boardImage);
    //     // return boardImage;
    // }
}

// : Promise<BoardImages> 