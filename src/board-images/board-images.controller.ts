import { Body, Controller, Get, Logger, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BoardImagesService } from './board-images.service';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import * as config from 'config';
import { FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import { fstat } from 'fs';

// AWS S3
const s3 = new AWS.S3();
const s3Config = config.get('S3');
AWS.config.update({
  accessKeyId: s3Config.accessKey,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region
});


@Controller('board-images')
export class BoardImagesController {
    constructor(private boardImagesService: BoardImagesService) { }

    @Get()
    async getHello2(){
        Logger.warn("hi");
        return this.boardImagesService.getHello2();
    }

    // @Post()
    // @UseInterceptors(FilesInterceptor('file', 3, {
    //   storage: multerS3({
    //     s3: s3,
    //     bucket: s3Config.bucketName,
    //     acl: 'public-read',
    //     key: function (req, file, cb) {
    //       cb(null, `${Date.now().toString()}-${file.originalname}`);
    //     }
    //   })
    // }))
    // async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    //     Logger.warn('hello2')
    //     return this.boardImagesService.uploadFile(files);
    // }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
      storage: multerS3({
        s3: s3,
        bucket: s3Config.bucketName,
        acl: 'public-read',
        key: function (request, file, cb) {
          cb(null, `${Date.now().toString()}-${file.originalname}`);
        }
      })
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return await this.boardImagesService.uploadFile(file);
    }
  }