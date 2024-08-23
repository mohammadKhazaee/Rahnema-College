import { Repository, DataSource } from 'typeorm';
import { CreatePost, Post, PostWithImages, UpdatePost } from './model/post';
import { PostEntity } from './entity/post.entity';

export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(dataSource: DataSource) {
        this.postRepo = dataSource.getRepository(PostEntity);
    }

    getPosts(username: string): Promise<PostWithImages[]> {
        return this.postRepo.find({
            where: { creatorId: username },
            relations: ['images'],
        });
    }

    create(createPostObject: CreatePost): Promise<Post> {
        return this.postRepo.save(createPostObject);
    }

    update(post: UpdatePost) {
        return this.postRepo.save(post);
    }

    async doesPostExist(postId: string): Promise<boolean> {
        const postCount = await this.postRepo.countBy({ postId });
        return postCount > 0;
    }

    findPostById(postId: string): Promise<Post | null> {
        return this.postRepo.findOne({
            where: { postId },
            relations: ['tags', 'images', 'mentions'],
        });
    }

    countLikesForPost(postId: string): Promise<number> {
        return this.postRepo
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.likes', 'like')
            .where('like.postId = :postId', { postId })
            .getCount();
    }

    countCommentsForPost(postId: string): Promise<number> {
        return this.postRepo
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.comments', 'comment')
            .where('comment.postId = :postId', { postId })
            .getCount();
    }

    countPostsByUsername(username: string): Promise<number> {
        return this.postRepo.count({ where: { creatorId: username } });
    }
}
