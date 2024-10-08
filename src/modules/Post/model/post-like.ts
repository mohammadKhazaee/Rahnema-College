export interface CreatePostLike {
    userId: string;
    postId: string;
}

export interface PostLikeId {
    userId: string;
    postId: string;
}

export interface LikeResultDao {
    message: string;
    likeCount: number;
}
