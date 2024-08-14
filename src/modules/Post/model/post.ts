import { User } from '../../User/model/user';
import { Mention } from './mention';
import { CreatePostImage } from './image';
import { CreateTag } from './tag';

export interface Post {
    postId: number;
    caption: string;
    creatorId: string;
    creator: User;
    tags: PostTag[];
    images: PostImage[];
    mentions: Mention[];
}

export interface PostImage {
    imageId: number;
    url: string;
    postId: string;
    post: Post;
}

export interface PostTag {
    tagId: number;
    tag: Tag;
    postId: number;
    post: Post;
}

export interface Tag {
    tagId: number;
    name: string;
    posts: PostTag[];
}

export interface CreatePost {
    caption: string;
    creatorId: string;
    tags: CreateTag[];
    images: CreatePostImage[];
    mentions: User[];
}
