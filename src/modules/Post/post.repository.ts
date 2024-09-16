import { Repository, DataSource, In, EntityManager, FindOptionsWhere, Not } from 'typeorm';
import { CreatePost, FindExplorePosts, Post, PostWithImages, UpdatePost } from './model/post';
import { PostEntity } from './entity/post.entity';
import { UserRelationEntity } from '../UserRelation/entity/user-relation.entity';
import { NotificationEntity } from '../Notification/entity/notification.entity';
import { CreateMentionNotif } from '../Notification/model/notifications';
import { PostNotifEntity } from '../Notification/entity/post-notif.entity';
import { User } from '../User/model/user';
import { DbPagination } from '../Common/model/db-pagination';
import { UserEntity } from '../User/entity/user.entity';

export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(private dataSource: DataSource) {
        this.postRepo = this.dataSource.getRepository(PostEntity);
    }

    getPosts(
        username: string,
        showCloseFriend: boolean,
        { take, skip }: DbPagination
    ): Promise<PostWithImages[]> {
        let where: FindOptionsWhere<PostEntity> = { creatorId: username };
        if (!showCloseFriend) where = { ...where, isCloseFriend: false };

        return this.postRepo.find({
            where,
            take,
            skip,
            relations: ['images'],
            order: { createdAt: 'DESC' },
        });
    }

    create(createPostObject: CreatePost): Promise<PostEntity> {
        return this.dataSource.transaction(async (entityManager) => {
            // save like record
            const createdPost = await entityManager.save(PostEntity, createPostObject);

            // save base notif for followers
            const preparedMentionNotifs: CreateMentionNotif[] = await this.makeFollowersNotifs(
                entityManager,
                createPostObject.mentions,
                createdPost.creatorId
            );

            const createdNotifs = await entityManager.save(
                NotificationEntity,
                preparedMentionNotifs
            );

            // save post notif
            await entityManager.save(
                PostNotifEntity,
                createdNotifs.map((n) => ({
                    notifId: n.notifId,
                    postId: createdPost.postId,
                }))
            );

            const creatorInfo = await entityManager.findOne(UserEntity, {
                where: { username: createdPost.creatorId },
            });
            if (!creatorInfo) throw new Error();

            return { ...createdPost, creator: creatorInfo };
        });
    }

    private async makeFollowersNotifs(
        entityManager: EntityManager,
        mentions: User[],
        creatorId: string
    ): Promise<CreateMentionNotif[]> {
        const relationConditions = await Promise.all(
            mentions.map(async (m) =>
                entityManager.existsBy(UserRelationEntity, {
                    followerId: m.username,
                    followedId: creatorId,
                })
            )
        );

        return mentions
            .filter((m, i) => relationConditions[i])
            .map((u) => ({
                type: 'mention',
                emiterId: creatorId,
                receiverId: u.username,
            }));
    }

    private async removeOldMentionNotifs(
        entityManager: EntityManager,
        oldMentions: User[],
        postId: string
    ) {
        const oldMentionNotifs = await entityManager.find(PostNotifEntity, {
            where: {
                postId: postId,
                notif: {
                    type: 'mention',
                    receiverId: In(oldMentions.map((u) => u.username)),
                },
            },
            relations: { notif: true },
        });

        if (oldMentionNotifs.length > 0)
            await entityManager.delete(
                NotificationEntity,
                oldMentionNotifs.map((n) => n.notif)
            );
    }

    update(post: UpdatePost, oldMentions: User[] = []) {
        return this.dataSource.transaction(async (entityManager) => {
            // save like record
            const createdPost = await this.postRepo.save(post);

            // remove old mention notifs
            if (oldMentions.length > 0)
                await this.removeOldMentionNotifs(entityManager, oldMentions, post.postId);

            // save base notif for followers
            const preparedMentionNotifs: CreateMentionNotif[] = await this.makeFollowersNotifs(
                entityManager,
                post.mentions || [],
                createdPost.creatorId
            );

            const createdNotifs = await entityManager.save(
                NotificationEntity,
                preparedMentionNotifs
            );

            // save post notif
            await entityManager.save(
                PostNotifEntity,
                createdNotifs.map((n) => ({
                    notifId: n.notifId,
                    postId: createdPost.postId,
                }))
            );

            const creatorInfo = await entityManager.findOne(UserEntity, {
                where: { username: createdPost.creatorId },
            });
            if (!creatorInfo) throw new Error();

            return { ...createdPost, creator: creatorInfo };
        });
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

    explorePosts(
        { friendCreators, NonFriendCreators }: FindExplorePosts,
        { take, skip }: DbPagination
    ) {
        let where: FindOptionsWhere<PostEntity>[] = [];

        if (friendCreators) where = [...where, { creatorId: In([...friendCreators]) }];
        if (NonFriendCreators)
            where = [...where, { creatorId: In([...NonFriendCreators]), isCloseFriend: false }];

        return this.postRepo.find({
            order: { createdAt: 'DESC' },
            where,
            relations: { creator: true, images: true },
            skip,
            take,
        });
    }
    async getPostsByTag(tagName: string, { take, skip }: DbPagination): Promise<PostWithImages[]> {
        return this.postRepo
            .createQueryBuilder('post')
            .innerJoinAndSelect('post.tags', 'tag', 'tag.name = :tagName', { tagName })
            .leftJoinAndSelect('post.images', 'image')
            .leftJoinAndSelect('post.creator', 'creator')
            .take(take)
            .skip(skip)
            .getMany();
    }

    async getPostCountByTag(tagName: string): Promise<number> {
        return this.postRepo
            .createQueryBuilder('post')
            .innerJoin('post.tags', 'tag', 'tag.name = :tagName', { tagName })
            .getCount();
    }
    async getMentionedPosts(username: string, { take, skip }: DbPagination): Promise<PostEntity[]> {
        return this.postRepo.find({
            where: {
                mentions: {
                    username: username,
                },
            },
            relations: ['images', 'creator'],
            take,
            skip,
            order: { createdAt: 'DESC' },
        });
    }
}
