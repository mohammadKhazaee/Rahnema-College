export const notifType = {
    like: 'like',
    mention: 'mention',
    acceptedFollow: 'acceptedFollow',
    followedBy: 'followedBy',
    incommingReq: 'incommingReq',
} as const;

export type NotifType = keyof typeof notifType;

export type GetNotifDao =
    | LikeNotif
    | MentionNotif
    | AcceptedFollowNotif
    | IncommingReqNotif
    | FollowedByNotif;

export interface NotifWithUser {
    user: {
        username: string;
        fName: string;
        lName: string;
        imageUrl: string;
    };
    createdAt: Date;
    isSeen: boolean;
}

export interface NotifWithPost {
    post: {
        postId: string;
        imageUrl: string;
    };
}

export interface AcceptedFollowNotif extends NotifWithUser {
    type: 'accepedFollow';
}

export interface IncommingReqNotif extends NotifWithUser {
    type: 'incommingReq';
}

export type FollowedByState = 'followed' | 'requested' | 'notFollowed';

export interface FollowedByNotif extends NotifWithUser {
    type: 'followedBy';
    followState: FollowedByState;
}

export interface LikeNotif extends NotifWithUser, NotifWithPost {
    type: 'like';
}

export interface MentionNotif extends NotifWithUser, NotifWithPost {
    type: 'mention';
}

export interface CreateNotif {
    type: NotifType;
    emiterId: string;
}

export interface CreateLikeNotif {
    emiterId: string;
    postId: string;
}

export interface CreateMentionNotif {
    emiterId: string;
    postId: string;
}

export interface CreateCommentNotif {
    emiterId: string;
    commentId: string;
}

export interface CreateAcceptFollowNotif {
    emiterId: string;
}

export interface CreateIncReqNotif {
    emiterId: string;
}

export interface CreateFollowNotif {
    emiterId: string;
    followId: string;
}
