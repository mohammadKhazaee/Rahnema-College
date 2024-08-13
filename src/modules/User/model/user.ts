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
