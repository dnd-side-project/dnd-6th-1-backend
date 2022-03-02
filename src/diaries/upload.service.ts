import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as AWS from 'aws-sdk';
import { DiaryImagesRepository } from "src/diary-images/diary-images.repository";
require("dotenv").config();

const s3 = new AWS.S3();

@Injectable()
export class UploadService {
    constructor(
        @InjectRepository(DiaryImagesRepository) 
            private diaryImagesRepository: DiaryImagesRepository,
    ){}

    async findByDiaryImageId(diaryId: number) {
        const images = await this.diaryImagesRepository.findByDiaryId(diaryId);
        if(!images) {
            const message = "empty images";
            return message;
        }
    }

    async uploadFiles(files: Express.Multer.File[], diaryId: number) { // 파일 업로드
        let s3ImageUrl = "";
        for(var i=0;i<files.length;i++){
            let s3ImageName = `${Date.now()}-${files[i].originalname}`;
            s3ImageUrl = `${process.env.AWS_S3_URL}diaryImages/${s3ImageName}`;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME+'/diaryImages',
                Key: s3ImageName,
                Body: files[i].buffer, // buffer로 해야 잘 올라감
                ACL: 'public-read', // bucket에 조회 public 권한
                ContentType: files[i].mimetype
            };
            
            await s3.putObject(params).promise();
            await this.diaryImagesRepository.createDiaryImage(s3ImageName, s3ImageUrl, files[i], diaryId);   
        }
    }

    // flag=0으로 바꿔주고 이미지 재업로드 후 디비에 저장
    async updateFiles(files: Express.Multer.File[], diaryId: number) {
        await this.deleteFiles(diaryId); // 기존의 boardImage에 boardId 에 해당하는 이미지명을 s3에서 찾아서 삭제하고 
        // flag=0으로 바꿔주고 
        await this.diaryImagesRepository.deleteImages(diaryId);
        await this.uploadFiles(files, diaryId); // 이미지 재업로드
    }


    async deleteFiles(diaryId: number){ // 수정할 때 어차피 삭제도 해야 함. 
        // 기존의 boardImage에 boardId 에 해당하는 이미지명을 s3에서 찾아서 삭제하고 
        const images = await this.diaryImagesRepository.findByDiaryId(diaryId);

        const imageObject = new Array();

        if(images.length == 0) // 이미지 없는 경우 그냥 리턴
            return ;

        for(var i=0;i<images.length;i++){
            imageObject[i]={
                Key: `diaryImages/${images[i].uploadedName}` // 키가 폴더까지 포함하고 있어야 함
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
        await this.diaryImagesRepository.deleteImages(diaryId);
    }
}