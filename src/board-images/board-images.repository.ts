import { EntityRepository, Repository } from "typeorm";
import { BadRequestException, Logger } from '@nestjs/common';
import { BoardImages } from "src/board-images/board-images.entity";


@EntityRepository(BoardImages)
export class BoardImagesRepository extends Repository<BoardImages> {

    // 게시글 등록 시 boardImage DB에 이미지 저장
    async createBoardImage(files: Express.Multer.File[], boardId: number){
        if(files==null)
            return;
        for(const element of files){
            // const image = new BoardImages();
            console.log(element);
            const image = {
                imageUrl: element['location'],
                originalName: element.originalname,
                uploadedName: element['location'].split('images/')[1],
                boardId 
            }

            // image.imageUrl = element['location']
            // image.originalName = element.originalname
            // image.uploadedName = element['location'].split('boardImages/')[1];
            // image.boardId = boardId; 
            await this.save(image);
        }
    }

    // 게시글 수정 시 boardImage 처리 
}
