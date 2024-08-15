import { Repository, DataSource } from 'typeorm';
import { CreatePost } from './model/post';
import { PostEntity } from './entity/post.entity';
import { Post } from './model/post';
export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(dataSource: DataSource) {
        this.postRepo = dataSource.getRepository(PostEntity);
    }
    getPosts(username: string): Promise<PostEntity[] | null> {
        return this.postRepo.findBy({ creatorId: username });
    }
    create(createPostObject: CreatePost) {
        return this.postRepo.save(createPostObject);
    }

    async findPostById(postId: number): Promise<PostEntity | null> {
        return await this.postRepo.findOne({
            where: { postId },
            relations: ['creator', 'tags', 'images', 'mentions'],
        });
    }
}
