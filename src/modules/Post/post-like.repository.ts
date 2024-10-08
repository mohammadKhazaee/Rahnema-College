import { Repository, DataSource, EntityManager, In } from 'typeorm';
import { PostLikeEntity } from './entity/post-Likes.entity';
import { CreatePostLike, PostLikeId } from './model/post-like';
import { NotificationEntity } from '../Notification/entity/notification.entity';
import { PostNotifEntity } from '../Notification/entity/post-notif.entity';
import { CreateLikeNotif, DeleteLikeNotif } from '../Notification/model/notifications';
import { UserRelationEntity } from '../UserRelation/entity/user-relation.entity';
import { createFrindLikeNotif } from '../Notification/model/friend-notifs';

export class PostLikeRepository {
    private likeRepo: Repository<PostLikeEntity>;

    constructor(private dataSource: DataSource) {
        this.likeRepo = dataSource.getRepository(PostLikeEntity);
    }

    findOne({ postId, userId }: PostLikeId): Promise<PostLikeEntity | null> {
        return this.likeRepo.findOneBy({ postId, userId });
    }

    async doesLikeExists({ postId, userId }: PostLikeId): Promise<boolean> {
        const like = await this.likeRepo.findOneBy({ postId, userId });
        return !!like;
    }

    save({ emiterId, receiverId, postId }: CreateLikeNotif) {
        const createPostLike: CreatePostLike = {
            userId: emiterId,
            postId,
        };
        const createdLike = this.likeRepo.create(createPostLike);
        return this.dataSource.transaction(async (entityManager) => {
            // save like record
            await entityManager.insert(PostLikeEntity, createdLike);

            // save base notif
            const createdNotif = await entityManager.save(NotificationEntity, {
                type: 'like',
                emiterId,
                receiverId,
            });

            // save post notif
            await entityManager.save(PostNotifEntity, {
                notifId: createdNotif.notifId,
                postId,
            });

            // save friend base notif
            const createdLikeNotifs = await this.makeFriendLikeNotif(emiterId, entityManager);
            const createdNotifs = await entityManager.save(NotificationEntity, createdLikeNotifs);

            // save friend post notif
            await entityManager.save(
                PostNotifEntity,
                createdNotifs.map((n) => ({
                    notifId: n.notifId,
                    postId,
                }))
            );
        });
    }

    private async makeFriendLikeNotif(
        emiterId: string,
        entityManager: EntityManager
    ): Promise<createFrindLikeNotif[]> {
        const friends = await entityManager.findBy(UserRelationEntity, {
            followedId: emiterId,
            status: 'friend',
        });

        return friends.map((f) => ({
            type: 'friendLike',
            emiterId: emiterId,
            receiverId: f.followerId,
        }));
    }

    delete({ postId, emiterId, receiverId }: DeleteLikeNotif) {
        return this.dataSource.transaction(async (entityManager) => {
            // delete like record
            await entityManager.delete(PostLikeEntity, { postId, userId: emiterId });

            // delete base notif & related post notif entity
            await entityManager.delete(NotificationEntity, {
                type: 'like',
                emiterId,
                receiverId,
            });

            // delete friend base notifs & related post notif entities
            const postNotifs = await entityManager.findBy(PostNotifEntity, {
                postId,
                notif: { emiterId, type: 'friendLike' },
            });

            await entityManager.delete(NotificationEntity, {
                type: 'friendLike',
                emiterId,
                notifId: In(postNotifs.map((n) => n.notifId)),
            });
        });
    }

    countLikesForPost(postId: string): Promise<number> {
        return this.likeRepo.countBy({ postId });
    }
}
