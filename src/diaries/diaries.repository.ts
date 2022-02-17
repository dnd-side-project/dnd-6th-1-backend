import { Entity, EntityRepository, Repository } from "typeorm";
import { Diaries } from "./diaries.entity";
import { CreateDiaryDto } from "./dto/create-diary.dto"; 


@EntityRepository(Diaries)
export class DiariesRepository extends Repository <Diaries> {

    async findByDiaryId(diaryId: number){ 
        const diary = await this.createQueryBuilder("diaries")
            .leftJoinAndSelect("diaries.images", "images")
            .where("diaries.diaryId=:diaryId", {diaryId})
            .getOne();

        if(!diary) {// 이미지가 없는 경우 
            return await this.createQueryBuilder("diaries")
                .leftJoinAndSelect("diaries.images", "images")
                .where("diaries.diaryId=:diaryId", {diaryId})
                .getOne();
        }

        return diary;
    }

    async getAllDiaries(): Promise<Diaries[]> {
        return await this.find({
            where: {
                diaryStatus: true
            },
            relations: ["diaries"] 
        });
    }


    // 날짜에 글이 작성되어 있는지 확인
    async findByDiaryDate(date: string) {
        return await this.createQueryBuilder("diaries")
            .where("diaries.date =:date", {date})
            .getOne();
    }


    // 일기 등록
    async createDiary(loginUserId: number, createDiaryDto: CreateDiaryDto): Promise<Diaries> {
        const { date, categoryId, categoryReason, diaryTitle, diaryContent} = createDiaryDto;
        const categoryIdToNumber = +categoryId;
        const diary = {
            userId: loginUserId,
            date,
            categoryId: categoryIdToNumber,
            categoryReason,
            diaryTitle,
            diaryContent,
            diaryCreated: new Date(),
        };
        
        // 게시글 저장
        return await this.save(diary);
        
    }
    
}