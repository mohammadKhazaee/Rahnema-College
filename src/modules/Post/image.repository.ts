import { Repository, DataSource } from 'typeorm';
import { PostImageEntity } from './entity/post-image.entity';
import { CreatePostImage } from './model/image';

export class PostImageRepository {
    private imageRepo: Repository<PostImageEntity>;

    constructor(dataSource: DataSource) {
        this.imageRepo = dataSource.getRepository(PostImageEntity);
    }

    getPostImages(postId: number): Promise<PostImageEntity[]> {
        return this.imageRepo.findBy({ postId });
    }

    saveBulk(images: CreatePostImage[]): Promise<PostImageEntity[]> {
        return this.imageRepo.save(images);
    }
}
