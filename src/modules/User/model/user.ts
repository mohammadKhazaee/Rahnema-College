import { UserRelation } from '../../UserRelation/model/user-relation';
import { PostEntity } from '../../Post/entity/post.entity';

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
    followings?: UserRelation[];
    followers?: UserRelation[];
    mentions?: PostEntity[];
}

export interface UserProfileDao {
    username: string;
    email: string;
    imageUrl: string;
    fName: string;
    lName: string;
    isPrivate: boolean;
    bio: string;
    followersCount: number;
    followingsCount: number;
    postCount: number;
}

export interface UserLinkDao {
    username: string;
    imageUrl: string;
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

export interface GetUserMinInfo {
    username: string;
    lName: string;
    fName: string;
    imageUrl: string;
}
