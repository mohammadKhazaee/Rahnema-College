import { Repository, DataSource } from 'typeorm';
import { PostLikeEntity } from './entity/post-Likes.entity';
import { CreatePostLike, PostLikeId } from './model/post-like';
import { NotificationEntity } from '../Notification/entity/notification.entity';
import { PostNotifEntity } from '../Notification/entity/post-notif.entity';

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

    save(createLikeData: CreatePostLike, postCreatorId: string) {
        const createdLike = this.likeRepo.create(createLikeData);
        return this.dataSource.transaction(async (entityManager) => {
            // save like record
            await this.likeRepo.insert(createdLike);

            // save base notif
            const createdNotif = await entityManager.save(NotificationEntity, {
                type: 'like',
                emiterId: createLikeData.userId,
                receiverId: postCreatorId,
            });

            // save post notif
            await entityManager.save(PostNotifEntity, {
                notifId: createdNotif.notifId,
                postId: createLikeData.postId,
            });
        });
    }

    delete({ postId, userId }: PostLikeId, postCreatorId: string) {
        return this.dataSource.transaction(async (entityManager) => {
            // delete like record
            await this.likeRepo.delete({ postId, userId });

            // delete base notif & related post notif entity
            await entityManager.delete(NotificationEntity, {
                type: 'like',
                emiterId: userId,
                receiverId: postCreatorId,
            });
        });
    }

    countLikesForPost(postId: string): Promise<number> {
        return this.likeRepo.countBy({ postId });
    }
}
