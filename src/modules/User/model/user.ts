import { PostEntity } from '../../Post/entity/post.entity';
import { Mention } from '../../Post/model/mention';
import { Following } from './follow';

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
    mentions?: Mention[]
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
