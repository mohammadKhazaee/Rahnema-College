import { Repository, DataSource } from 'typeorm';
import { PostCommentEntity } from './entity/post-comment.entity';
import {
    CreatePostComment,
    PostComment,
    PostCommentWithReplays,
} from './model/post-comment';

export class PostCommentRepository {
    private commentRepo: Repository<PostCommentEntity>;

    constructor(dataSource: DataSource) {
        this.commentRepo = dataSource.getRepository(PostCommentEntity);
    }

    save(commentData: CreatePostComment): Promise<PostCommentWithReplays> {
        return this.commentRepo.save(commentData);
    }
}
