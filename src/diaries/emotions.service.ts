import { Injectable } from '@nestjs/common';
import { EmotionsRepository} from './repository/emotions.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Emotions } from "./entity/emotions.entity";



@Injectable()
export class EmotionsService {
    constructor(
        @InjectRepository(EmotionsRepository)
            private emotionsRepository: EmotionsRepository,
    ) {}

   
    async getAllEmotions(): Promise <Emotions[]> {
        return this.emotionsRepository.find();
    }

    async findByEmotionName(emotionName: string) {
        const emotions = await this.getAllEmotions();
        //const emotions = await this.emotionsRepository.findByEmotionName(emotionName);
        //console.log(emotions, emotionName);
        const emotion = emotions.filter(emotion => emotion.emotionName == emotionName)
        console.log(emotion);
        return emotion;
    }
}
