import { Injectable } from "@nestjs/common";
import * as AWS from 'aws-sdk';
require("dotenv").config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

@Injectable()
export class UploadService {
    async uploadFile(file) { // 파일 업로드
        for(var i=0;i<file.length;i++){
            let s3ImageName = `image/${Date.now()}-${file[i].originalname}`;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: s3ImageName,
                Body: file[i].buffer, // buffer로 해야 잘 올라감
                ACL: 'public-read', // bucket에 조회 public 권한
                ContentType: file[i].mimetype
            };
            
            try {
                const s = await s3.putObject(params).promise();
                console.log('Image Saved Successfully.');
            } catch (err) {
                console.log(err);
            }
        }
    }

}