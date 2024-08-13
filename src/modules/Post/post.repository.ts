import { DataSource, Repository } from "typeorm";
import { PostEntity } from "./entity/post.entity";
import { Post } from "./model/post";

export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(dataSource: DataSource) {
        this.postRepo = dataSource.getRepository(PostEntity);
    }

    getPosts(username: string): Promise<Post[] | null> {
        return this.postRepo.findBy({ creatorId: username })
    }
}
