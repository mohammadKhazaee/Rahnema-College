import { Repository, DataSource } from 'typeorm';
import { PostLikeEntity } from './entity/post-Likes.entity';
import { CreatePostLike, PostLikeId } from './model/post-like';

export class PostLikeRepository {
    private likeRepo: Repository<PostLikeEntity>;

    constructor(dataSource: DataSource) {
        this.likeRepo = dataSource.getRepository(PostLikeEntity);
    }

    findOne({ postId, userId }: PostLikeId): Promise<PostLikeEntity | null> {
        return this.likeRepo.findOneBy({ postId, userId });
    }

    async doesLikeExists({ postId, userId }: PostLikeId): Promise<boolean> {
        const like = await this.likeRepo.findOneBy({ postId, userId });
        return !!like;
    }

    save(createLikeData: CreatePostLike) {
        const createdLike = this.likeRepo.create(createLikeData);
        return this.likeRepo.insert(createdLike);
    }

    delete({ postId, userId }: PostLikeId) {
        return this.likeRepo.delete({ postId, userId });
    }

    countLikesForPost(postId: string): Promise<number> {
        return this.likeRepo.countBy({ postId });
    }
}
