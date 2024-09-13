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

        // delete all notifications
        await event.manager.delete(NotificationEntity, {
            emiterId: entity.followedId,
            receiverId: entity.followerId,
        });

        if (user.isPrivate)
            await this.clearFollowerActivities(event, entity.followedId, entity.followerId);
        else if (entity.status === 'friend')
            await this.clearFriendActivities(event, entity.followedId, entity.followerId);
    }

    async afterUpdate(event: UpdateEvent<UserRelationEntity>) {
        const beforeUpdate = event.databaseEntity;
        const afterUpdate = event.entity;

        // block user extra logic
        if (
            afterUpdate &&
            (afterUpdate.status === 'blocked' ||
                afterUpdate.status === 'gotBlocked' ||
                afterUpdate.status === 'twoWayBlocked')
        ) {
            // delete all notifications
            await event.manager.delete(NotificationEntity, {
                emiterId: afterUpdate.followedId,
                receiverId: afterUpdate.followerId,
            });
            await event.manager.delete(NotificationEntity, {
                emiterId: afterUpdate.followerId,
                receiverId: afterUpdate.followedId,
            });

            await this.clearFollowerActivities(
                event,
                afterUpdate.followedId,
                afterUpdate.followerId
            );
            await this.clearFollowerActivities(
                event,
                afterUpdate.followerId,
                afterUpdate.followedId
            );
        }

        // remove close friend extra logic
        if (
            beforeUpdate &&
            beforeUpdate.status === 'friend' &&
            afterUpdate &&
            afterUpdate.status === 'follow'
        ) {
            // clear closeFriend notifs
            const notifs = await event.manager.findBy(NotificationEntity, {
                emiterId: beforeUpdate.followedId,
                receiverId: beforeUpdate.followerId,
                type: In(['friendFollow', 'friendComment', 'friendLike']),
            });
            await event.manager.remove(NotificationEntity, notifs);

            await this.clearFriendActivities(
                event,
                beforeUpdate.followedId,
                beforeUpdate.followerId
            );
        }
    }

    private async clearFollowerActivities(event: any, removedUser: string, removerUser: string) {
        // clear follower comments, likes & bookmarks in user posts
        const comments = await event.manager.findBy(PostCommentEntity, {
            commenterId: removedUser,
            post: { creatorId: removerUser },
        });
        await event.manager.remove(PostCommentEntity, comments);

        const likes = await event.manager.findBy(PostLikeEntity, {
            userId: removedUser,
            post: { creatorId: removerUser },
        });
        await event.manager.remove(PostLikeEntity, likes);

        const bookmarks = await event.manager.findBy(BookmarkEntity, {
            userId: removedUser,
            post: { creatorId: removerUser },
        });
        await event.manager.remove(BookmarkEntity, bookmarks);

        // clear follower comment-likes in user posts
        const commentLikes = await event.manager.findBy(CommentLikeEntity, {
            userId: removedUser,
            comment: { post: { creatorId: removerUser } },
        });
        await event.manager.remove(CommentLikeEntity, commentLikes);
    }

    private async clearFriendActivities(event: any, removedUser: string, removerUser: string) {
        // clear comments, likes & bookmarks in closeFriend posts
        const comments = await event.manager.findBy(PostCommentEntity, {
            commenterId: removedUser,
            post: { creatorId: removerUser, isCloseFriend: true },
        });
        await event.manager.remove(PostCommentEntity, comments);

        const likes = await event.manager.findBy(PostLikeEntity, {
            userId: removedUser,
            post: { creatorId: removerUser, isCloseFriend: true },
        });
        await event.manager.remove(PostLikeEntity, likes);

        const bookmarks = await event.manager.findBy(BookmarkEntity, {
            userId: removedUser,
            post: { creatorId: removerUser, isCloseFriend: true },
        });
        await event.manager.remove(BookmarkEntity, bookmarks);

        // clear comment-likes in closeFriend posts
        const commentLikes = await event.manager.findBy(CommentLikeEntity, {
            userId: removedUser,
            comment: { post: { creatorId: removerUser, isCloseFriend: true } },
        });
        await event.manager.remove(CommentLikeEntity, commentLikes);
    }
}
