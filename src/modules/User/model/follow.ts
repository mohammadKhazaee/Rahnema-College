import { User } from "./user";

export interface Following {
    followerId: string,
    follower: User,
    followedId: string,
    followed: User,
}
