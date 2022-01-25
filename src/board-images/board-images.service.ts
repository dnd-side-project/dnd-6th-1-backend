import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { BoardImages } from './board-images.entity';
import { BoardImagesRepository } from './board-images.repository';
require("dotenv").config();

// AWS S3
const s3 = new AWS.S3();
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

@Injectable()
export class BoardImagesService {
    constructor(
        @InjectRepository(BoardImagesRepository)
        private boardImagesRepository: BoardImagesRepository,
    ){}

    getHello2():string{
        return 'hello2';
    }

    async uploadFile(file: Express.Multer.File, temp){
        const image = new BoardImages();
        image.originalName = file.originalname
        Logger.warn(image.originalName)
        try {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: temp
            }
            s3.getObject(params, function(err,data){
                if(err){
                    throw err;
                }
                console.log(data.ContentType);
            })
            let url = `${process.env.AWS_S3_URL}`+temp;
            console.log(url)
            image.imageUrl = url;
            return await this.boardImagesRepository.save(image);
        } catch (error) {
            Logger.error(error)
            throw new BadRequestException(error.message)
        }
    }
}
