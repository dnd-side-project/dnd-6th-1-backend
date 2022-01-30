import { EntityRepository, Repository } from "typeorm";
import { BadRequestException, Logger } from '@nestjs/common';
import { BoardImages } from "src/board-images/board-images.entity";


@EntityRepository(BoardImages)
export class BoardImagesRepository extends Repository<BoardImages> {

    // 게시글 등록 시 boardImage DB에 이미지 저장
    async createBoardImage(files: Express.Multer.File[], boardId: number){
        try {
            if(files==null)
                return;
            for(const element of files){
                const image = new BoardImages();
                image.originalName = element.originalname
                image.imageUrl = element['location']
                image.boardId = boardId; 
                await this.save(image);
            }
        } catch (error) {
            Logger.error(error)
            throw new BadRequestException(error.message)
        }
    }
}
