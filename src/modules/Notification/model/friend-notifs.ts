import { NotificationEntity } from '../entity/notification.entity';

export const friendNotifType = ['friendComment', 'friendLike', 'friendFollow'] as const;

export type FriendNotifType = (typeof friendNotifType)[number];

export type FriendNotifEntity = Exclude<NotificationEntity, 'type'> & {
    type: FriendNotifType;
};

export const isFriendNotifEntity = (entity: NotificationEntity): entity is FriendNotifEntity => {
    return friendNotifType.findIndex((n) => n === entity.type) > -1;
};

export type GetFriendNotifDao = CommentNotif | FriendLikeNotif | FollowNotif;

export interface NotifMetaData {
    createdAt: Date;
    isSeen: boolean;
}

export interface NotifWithUser {
    user: {
        username: string;
        fName: string;
        lName: string;
        imageUrl: string;
    };
}

export interface FriendLikeNotif extends NotifMetaData, NotifWithUser {
    type: 'like';
    postId: string;
}

export interface CommentNotif extends NotifMetaData, NotifWithUser {
    type: 'comment';
    post: {
        postId: string;
        imageUrl: string;
        commentContent: string;
    };
}

export type FollowState = 'followed' | 'requested' | 'notFollowed';

export interface FollowNotif extends NotifMetaData, NotifWithUser {
    type: 'follow';
    followState: FollowState;
    friendUser: {
        username: string;
        fName: string;
        lName: string;
    };
}

export interface CreateFriendFollowNotif {
    type: 'friendFollow';
    emiterId: string;
    receiverId: string;
}

export interface CreateFriendCommentNotif {
    type: 'friendComment';
    emiterId: string;
    receiverId: string;
}
