import { User, UserLinkDao } from '../../User/model/user';
import { CreateRelatedPostImage, ImageInfoDao, PostImage } from './image';
import { CreateTag, Tag } from './tag';

export interface Post {
    postId: string;
    caption: string;
    creatorId: string;
    creator: User;
    tags: Tag[];
    images: PostImage[];
    mentions: User[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GetPostDao {
    postId: string;
    creator: UserLinkDao;
    imageInfos: ImageInfoDao[];
    caption: string;
    tags: string[];
    likeCount: number;
    commentsCount: number;
    bookMarkCount: number;
}

export interface PostWithImages {
    postId: string;
    caption: string;
    creatorId: string;
    creator: User;
    images: PostImage[];
}

export interface GetPostsDao {
    postId: string;
    imageInfo: {
        url: string;
        imageId: string;
    };
}

export interface CreatePost {
    caption: string;
    creatorId: string;
    tags: CreateTag[];
    images: CreateRelatedPostImage[];
    mentions: User[];
}

export interface UpdatePost {
    postId: string;
    caption?: string;
    tags?: CreateTag[];
    mentions?: User[];
}
