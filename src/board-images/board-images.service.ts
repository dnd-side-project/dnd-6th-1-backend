import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import { BoardImages } from './board-images.entity';
import { BoardImagesRepository } from './board-images.repository';
require("dotenv").config();

@Injectable()
export class BoardImagesService {
    constructor(
        @InjectRepository(BoardImagesRepository)
        private boardImagesRepository: BoardImagesRepository,
    ){}

    async uploadFile(files: Express.Multer.File[], temp){
        try {
            for(const element of files){
                const image = new BoardImages();
                image.originalName = element.originalname
                image.imageUrl = `${process.env.AWS_S3_URL}`+temp;
                await this.boardImagesRepository.save(image);
            }
        } catch (error) {
            Logger.error(error)
            throw new BadRequestException(error.message)
        }
    }
}
