import { User } from "../../User/model/user";
import { Mention } from "./mention";

export interface Post {
    postId: number;
    caption: string;
    creatorId: string;
    creator: User;
    tags: PostTag[];
    images: PostImage[]
    mentions: Mention[]
}

export interface PostImage {
    imageId: number;
    url: string;
    postId: string;
    post: Post
}

export interface PostTag {
    tagId: number;
    tag: Tag;
    postId: number;
    post: Post

}

export interface Tag {
    tagId: number;
    name: string;
    posts: PostTag[]
}