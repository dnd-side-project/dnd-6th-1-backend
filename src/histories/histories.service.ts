import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoriesRepository } from './histories.repository';

@Injectable()
export class HistoriesService {
    constructor(
        @InjectRepository(HistoriesRepository)
            private historiesRepository: HistoriesRepository,
    ) {}

    async findByKeyword(userId: number, keyword: string){
        const existedKeyword = await this.historiesRepository.findByKeyword(keyword);
        if(existedKeyword)
            await this.historiesRepository.updateHistory(existedKeyword);
        else 
            await this.historiesRepository.createHistory(userId, keyword);
    }

    async getAllHistories(userId: number){
        return await this.historiesRepository.getAllHistories(userId);
    }

    async createHistory(userId: number, keyword: string){
        return await this.historiesRepository.createHistory(userId, keyword);
    }

    async deleteHistory(userId: number, historyId: number){
        return await this.historiesRepository.deleteHistory(userId, historyId);
    }

    async deleteHistories(userId: number){
        return await this.historiesRepository.deleteAllHistories(userId);
    }


}
