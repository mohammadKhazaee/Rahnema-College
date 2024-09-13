import { EventSubscriber, EntitySubscriberInterface, RemoveEvent } from 'typeorm';
import { PostLikeEntity } from './post-Likes.entity';
import { PostNotifEntity } from '../../Notification/entity/post-notif.entity';
import { NotificationEntity } from '../../Notification/entity/notification.entity';

@EventSubscriber()
export class PostLikeSubscriber implements EntitySubscriberInterface<PostLikeEntity> {
    listenTo() {
        return PostLikeEntity;
    }

    async beforeRemove(event: RemoveEvent<PostLikeEntity>) {
        const entity = event.databaseEntity;

        const postNotifs = await event.manager.find(PostNotifEntity, {
            where: {
                notif: { emiterId: entity.userId, type: 'friendLike' },
                postId: entity.postId,
            },
            relations: { notif: true },
        });
        const baseNotifs = postNotifs.map((p) => p.notif);

        await event.manager.remove(NotificationEntity, baseNotifs);
    }
}
