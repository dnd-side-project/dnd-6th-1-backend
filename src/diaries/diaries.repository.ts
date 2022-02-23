import { Entity, EntityRepository, Repository } from "typeorm";
import { Diaries } from "./diaries.entity";
import { CreateDiaryDto } from "./dto/create-diary.dto"; 
import { UpdateDiaryDto } from "./dto/update-diary.dto";



@EntityRepository(Diaries)
export class DiariesRepository extends Repository <Diaries> {
    

    async findByDiaryId(diaryId: number){ 
        const diary = await this.createQueryBuilder("diaries")
            .leftJoinAndSelect("diaries.images", "images")
            .where("diaries.diaryId=:diaryId", {diaryId})
            .andWhere("diaries.diaryStatus =:status", {status: true}) // 글이 삭제되지 않은 경우만
            .getOne();

        if(!diary) {// 이미지가 없는 경우 
            return await this.createQueryBuilder("diaries")
                .leftJoinAndSelect("diaries.images", "images")
                .where("diaries.diaryId=:diaryId", {diaryId})
                .getOne();
        }

        return diary;
    }

    async getAllDiaries(loginUserId): Promise<Diaries[]> {
        return await this.find({
            where: {
                diaryStatus: true
            },
            relations: ["images"] 
        });
    }


    // 홈화면에서 제목, 이유, 이미지, 내용이 필요할까..?
    // 내가 작성한 월별 게시글 가져오기 : 날짜, 감정, (작성자), 감정이유, 제목, 내용, 이미지
    async getMonthDiaries(userId: number, year: number, month: number): Promise<Diaries[]> {
        return await this.createQueryBuilder("user")        // user를 사용해서 작성한 글찾기
            .innerJoinAndSelect("user.diaries","diaries") // user 테이블에 diaries 게시물 join
            .leftJoinAndSelect("diaries.images","images") // board 테이블에 image 게시물 join (이미지가 없는 애도 갯수 세야 하므로)
            .select([
                // 'user.nickname AS nickname',
                "diaries.date AS date",
                "diaries.categoryId AS categoryId", 
                "diaries.categoryReason AS categoryReason",
                "diaries.diaryTitle AS diaryTitle", 
                "diaries.diaryContent AS diaryContent", 
                "COUNT(images.originalName) AS imageCnt"
            ])
            .where('user.userId =:userId', {userId})        // 내가 쓴 글이여야 하고
            .andWhere('diaries.year =: year', {year})
            .andWhere("diaries.month =:month", {month})      // 해당 월에 작성한 글 중에서
            .andWhere("diaries.diaryStatus =:status", {status: true}) // 글이 삭제되지 않은 경우만
            .groupBy("diaries.diaryId")    
            .getRawMany(); 
    }
    

    // 날짜에 글이 작성되어 있는지 확인
    async findByDiaryDate(date: string) {
        return await this.createQueryBuilder("diaries")
            .where("diaries.date =:date", {date})
            .andWhere("diaries.diaryStatus =:status", {status: true})
            .getOne();
    }



    // 일기 등록
    async createDiary(loginUserId: number, createDiaryDto: CreateDiaryDto, year: number, month: number, week: number): Promise<Diaries> {
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
            year: year,
            month: month,
            week: week
        };
        
        // 게시글 저장
        console.log(month);
        return await this.save(diary);
    }

    
    async updateDiary(diaryId: number, updateDiaryDto: UpdateDiaryDto) {
        const diary = await this.findOne(diaryId);
        const { categoryId, categoryReason, diaryTitle, diaryContent } = updateDiaryDto;
      
        const category = (categoryId==null) ? diary.categoryId : categoryId
        const categoryIdToNumber = +category; // category (string)
        const reason = (categoryReason==null) ? diary.categoryReason : categoryReason
        const title = (diaryTitle==null) ? diary.diaryTitle : diaryTitle
        const content = (diaryContent==null) ? diary.diaryContent : diaryContent
        await this.update({diaryId}, {categoryId: categoryIdToNumber, categoryReason: reason, diaryTitle: title, diaryContent: content});
    }
    

    async deleteDiary(diaryId: number) {
        await this.update({diaryId}, {diaryStatus: false});
    }
    
    async getWeeklyReport(year: number, month: number, week: number, userId: number){
        return await this.createQueryBuilder("diaries")        // user를 사용해서 작성한 글찾기
            .select([
                // "diaries.userId AS userId",
                "diaries.diaryId AS diaryId",
                "diaries.date AS date",
                "diaries.categoryId AS categoryId", 
                "diaries.categoryReason AS categoryReason",
                "diaries.diaryTitle AS diaryTitle", 
            ])
            .where('diaries.userId =:userId', {userId})       
            .andWhere('diaries.year =:year', {year}) // =: 다음에 공백 xx
            .andWhere("diaries.month =:month", {month})      
            .andWhere("diaries.week =:week", {week})    
            .groupBy("diaries.diaryId")    
            .getRawMany();  
    }
}