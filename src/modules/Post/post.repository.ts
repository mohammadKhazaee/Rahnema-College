import { Repository, DataSource } from 'typeorm';
import { PostEntity } from './entity/post.entity';
import { CreatePost } from './model/post';

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
}
