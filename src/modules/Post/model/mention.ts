import { User } from "../../User/model/user";
import { Post } from "./post";

export interface Mention {
    mentionedId: string;
    mentioned: User;
    postId: number;
    post: Post;
}