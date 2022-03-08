import { EntityRepository, Repository } from "typeorm";
import { DiaryImages } from "src/diary-images/diary-images.entity";



@EntityRepository(DiaryImages)
export class DiaryImagesRepository extends Repository<DiaryImages> {

    // 게시글 등록 시 diaryImage DB에 이미지 저장
    async createDiaryImage(uploadedName: string, imageUrl: string, file: Express.Multer.File, diaryId: number){
        const image = {
            imageUrl,
            originalName: file.originalname,
            uploadedName,
            diaryId
        }
        await this.save(image);
    }

    async findByDiaryId(diaryId: number){
        return await this.createQueryBuilder("diaryImage")
            .select("diaryImage.uploadedName")
            .where("diaryImage.diaryId =:diaryId", {diaryId})
            .andWhere("diaryImage.imageStatus=:status", {status: true})
            .getMany();
    }

    // 이미지 삭제 imageStatus = false 로 변경
    async deleteImages(diaryId: number) {
        await this.update({diaryId}, {imageStatus: false});
    }
}
