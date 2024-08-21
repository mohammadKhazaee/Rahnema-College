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

    async findPostById(postId: string): Promise<Post | null> {
        return await this.postRepo.findOne({
            where: { postId },
            relations: ['tags', 'images', 'mentions'],
        });
    }
    async countLikesForPost(postId: string): Promise<number> {
        console.log(postId);

        return await this.postRepo
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.likes', 'like')
            .where('like.postId = :postId', { postId })
            .getCount();
    }
}
