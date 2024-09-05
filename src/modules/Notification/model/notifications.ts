import { NotificationEntity } from '../entity/notification.entity';

export const notifType = [
    'like',
    'mention',
    'acceptedFollow',
    'followedBy',
    'incommingReq',
] as const;

export type NotifType = (typeof notifType)[number];

export type NormalNotifEntity = Exclude<NotificationEntity, 'type'> & {
    type: NotifType;
};

export const isNormalNotifEntity = (entity: NotificationEntity): entity is NormalNotifEntity => {
    return notifType.findIndex((n) => n === entity.type) > -1;
};

export type GetNotifDao =
    | LikeNotif
    | MentionNotif
    | AcceptedFollowNotif
    | IncommingReqNotif
    | FollowedByNotif;

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

export interface NotifWithPost {
    post: {
        postId: string;
        imageUrl: string;
    };
}

export interface AcceptedFollowNotif extends NotifMetaData, NotifWithUser {
    type: 'accepedFollow';
}

export interface IncommingReqNotif extends NotifMetaData, NotifWithUser {
    type: 'incommingReq';
}

export type FollowedByState = 'followed' | 'requested' | 'notFollowed';

export interface FollowedByNotif extends NotifMetaData, NotifWithUser {
    type: 'followedBy';
    followState: FollowedByState;
}

export interface LikeNotif extends NotifMetaData, NotifWithUser, NotifWithPost {
    type: 'like';
}

export interface MentionNotif extends NotifMetaData, NotifWithUser, NotifWithPost {
    type: 'mention';
}

export interface CreateNotif {
    type: NotifType;
    emiterId: string;
}

export interface CreateLikeNotif {
    emiterId: string;
    receiverId: string;
    postId: string;
}

export interface DeleteLikeNotif extends CreateLikeNotif {}

export interface CreateMentionNotif {
    type: 'mention';
    emiterId: string;
    receiverId: string;
}
