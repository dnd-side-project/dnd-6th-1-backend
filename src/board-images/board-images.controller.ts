import { Controller, Get, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BoardImagesService } from './board-images.service';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { FileInterceptor} from '@nestjs/platform-express';

const s3 = new AWS.S3();

let temp=""
@Controller('board-images')
export class BoardImagesController {
    constructor(
        private boardImagesService: BoardImagesService,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('file', {
      storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: function (request, file, cb) {
            temp = `${Date.now().toString()}-${file.originalname}`;
            console.log(file.ContentType)
            cb(null, temp);
        }
      })
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return await this.boardImagesService.uploadFile(file, temp);
    }
}
