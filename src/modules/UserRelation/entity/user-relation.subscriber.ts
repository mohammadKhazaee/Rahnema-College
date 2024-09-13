import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, In, RemoveEvent } from 'typeorm';
import { UserRelationEntity } from './user-relation.entity';
import { PostCommentEntity } from '../../Post/entity/post-comment.entity';
import { PostLikeEntity } from '../../Post/entity/post-Likes.entity';
import { BookmarkEntity } from '../../Post/entity/bookmark.entity';
import { CommentLikeEntity } from '../../Post/entity/comment-Likes.entity';
import { NotificationEntity } from '../../Notification/entity/notification.entity';
import { UserEntity } from '../../User/entity/user.entity';

@EventSubscriber()
export class UserRelationSubscriber implements EntitySubscriberInterface<UserRelationEntity> {
    listenTo() {
        return UserRelationEntity;
    }

    async beforeRemove(event: RemoveEvent<UserRelationEntity>) {
        const entity = event.databaseEntity;
        const user = (await event.manager.findOneBy(UserEntity, {
            username: entity.followedId,
        }))!;

        if (user.isPrivate) await this.clearFollowerActivities(event);
        else if (entity.status === 'friend') {
            // delete all notifications
            await event.manager.delete(NotificationEntity, {
                emiterId: entity.followedId,
                receiverId: entity.followerId,
            });

            await this.clearFriendActivities(event);
        }
    }

    async afterUpdate(event: UpdateEvent<UserRelationEntity>) {
        const beforeUpdate = event.databaseEntity;
        const afterUpdate = event.entity;

        // remove close friend extra logic
        if (beforeUpdate.status === 'friend' && afterUpdate && afterUpdate.status === 'follow')
            await this.clearFriendActivities(event);
    }

    private async clearFollowerActivities(event: any) {
        const entity = event.databaseEntity;

        // clear follower comments, likes & bookmarks in user posts
        const comments = await event.manager.findBy(PostCommentEntity, {
            commenterId: entity.followerId,
            post: { creatorId: entity.followedId },
        });
        await event.manager.remove(PostCommentEntity, comments);

        const likes = await event.manager.findBy(PostLikeEntity, {
            userId: entity.followerId,
            post: { creatorId: entity.followedId },
        });
        await event.manager.remove(PostLikeEntity, likes);

        const bookmarks = await event.manager.findBy(BookmarkEntity, {
            userId: entity.followerId,
            post: { creatorId: entity.followedId },
        });
        await event.manager.remove(BookmarkEntity, bookmarks);

        // clear follower comment-likes in user posts
        const commentLikes = await event.manager.findBy(CommentLikeEntity, {
            userId: entity.followerId,
            comment: { post: { creatorId: entity.followedId } },
        });
        await event.manager.remove(CommentLikeEntity, commentLikes);

        // clear notifs from follower
        const notifs = await event.manager.findBy(NotificationEntity, {
            emiterId: entity.followedId,
            receiverId: entity.followerId,
        });
        await event.manager.remove(NotificationEntity, notifs);
    }

    private async clearFriendActivities(event: any) {
        const entity = event.databaseEntity;

        // clear comments, likes & bookmarks in closeFriend posts
        const comments = await event.manager.findBy(PostCommentEntity, {
            commenterId: entity.followedId,
            post: { creatorId: entity.followerId, isCloseFriend: true },
        });
        await event.manager.remove(PostCommentEntity, comments);

        const likes = await event.manager.findBy(PostLikeEntity, {
            userId: entity.followedId,
            post: { creatorId: entity.followerId, isCloseFriend: true },
        });
        await event.manager.remove(PostLikeEntity, likes);

        const bookmarks = await event.manager.findBy(BookmarkEntity, {
            userId: entity.followedId,
            post: { creatorId: entity.followerId, isCloseFriend: true },
        });
        await event.manager.remove(BookmarkEntity, bookmarks);

        // clear comment-likes in closeFriend posts
        const commentLikes = await event.manager.findBy(CommentLikeEntity, {
            userId: entity.followedId,
            comment: { post: { creatorId: entity.followerId, isCloseFriend: true } },
        });
        await event.manager.remove(CommentLikeEntity, commentLikes);

        // clear closeFriend notifs
        const notifs = await event.manager.findBy(NotificationEntity, {
            emiterId: entity.followerId,
            receiverId: entity.followedId,
            type: In(['friendFollow', 'friendComment', 'friendLike']),
        });
        await event.manager.remove(NotificationEntity, notifs);
    }
}
