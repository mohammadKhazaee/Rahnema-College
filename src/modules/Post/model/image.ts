export interface CreateRelatedPostImage {
    url: string;
}
export interface CreatePostImage {
    url: string;
    postId: string;
}

export interface PostImage {
    imageId: string;
    url: string;
    postId: string;
}

export interface ImageInfoDao {
    url: string;
    imageId: string;
}
