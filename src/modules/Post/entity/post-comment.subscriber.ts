import { EventSubscriber, EntitySubscriberInterface, RemoveEvent } from 'typeorm';
import { PostNotifEntity } from '../../Notification/entity/post-notif.entity';
import { NotificationEntity } from '../../Notification/entity/notification.entity';
import { PostCommentEntity } from './post-comment.entity';

@EventSubscriber()
export class PostCommentSubscriber implements EntitySubscriberInterface<PostCommentEntity> {
    listenTo() {
        return PostCommentEntity;
    }

    async beforeRemove(event: RemoveEvent<PostCommentEntity>) {
        const entity = event.databaseEntity;

        const postNotifs = await event.manager.find(PostNotifEntity, {
            where: {
                notif: { emiterId: entity.commenterId, type: 'friendComment' },
                postId: entity.postId,
            },
            relations: { notif: true },
        });
        const baseNotifs = postNotifs.map((p) => p.notif);

        await event.manager.remove(NotificationEntity, baseNotifs);
    }
}
