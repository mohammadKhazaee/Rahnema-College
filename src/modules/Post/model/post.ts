import { User } from '../../User/model/user';
import { Mention } from './mention';
import { CreatePostImage } from './image';
import { CreateTag } from './tag';

export interface Post {
    postId: string;
    caption: string;
    creatorId: string;
    creator: User;
    tags: PostTag[];
    images: PostImage[];
    mentions: Mention[];
}

export interface PostImage {
    imageId: string;
    url: string;
    postId: string;
    post: Post;
}

export interface PostTag {
    tagId: string;
    tag: Tag;
    postId: string;
    post: Post;
}

export interface Tag {
    tagId: string;
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
