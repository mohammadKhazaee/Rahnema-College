import { User } from '../../User/model/user';
import { CreateRelatedPostImage, PostImage } from './image';
import { CreateTag, Tag } from './tag';

export interface Post {
    postId: string;
    caption: string;
    creatorId: string;
    creator: User;
    tags?: PostTag[];
    images?: PostImage[];
    mentions?: Mention[];
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
    tags?: Tag[];
    images?: PostImage[];
    mentions?: User[];
}

export interface CreatePost {
    caption: string;
    creatorId: string;
    tags: CreateTag[];
    images: CreateRelatedPostImage[];
    mentions: User[];
}

export interface UpdatePost {
    postId: number;
    caption?: string;
    tags?: CreateTag[];
    mentions?: User[];
}
