import { Repository, DataSource } from 'typeorm';
import { PostLikeEntity } from './entity/post-Likes.entity';

export class PostLikeRepository {
    private likeRepo: Repository<PostLikeEntity>;

    constructor(dataSource: DataSource) {
        this.likeRepo = dataSource.getRepository(PostLikeEntity);
    }

    countLikesForPost(postId: string): Promise<number> {
        return this.likeRepo.countBy({ postId });
    }
}
