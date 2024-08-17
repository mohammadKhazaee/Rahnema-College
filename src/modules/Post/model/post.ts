import { User } from '../../User/model/user';
import { CreateRelatedPostImage, PostImage } from './image';
import { CreateTag, Tag } from './tag';

export interface Post {
    postId: string;
    caption: string;
    creatorId: string;
    creator: User;
    tags?: Tag[];
    images?: PostImage[];
    mentions?: User[];
}

export interface PostTag {
    tagId: string;
    tag: Tag;
    postId: string;
    post: Post;
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
