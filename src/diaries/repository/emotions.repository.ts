import { Entity, EntityRepository, Repository } from "typeorm";
import { Diaries } from "../entity/diaries.entity";
import { CreateDiaryDto } from "../dto/create-diary.dto"; 
import { UpdateDiaryDto } from "../dto/update-diary.dto";
import { Emotions } from "../entity/emotions.entity";



@EntityRepository(Emotions)
export class EmotionsRepository extends Repository <Emotions> {
    
    async getAllEmotions() {
        return await this.find();
    }


    async findByEmotionName(emotionName: string){ 
        const emotion = await this.createQueryBuilder("emotions")
            .where("emotions.emotionName=:emotionName", {emotionName})
            .getOne();

        return emotion;
    }

}