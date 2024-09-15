import { User, UserLinkDao } from '../../User/model/user';
import { CreateRelatedPostImage, ImageInfoDao, PostImage } from './image';
import { CreateTag, Tag } from './tag';

export interface Post {
    postId: string;
    caption: string;
    isCloseFriend: boolean;
    creatorId: string;
    creator: User;
    tags: Tag[];
    images: PostImage[];
    mentions: User[];
    createdAt: Date;
    updatedAt: Date;
}

export interface GetPostDao extends FormatedSinglePost {
    isLiked: boolean;
    likeCount: number;
    commentsCount: number;
    isBookMarked: boolean;
    bookMarkCount: number;
}

export interface FormatedSinglePost {
    postId: string;
    mentions: string[];
    creator: UserLinkDao;
    imageInfos: ImageInfoDao[];
    caption: string;
    tags: string[];
    createdAt: Date;
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

export interface FindExplorePosts {
    friendCreators: string[];
    NonFriendCreators: string[];
}
export interface GetPostsByTagDao {
    posts: GetPostsDao[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

export interface GetSimilarTagsDao {
    tags: string[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}
export interface GetBookmarkedPostsDao {
    postId: string;
    imageInfo: {
        url: string;
        imageId: string;
    };
}
