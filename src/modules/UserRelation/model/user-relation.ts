import { GetUserMinInfo, User } from '../../User/model/user';

export const userRelationStatus = {
    blocked: 'blocked',
    gotBlocked: 'gotBlocked',
    requestedFollow: 'requestedFollow',
    follow: 'follow',
    friend: 'friend',
} as const;

export type UserRelationStatus = keyof typeof userRelationStatus;

export type FollowedByState = UserRelationStatus | 'notFollowed';

export interface UserRelation {
    relationId: string;
    followerId: string;
    follower?: User;
    followedId: string;
    followed?: User;
    status: UserRelationStatus;
}

export interface UserRelationId {
    followerId: string;
    followedId: string;
}

export interface CreateUserRelation extends UserRelationId {
    status: UserRelationStatus;
}

export interface FindUserRelation extends UserRelationId {
    status?: UserRelationStatus[];
}

export type FindOneWayRelations =
    | { followerId: string[]; status?: UserRelationStatus[] }
    | { followedId: string[]; status?: UserRelationStatus[] }
    | { followerId: string[]; followedId: string[]; status?: UserRelationStatus[] };

export interface GetFollowBlockListDao extends GetUserMinInfo {
    followersCount: number;
}
