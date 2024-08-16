export interface CreateRelatedPostImage {
    url: string;
}
export interface CreatePostImage {
    url: string;
    postId: number;
}

export interface PostImage {
    imageId: number;
    url: string;
    postId: number;
}
