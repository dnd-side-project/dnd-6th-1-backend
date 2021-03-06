import { EntityRepository, Repository } from "typeorm";
import { BoardImages } from "src/board-images/board-images.entity";

@EntityRepository(BoardImages)
export class BoardImagesRepository extends Repository<BoardImages> {

    // 게시글 등록 시 boardImage DB에 이미지 저장
    async createBoardImage(uploadedName: string, imageUrl: string, file: Express.Multer.File, boardId: number){
        const image = {
            imageUrl,
            originalName: file.originalname,
            uploadedName,
            boardId 
        }
        await this.save(image);
    }

    async findByBoardId(boardId: number){
        return await this.createQueryBuilder("boardImage")
            .select("boardImage.uploadedName")
            .where("boardImage.boardId =:boardId", {boardId})
            .getMany();
    }

    // 이미지 삭제 imageStatus = false 로 변경
    async deleteImages(boardId: number) {
        await this.update({boardId}, {imageStatus: false});
    }
}
