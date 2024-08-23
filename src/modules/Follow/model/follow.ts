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
