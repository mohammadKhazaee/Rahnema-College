import { Repository, DataSource } from 'typeorm';
import { BookmarkEntity } from './entity/bookmark.entity';
export class BookmarkRepository {
    private bookmarkRepo: Repository<BookmarkEntity>;

    constructor(dataSource: DataSource) {
        this.bookmarkRepo = dataSource.getRepository(BookmarkEntity);
    }

    async findBookmark(userId: string, postId: string): Promise<BookmarkEntity | null> {
        return this.bookmarkRepo.findOne({ where: { userId, postId } });
    }

    async saveBookmark(userId: string, postId: string): Promise<BookmarkEntity> {
        const newBookmark = this.bookmarkRepo.create({ userId, postId });
        return this.bookmarkRepo.save(newBookmark);
    }

    async removeBookmark(bookmark: BookmarkEntity): Promise<void> {
        await this.bookmarkRepo.remove(bookmark);
    }

    async countBookmarksForPost(postId: string): Promise<number> {
        return this.bookmarkRepo.count({ where: { postId } });
    }
}
