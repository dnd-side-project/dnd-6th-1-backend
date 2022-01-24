import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as config from 'config';
import { BoardImages } from './board-images.entity';
import { BoardImagesRepository } from './board-images.repository';

// AWS S3
const fs = require('fs');
const s3 = new AWS.S3();
const s3Config = config.get('S3');
AWS.config.update({
  accessKeyId: s3Config.accessKey,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region
});


@Injectable()
export class BoardImagesService {
    constructor(
        @InjectRepository(BoardImagesRepository)
        private boardImagesRepository: BoardImagesRepository) {
        }

    getHello2():string{
        return 'hello2';
    }

    // async uploadFile(files: Express.Multer.File[]) {
    //     const uploadfiles = [];
    //     for (const element of files) {
    //     const file = new BoardImages();
    //     file.originalName = element.originalname
    //     file.imageUrl = element.path

    //     uploadfiles.push(file)
    //     }

    //     try {
    //         const data = await this.boardImagesRepository.save(uploadfiles);
    //         console.log(data);
    //         return data;
    //     } catch (error) {
    //         throw new BadRequestException(error.message)
    //     }
    // }

    async uploadFile(file: Express.Multer.File){
        const image = new BoardImages();
        image.originalName = file.originalname
        Logger.warn(image.originalName)
        try {
            const params = {
                Bucket:s3Config.bucketName,
                Key:image.originalName
            }
            await s3.getObject(params, function(err,data){
                if(err){
                    throw err;
                }
                console.log(data);
            })
            const data = await this.boardImagesRepository.save(image);
            console.log(data);
            return data;
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
    // s3에 먼저 올리고 해당 url을 rds db에 저장해야 함
}