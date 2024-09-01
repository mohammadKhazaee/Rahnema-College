import { Repository, DataSource, In } from 'typeorm';
import { CreatePost, Post, PostWithImages, UpdatePost } from './model/post';
import { PostEntity } from './entity/post.entity';
import { UserRelationEntity } from '../UserRelation/entity/user-relation.entity';

export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(private dataSource: DataSource) {
        this.postRepo = this.dataSource.getRepository(PostEntity);
    }

    getPosts(
        username: string,
        take: number,
        skip: number
    ): Promise<PostWithImages[]> {
        return this.postRepo.find({
            where: { creatorId: username },
            take,
            skip,
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
            relations: {
                images: true,
                tags: true,
                mentions: true,
                creator: true,
            },
        });
    }

    countLikesForPost(postId: string): Promise<number> {
        return this.postRepo
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.likes', 'like')
            .where('like.postId = :postId', { postId })
            .getCount();
    }

    countPostsByUsername(username: string): Promise<number> {
        return this.postRepo.count({ where: { creatorId: username } });
    }

    async explorePosts(mainName: string) {
        const followings = (await this.dataSource.manager.find(UserRelationEntity, { where: { followerId: mainName }, select: ['followedId'] })).map(f => f.followedId)
        console.log(followings)
        const posts = await this.postRepo.find({
            order: {
                createdAt: 'DESC'
            },
            where: {
                creatorId: In([...followings])
            }, relations: {
                creator: true,
                images: true
            }
        })
        console.log(posts)
        return posts
    }
}