import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as AWS from 'aws-sdk';
import { BoardImagesRepository } from "src/board-images/board-images.repository";
require("dotenv").config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

@Injectable()
export class UploadService {
    constructor(
        @InjectRepository(BoardImagesRepository) 
            private boardImagesRepository: BoardImagesRepository,    
    ){}

    async uploadFile(files: Express.Multer.File[], boardId: number) { // 파일 업로드
        let s3ImageUrl = "";
        for(var i=0;i<files.length;i++){
            let s3ImageName = `${Date.now()}-${files[i].originalname}`;
            s3ImageUrl = `${process.env.AWS_S3_URL}/image/${s3ImageName}`;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME+'/image',
                Key: s3ImageName,
                Body: files[i].buffer, // buffer로 해야 잘 올라감
                ACL: 'public-read', // bucket에 조회 public 권한
                ContentType: files[i].mimetype
            };
            
            await s3.putObject(params).promise();
            await this.boardImagesRepository.createBoardImage(s3ImageName, s3ImageUrl, files[i], boardId);   
        }
    }

}