import { EntityRepository, Repository } from "typeorm";
import { BadRequestException, Logger } from '@nestjs/common';
import { ProfileImage } from "./profile-image.entity";


@EntityRepository(ProfileImage)
export class ProfileImageRepository extends Repository<ProfileImage> {

    /*
    // 게시글 등록 시 boardImage DB에 이미지 저장
    async createProfileImage(files: Express.Multer.File[], boardId: number){
        try {
            if(files==null)
                return;
            for(const element of files){
                const image = new ProfileImage();
                image.originalName = element.originalname
                image.imageUrl = element['location']
                image.userId = boardId; 
                await this.save(image);
            }
        } catch (error) {
            Logger.error(error)
            throw new BadRequestException(error.message)
        }
    }
    */
}
