import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, In } from 'typeorm';
import { UserRelationEntity } from './user-relation.entity';
import { PostCommentEntity } from '../../Post/entity/post-comment.entity';
import { PostLikeEntity } from '../../Post/entity/post-Likes.entity';
import { BookmarkEntity } from '../../Post/entity/bookmark.entity';
import { CommentLikeEntity } from '../../Post/entity/comment-Likes.entity';
import { NotificationEntity } from '../../Notification/entity/notification.entity';

@EventSubscriber()
export class UserRelationSubscriber implements EntitySubscriberInterface<UserRelationEntity> {
    listenTo() {
        return UserRelationEntity;
    }

    async afterUpdate(event: UpdateEvent<UserRelationEntity>) {
        const beforeUpdate = event.databaseEntity;
        const afterUpdate = event.entity;

        // remove close friend extra logic
        if (beforeUpdate.status === 'friend' && afterUpdate && afterUpdate.status === 'follow') {
            // comment o like o bookmark hash az roo postaye close hazf beshe
            const comments = await event.manager.findBy(PostCommentEntity, {
                commenterId: beforeUpdate.followedId,
                post: { creatorId: beforeUpdate.followerId, isCloseFriend: true },
            });
            await event.manager.remove(PostCommentEntity, comments);

            const likes = await event.manager.findBy(PostLikeEntity, {
                userId: beforeUpdate.followedId,
                post: { creatorId: beforeUpdate.followerId, isCloseFriend: true },
            });
            await event.manager.remove(PostLikeEntity, likes);

            const bookmarks = await event.manager.findBy(BookmarkEntity, {
                userId: beforeUpdate.followedId,
                post: { creatorId: beforeUpdate.followerId, isCloseFriend: true },
            });
            await event.manager.remove(BookmarkEntity, bookmarks);

            // comment-like hash az roo postaye close hazf beshe
            const commentLikes = await event.manager.findBy(CommentLikeEntity, {
                userId: beforeUpdate.followedId,
                comment: { post: { creatorId: beforeUpdate.followerId, isCloseFriend: true } },
            });
            await event.manager.remove(CommentLikeEntity, commentLikes);

            // closeFriend notif haiy ke az taraf dashte ham hazf she
            const notifs = await event.manager.findBy(NotificationEntity, {
                emiterId: beforeUpdate.followerId,
                receiverId: beforeUpdate.followedId,
                type: In(['friendFollow', 'friendComment', 'friendLike']),
            });
            await event.manager.remove(NotificationEntity, notifs);
        }
    }
}
