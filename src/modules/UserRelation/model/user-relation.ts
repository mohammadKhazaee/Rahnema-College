import { User } from '../../User/model/user';

export const userRelationStatus = {
    blocked: 'blocked',
    requestedFollow: 'requestedFollow',
    follow: 'follow',
    friend: 'friend',
} as const;

export type UserRelationStatus = keyof typeof userRelationStatus;

export interface UserRelation {
    followerId: string;
    follower: User;
    followedId: string;
    followed: User;
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

export interface GetFollowListDao {
    username: string;
    imageUrl: string;
    followersCount: number;
}
