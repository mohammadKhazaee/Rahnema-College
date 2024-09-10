import { User, UserLinkDao } from '../../User/model/user';
import { CreateRelatedPostImage, ImageInfoDao, PostImage } from './image';
import { Mention } from './mention';
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
    mentions: Mention[];
    creator: UserLinkDao;
    imageInfos: ImageInfoDao[];
    caption: string;
    tags: string[];
    createdAt: Date;
    isLiked: boolean;
    likeCount: number;
    commentsCount: number;
    isBookMarked: boolean;
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
    creatorId: string;
    caption?: string;
    tags?: CreateTag[];
    mentions?: User[];
}

export interface ExplorePostsDto {
    postId: string;
    creator: {
        imageUrl: string;
        username: string;
        followersCount: number;
    };
    postImage: string;
    commentCount: number;
    isLiked: boolean;
    likeCount: number;
    isBookMarked: boolean;
    bookmarkCount: number;
}

export interface PostServiceExploreDto {
    postId: string;
    creator: {
        imageUrl: string;
        username: string;
    };
    postImage: string;
    username: string;
    commentCount: number;
    isLiked: boolean;
    likeCount: number;
    isBookMarked: boolean;
    bookmarkCount: number;
}

export interface FindExplorePosts {
    friendCreators: string[];
    NonFriendCreators: string[];
}
