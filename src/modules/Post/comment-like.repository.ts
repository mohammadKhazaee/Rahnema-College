import { Repository, DataSource } from 'typeorm';
import { CommentLikeEntity } from './entity/comment-Likes.entity';
import { CommentLikeId, CreateCommentLike } from './model/post-comment-like';

export class CommentLikeRepository {
    private likeRepo: Repository<CommentLikeEntity>;

    constructor(dataSource: DataSource) {
        this.likeRepo = dataSource.getRepository(CommentLikeEntity);
    }

    findOne({ commentId, userId }: CommentLikeId): Promise<CommentLikeEntity | null> {
        return this.likeRepo.findOneBy({ commentId, userId });
    }

    async doesLikeExists({ commentId, userId }: CommentLikeId): Promise<boolean> {
        const like = await this.likeRepo.findOneBy({ commentId, userId });
        return !!like;
    }

    save(createLikeData: CreateCommentLike) {
        const createdLike = this.likeRepo.create(createLikeData);
        return this.likeRepo.insert(createdLike);
    }

    async delete({ commentId, userId }: CommentLikeId) {
        const like = (await this.likeRepo.findOneBy({ commentId, userId }))!;
        return this.likeRepo.remove(like);
    }

    countLikesForComment(commentId: string): Promise<number> {
        return this.likeRepo.countBy({ commentId });
    }
}
