import { Following } from '../../Follow/model/follow';
import { PostEntity } from '../../Post/entity/post.entity';
import { Mention } from '../../Post/model/mention';


export interface User {
    username: string;
    email: string;
    password: string;
    fName: string;
    lName: string;
    imageUrl: string;
    bio: string;
    isPrivate: boolean;
    posts?: PostEntity[];
    followings?: Following[];
    followers?: Following[];
    mentions?: PostEntity[];
}

export interface UpdateUser {
    username: string;
    email?: string;
    password?: string;
    fName?: string;
    lName?: string;
    imageUrl?: string;
    bio?: string;
    isPrivate?: boolean;
}

export interface CreateUser {
    username: string;
    password: string;
    email: string;
}

export type userIdentifier =
    | {
        email: string;
    }
    | {
        username: string;
    };
