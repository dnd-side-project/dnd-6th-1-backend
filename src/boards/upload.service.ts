import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as AWS from 'aws-sdk';
import { BoardImagesRepository } from "src/board-images/board-images.repository";
require("dotenv").config();

const s3 = new AWS.S3();

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
            s3ImageUrl = `${process.env.AWS_S3_URL}/boardImages/${s3ImageName}`;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME+'/boardImages',
                Key: s3ImageName,
                Body: files[i].buffer, // buffer로 해야 잘 올라감
                ACL: 'public-read', // bucket에 조회 public 권한
                ContentType: files[i].mimetype
            };
            
            await s3.putObject(params).promise();
            await this.boardImagesRepository.createBoardImage(s3ImageName, s3ImageUrl, files[i], boardId);   
        }
    }

    // flag=0으로 바꿔주고 이미지 재업로드 후 디비에 저장
    async updateFile(files: Express.Multer.File[], boardId: number) {
        await this.deleteFile(boardId); // 기존의 boardImage에 boardId 에 해당하는 이미지명을 s3에서 찾아서 삭제하고 
        // flag=0으로 바꿔주고 
        await this.boardImagesRepository.deleteImages(boardId);
        await this.uploadFile(files, boardId); // 이미지 재업로드
    }

    async deleteFile(boardId: number){ // 수정할 때 어차피 삭제도 해야 함. 
        // 기존의 boardImage에 boardId 에 해당하는 이미지명을 s3에서 찾아서 삭제하고 
        const images = await this.boardImagesRepository.findByBoardId(boardId);
        const imageObject = new Array();

        for(var i=0;i<images.length;i++){
            imageObject[i]={
                Key: `boardImages/${images[i].uploadedName}` // 키가 폴더까지 포함하고 있어야 함
            }
        }
 
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME, // 얘는 버킷 이름 그대로
            Delete: {
                Objects: imageObject,
                Quiet: false
            }
        };

        await s3.deleteObjects(params).promise();
        await this.boardImagesRepository.deleteImages(boardId);
    }
}