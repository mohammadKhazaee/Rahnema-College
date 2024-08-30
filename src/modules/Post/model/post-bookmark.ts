export interface CreatePostBookmark {
    userId: string;
    postId: string;
}

export interface PostBookmarkId {
    userId: string;
    postId: string;
}

export interface BookmarkResultDao {
    message: string;
    bookmarkCount: number;
}
