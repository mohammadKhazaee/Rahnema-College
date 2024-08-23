import { User } from '../../User/model/user';

export interface Following {
    followerId: string;
    follower: User;
    followedId: string;
    followed: User;
}

export interface FindFollowing {
    followerId: string;
    followedId: string;
}

export interface GetFollowersDao {
    username: string;
    imageUrl: string;
    followersCount: number;
}

export interface GetFollowingsDao {
    username: string;
    imageUrl: string;
    followingsCount: number;
}
