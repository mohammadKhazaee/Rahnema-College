import { User } from '../../User/model/user';
import { Post } from './post';

export interface Mention {
    postId: string;
    mentionedId: string;
    image: string;
}