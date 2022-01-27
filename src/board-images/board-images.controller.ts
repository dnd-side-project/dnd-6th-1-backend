import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BoardImagesService } from './board-images.service';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { FilesInterceptor} from '@nestjs/platform-express';

const s3 = new AWS.S3();

let temp=""
@Controller('board-images')
export class BoardImagesController {
    constructor(
        private boardImagesService: BoardImagesService,
    ) {}

    @Post()
    @UseInterceptors(FilesInterceptor('files', 3, {
      storage: multerS3({ 
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        key: function (request, file, cb) { // files  for문 돌듯이 먼저 실행
            temp = `${Date.now().toString()}-${file.originalname}`; // 파일 올리면 해당 파일의 이름을 받아옴 -> S3에 저장되는 이름
            cb(null, temp); // 이게 뭘까?            
        }
      })
    }))
    async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
        return await this.boardImagesService.uploadFile(files, temp);
    }
}
