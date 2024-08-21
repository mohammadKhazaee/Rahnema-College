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
