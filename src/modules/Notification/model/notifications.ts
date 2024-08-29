export const notifType = {
    like: 'like',
    mention: 'mention',
    acceptedFollow: 'acceptedFollow',
    followedBy: 'followedBy',
    incommingReq: 'incommingReq',
    comment: 'comment',
    follow: 'follow',
} as const;

export type NotifType = keyof typeof notifType;

export interface CreateNotif {
    type: NotifType;
    emiterId: string;
}

export type CreateNotifDto =
    | {
          type: 'like' | 'mention';
          emiterId: string;
          postId: string;
          imageUrl: string;
      }
    | {
          type: 'comment';
          emiterId: string;
          commentId: string;
      }
    | {
          type: 'acceptedFollow' | 'incommingReq' | 'followedBy';
          emiterId: string;
      }
    | {
          type: 'follow';
          emiterId: string;
          followedId: string;
      };

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

export interface CreateFollowedByNotif {
    emiterId: string;
}

export interface CreateFollowNotif {
    emiterId: string;
    followedId: string;
}
