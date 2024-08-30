export const notifType = {
    like: 'like',
    mention: 'mention',
    acceptedFollow: 'acceptedFollow',
    incommingReq: 'incommingReq',
    comment: 'comment',
    follow: 'follow',
} as const;

export type NotifType = keyof typeof notifType;

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
