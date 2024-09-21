export interface CreatePostComment {
    content: string;
    commenterId: string;
    postId: string;
}

export interface PostComment {
    commentId: string;
    content: string;
    commenterId: string;
    postId: string;
}

export interface PostCommentWithReplays {
    commentId: string;
    content: string;
    commenterId: string;
    postId: string;
    replays: PostComment[];
}

export interface GetCommentsDao {
    commentId: string;
    commentor: {
        username: string;
        imageUrl: string;
    };
    likeCount: number;
    isLiked: boolean;
    content: string;
    createDate: Date;
    replays: {
        commentId: string;
        commentor: {
            username: string;
            imageUrl: string;
        };
        content: string;
        createDate: Date;
        likeCount: number;
        isLiked: boolean;
    }[];
}
