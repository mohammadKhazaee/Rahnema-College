import { Repository, DataSource } from 'typeorm';
import { CreatePost, Post, UpdatePost } from './model/post';
import { PostEntity } from './entity/post.entity';

export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(dataSource: DataSource) {
        this.postRepo = dataSource.getRepository(PostEntity);
    }

    getPosts(username: string): Promise<Post[]> {
        return this.postRepo.findBy({ creatorId: username });
    }

    create(createPostObject: CreatePost) {
        console.log(createPostObject);

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
}
