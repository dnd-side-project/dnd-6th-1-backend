// import { Controller, Get, Logger, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
// import { BoardImagesService } from './board-images.service';
// import * as AWS from 'aws-sdk';
// import * as multerS3 from 'multer-s3';
// import { FileInterceptor} from '@nestjs/platform-express';

// // AWS S3
// const s3 = new AWS.S3();
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION
// });

// let temp=""
// @Controller('board-images')
// export class BoardImagesController {
//     constructor(
//         private boardImagesService: BoardImagesService,
//     ) {}
        
//     @Get()
//     async getHello2(){
//         Logger.warn("hi");
//         return this.boardImagesService.getHello2();
//     }

//     @Post()
//     @UseInterceptors(FileInterceptor('file', {
//       storage: multerS3({
//         s3: s3,
//         bucket: process.env.AWS_S3_BUCKET_NAME,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         acl: 'public-read',
//         key: function (request, file, cb) {
//             temp = `${Date.now().toString()}-${file.originalname}`;
//             console.log(file.ContentType)
//             cb(null, temp);
//         }
//       })
//     }))
//     async uploadFile(@UploadedFile() file: Express.Multer.File) {
//         return await this.boardImagesService.uploadFile(file, temp);
//     }
// }
