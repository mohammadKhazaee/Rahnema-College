import { User } from "../../User/model/user";


export interface Following {
    followerId: string,
    follower: User,
    followedId: string,
    followed: User,
}
