import { Repository, DataSource } from 'typeorm';
import { CreatePost, UpdatePost } from './model/post';
import { PostEntity } from './entity/post.entity';

export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(dataSource: DataSource) {
        this.postRepo = dataSource.getRepository(PostEntity);
    }
    getPosts(username: string): Promise<PostEntity[]> {
        return this.postRepo.findBy({ creatorId: username });
    }

    create(createPostObject: CreatePost) {
        return this.postRepo.save(createPostObject);
    }

    update(post: UpdatePost) {
        console.log('post=======================');
        console.log(post);

        return this.postRepo.save(post);
    }

    async findPostById(postId: string): Promise<PostEntity | null> {
        return await this.postRepo.findOne({
            where: { postId },
            relations: ['creator', 'tags', 'images', 'mentions'],
        });
    }
}
