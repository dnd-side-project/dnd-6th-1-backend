import { EntityRepository, Repository } from "typeorm";
import { Bookmarks } from "../entity/bookmarks.entity";

@EntityRepository(Bookmarks) 
export class BookmarksRepository extends Repository<Bookmarks>{
    
    async findByBoardId(boardId: number, loginUserId: number){
        // bookmarkStatus 관계없이 모두 리턴
        return await this.findOne({boardId, userId: loginUserId});
    }

    // 북마크 처음 누를 시
    async createBookmark(boardId: number, userId: number): Promise<Bookmarks>{
        const bookmark = {
            boardId,
            userId
        }
        const newBookmark = await this.save(bookmark);
        return newBookmark;
    }

    // 북마크 상태 변경
    async updateBookmarkStatus(boardId: number, userId: number) {
        let bookmark = await this.findOne({boardId, userId});
        if (bookmark.bookmarkStatus == true){ // 북마크가 눌려져 있으면 취소
            await this.update({boardId, userId},{bookmarkStatus: false});
        }
        else { // 북마크가 안눌려져 있으면 좋아요 완료
            await this.update({boardId, userId},{bookmarkStatus: true});
        }
        return await this.findOne({boardId, userId});
    }

    // 북마크 여부
    async findByUserId(boardId: number, loginUserId: number) {
        const status = await this.findOne({boardId, userId: loginUserId, bookmarkStatus: true});
        if(!status)
            return false;
        return true;
    }
}