import { Repository, DataSource } from 'typeorm';
import { PostCommentEntity } from './entity/post-comment.entity';
import {
    CreatePostComment,
    PostCommentWithReplays,
} from './model/post-comment';

export class PostCommentRepository {
    private commentRepo: Repository<PostCommentEntity>;

    constructor(dataSource: DataSource) {
        this.commentRepo = dataSource.getRepository(PostCommentEntity);
    }

    getComments(
        postId: string,
        take: number,
        skip: number
    ): Promise<PostCommentEntity[]> {
        return this.commentRepo.find({
            where: { postId },
            take,
            skip,
            relations: {
                commenter: true,
                replays: {
                    commenter: true,
                },
            },
        });
    }

    async doesCommentExist(commentId: string): Promise<boolean> {
        const commentCount = await this.commentRepo.countBy({ commentId });
        return commentCount > 0;
    }

    save(commentData: CreatePostComment): Promise<PostCommentWithReplays> {
        return this.commentRepo.save(commentData);
    }

    countCommentsForPost(postId: string): Promise<number> {
        return this.commentRepo.countBy({ postId });
    }
}
