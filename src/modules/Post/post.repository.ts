import { Repository, DataSource, In, EntityManager } from 'typeorm';
import { CreatePost, Post, PostWithImages, UpdatePost } from './model/post';
import { PostEntity } from './entity/post.entity';
import { UserRelationEntity } from '../UserRelation/entity/user-relation.entity';
import { NotificationEntity } from '../Notification/entity/notification.entity';
import { CreateMentionNotif } from '../Notification/model/notifications';
import { PostNotifEntity } from '../Notification/entity/post-notif.entity';
import { User } from '../User/model/user';
import { PaginationDto } from './dto/get-posts-dto';

export class PostRepository {
    private postRepo: Repository<PostEntity>;

    constructor(private dataSource: DataSource) {
        this.postRepo = this.dataSource.getRepository(PostEntity);
    }

    getPosts(username: string, take: number, skip: number): Promise<PostWithImages[]> {
        return this.postRepo.find({
            where: { creatorId: username },
            take,
            skip,
            relations: ['images'],
        });
    }

    create(createPostObject: CreatePost): Promise<Post> {
        return this.dataSource.transaction(async (entityManager) => {
            // save like record
            const createdPost = await this.postRepo.save(createPostObject);

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

            return createdPost;
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

            return createdPost;
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

    async explorePosts(mainUser: string, take: number, skip: number) {
        return this.dataSource.transaction(async (entityManeger) => {
            const followings = (
                await entityManeger.find(UserRelationEntity, {
                    where: { followerId: mainUser, status: In(['follow', 'friend']) },
                    select: ['followedId'],
                })
            ).map((f) => f.followedId);

            console.log(followings);

            const posts = await entityManeger.find(PostEntity, {
                order: {
                    createdAt: 'DESC',
                },
                where: {
                    creatorId: In([...followings]),
                },
                relations: {
                    creator: true,
                    images: true,
                },
                skip,
                take,
            });

            return posts;
        });
    }
}
