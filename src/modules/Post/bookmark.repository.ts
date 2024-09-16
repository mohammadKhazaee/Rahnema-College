import { Repository, DataSource } from 'typeorm';
import { BookmarkEntity } from './entity/bookmark.entity';
import { PostBookmarkId } from './model/post-bookmark';
import { DbPagination } from '../Common/model/db-pagination';
import { PostEntity } from './entity/post.entity';

export class BookmarkRepository {
    private bookmarkRepo: Repository<BookmarkEntity>;

    constructor(dataSource: DataSource) {
        this.bookmarkRepo = dataSource.getRepository(BookmarkEntity);
    }

    async findBookmark({ userId, postId }: PostBookmarkId): Promise<BookmarkEntity | null> {
        return this.bookmarkRepo.findOne({ where: { userId, postId } });
    }

    async saveBookmark({ userId, postId }: PostBookmarkId): Promise<BookmarkEntity> {
        const newBookmark = this.bookmarkRepo.create({ userId, postId });
        return this.bookmarkRepo.save(newBookmark);
    }

    async isItBookmarked({ postId, userId }: PostBookmarkId): Promise<boolean> {
        const bookMark = await this.bookmarkRepo.findOneBy({ postId, userId });
        return !!bookMark;
    }

    async removeBookmark(bookmark: BookmarkEntity): Promise<void> {
        await this.bookmarkRepo.remove(bookmark);
    }

    async countBookmarksForPost(postId: string): Promise<number> {
        return this.bookmarkRepo.count({ where: { postId } });
    }
    async getBookmarkedPosts(userId: string, { take, skip }: DbPagination): Promise<PostEntity[]> {
        return this.bookmarkRepo
            .find({
                where: { userId },
                relations: ['post', 'post.images', 'post.creator'],
                take,
                skip,
                order: { createdAt: 'DESC' },
            })
            .then((bookmarks) => bookmarks.map((bookmark) => bookmark.post));
    }
}
