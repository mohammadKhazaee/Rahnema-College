import { imageUrlPath } from '../../utility/path-adjuster';
import { User } from '../User/model/user';
import { UserService } from '../User/user.service';
import { CreatePostDto } from './dto/create-post-dto';
import {
    CreatePost,
    ExplorePostsDto,
    FindExplorePosts,
    FormatedSinglePost,
    GetBookmarkedPostsDao,
    GetPostDao,
    GetPostsByTagDao,
    GetPostsDao,
    GetSimilarTagsDao,
    Post,
    PostWithImages,
} from './model/post';
import { CreateTag, Tag } from './model/tag';
import { PostRepository } from './post.repository';
import { EditPostDto } from './dto/edit-post-dto';
import { TagRepository } from './tag.repository';
import { CreateRelatedPostImage } from './model/image';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostCommentRepository } from './post-comment.repository';
import { GetCommentsDao, PostCommentWithReplays } from './model/post-comment';
import { PostLikeRepository } from './post-like.repository';
import { LikeResultDao, PostLikeId } from './model/post-like';
import { CommentLikeId } from './model/post-comment-like';
import { CommentLikeRepository } from './comment-like.repository';
import { BookmarkRepository } from './bookmark.repository';
import { PaginationDto } from '../Common/dto/pagination-dto';
import { PostImageEntity } from './entity/post-image.entity';
import { FileParser, IFile } from '../../utility/file-parser';
import { PostImageRepository } from './image.repository';
import { BookmarkResultDao, PostBookmarkId } from './model/post-bookmark';
import { CreateLikeNotif } from '../Notification/model/notifications';
import { UserRelationService } from '../UserRelation/user-relation.service';
import { PostEntity } from './entity/post.entity';
import { PostCommentEntity } from './entity/post-comment.entity';
import { ForbiddenError, NotFoundError } from '../../utility/errors/userFacingError';
import {
    CreateCommentReason,
    CreatePostReason,
    GetPostReason,
    GetUserPostsReason,
    LikeCommentReason,
    UpdatePostReason,
} from '../../utility/errors/error-reason';
import ApplicationError from '../../utility/errors/applicationError';

export class PostService {
    constructor(
        private postRepo: PostRepository,
        private postCommentRepo: PostCommentRepository,
        private commentLikeRepo: CommentLikeRepository,
        private postLikeRepo: PostLikeRepository,
        private tagRepo: TagRepository,
        private userService: UserService,
        private followService: UserRelationService,
        private bookmarkRepo: BookmarkRepository,
        private imageRepo: PostImageRepository
    ) {}

    async getPostById(
        postId: string,
        userId: string
    ): Promise<GetPostDao | NotFoundError | ForbiddenError> {
        const post = await this.canAccessPost(postId, userId);
        if (post instanceof ApplicationError) return post;

        const [isLiked, likeCount, commentsCount, isBookMarked, bookMarkCount] = await Promise.all([
            this.postLikeRepo.doesLikeExists({ postId, userId }),
            this.postLikeRepo.countLikesForPost(postId),
            this.postCommentRepo.countCommentsForPost(postId),
            this.bookmarkRepo.isItBookmarked({ postId, userId }),
            this.bookmarkRepo.countBookmarksForPost(postId),
        ]);

        return {
            ...this.formatSinglePost(post),
            isLiked,
            likeCount,
            commentsCount,
            isBookMarked,
            bookMarkCount,
        };
    }

    async togglePostBookmark({
        userId,
        postId,
    }: PostBookmarkId): Promise<BookmarkResultDao | NotFoundError | ForbiddenError> {
        const isAuthorized = await this.canAccessPost(postId, userId);
        if (isAuthorized instanceof ApplicationError) return isAuthorized;

        const bookmark = await this.bookmarkRepo.findBookmark({ userId, postId });

        if (bookmark) {
            await this.bookmarkRepo.removeBookmark(bookmark);
            return {
                message: 'unbookmarked post',
                bookmarkCount: await this.bookmarkRepo.countBookmarksForPost(postId),
            };
        }
        await this.bookmarkRepo.saveBookmark({ userId, postId });
        return {
            message: 'bookmarked post',
            bookmarkCount: await this.bookmarkRepo.countBookmarksForPost(postId),
        };
    }

    async updatePost(
        username: string,
        { postId, mentions, caption, deletedImages, isCloseFriend, images }: EditPostDto,
        fileHandler: FileParser
    ): Promise<
        | {
              message: string;
              updatedPost: FormatedSinglePost;
          }
        | NotFoundError
        | ForbiddenError
    > {
        const post = await this.postRepo.findPostById(postId);
        if (!post) return new NotFoundError(UpdatePostReason.PostNotFound, 'Post not found');

        if (post.creatorId !== username)
            return new ForbiddenError(
                UpdatePostReason.NonCreator,
                'only creator of the post can edit it'
            );

        const oldMentions = post.mentions;

        let tags: Tag[] | undefined;
        if (caption !== undefined) tags = await this.makeUpdateTags(caption);

        let mentionedUsers;
        if (mentions) {
            mentionedUsers = await this.verifyMentionedExists(mentions);
            if (mentionedUsers instanceof ApplicationError) return mentionedUsers;
        }

        let newImageEntities: PostImageEntity[] = [];
        if (images) {
            newImageEntities = await this.CreatePostImageEnities(images, postId);
            post.images = [...post.images, ...newImageEntities];
        }

        if (caption !== undefined) post.caption = caption;
        if (tags) post.tags = tags;
        if (mentionedUsers) post.mentions = mentionedUsers;

        const updatedPost = await this.postRepo.update(post, oldMentions);

        if (deletedImages.length > 0) {
            await this.imageRepo.deleteBulkById(deletedImages.map((i) => i.imageId));

            await fileHandler.deleteFiles(deletedImages.map((i) => i.url));
        }

        return {
            message: 'post updated successfully',
            updatedPost: this.formatSinglePost(updatedPost),
        };
    }

    async createPost(
        { mentions, caption, images }: CreatePostDto,
        creatorId: string
    ): Promise<
        | {
              message: string;
              createdPost: FormatedSinglePost;
          }
        | NotFoundError
    > {
        const tags = await this.makeCreateTags(caption);

        let mentionedUsers = await this.verifyMentionedExists(mentions);
        if (mentionedUsers instanceof ApplicationError) return mentionedUsers;

        const preparedImageUrls: CreateRelatedPostImage[] = images.map((i) => ({
            url: imageUrlPath(i.path),
        }));

        const newPost: CreatePost = {
            caption: caption,
            creatorId: creatorId,
            tags,
            images: preparedImageUrls,
            mentions: mentionedUsers,
        };

        const createdPost = await this.postRepo.create(newPost);

        return {
            message: 'post created successfully',
            createdPost: this.formatSinglePost(createdPost),
        };
    }

    async getUserPosts(
        username: string,
        viewerId: string,
        { p: page, c: take }: PaginationDto
    ): Promise<{ posts: GetPostsDao[] } | NotFoundError | ForbiddenError> {
        const isAuthorized = await this.canAccessCloseFriendPost(username, viewerId);
        if (isAuthorized instanceof ApplicationError) return isAuthorized;

        const skip = (page - 1) * take;
        const posts = await this.postRepo.getPosts(username, isAuthorized, { take, skip });

        const resultPosts: GetPostsDao[] = posts.map((p) => ({
            postId: p.postId,
            imageInfo: { imageId: p.images[0].imageId, url: p.images[0].url },
        }));

        return { posts: resultPosts };
    }

    async getPostCount(username: string): Promise<number> {
        return this.postRepo.countPostsByUsername(username);
    }

    async createComment(
        dto: CreateCommentDto,
        commenterId: string
    ): Promise<PostCommentWithReplays | NotFoundError | ForbiddenError> {
        const isAuthorized = await this.canAccessPost(dto.postId, commenterId);
        if (isAuthorized instanceof ApplicationError) return isAuthorized;

        if (
            dto.type === 'replay' &&
            !(await this.canReplayComment(dto.parentId, dto.postId, commenterId))
        )
            return new ForbiddenError(
                CreateCommentReason.BlockedCommentor,
                'you have no access to the comment'
            );

        const { type, ...createCommentData } = dto;

        return this.postCommentRepo.save({ commenterId, ...createCommentData });
    }

    async getComments(
        postId: string,
        viewerId: string,
        { p: page, c: count }: PaginationDto
    ): Promise<
        | {
              comments: GetCommentsDao[];
          }
        | NotFoundError
        | ForbiddenError
    > {
        const isAuthorized = await this.canAccessPost(postId, viewerId);
        if (isAuthorized instanceof ApplicationError) return isAuthorized;

        const skip = (page - 1) * count;
        const comments = await this.postCommentRepo.getComments(postId, count, skip);

        const allowedComments = [];

        for (let i = 0; i < comments.length; i++)
            if (await this.isReplayableComment(comments[i].commentId, postId, viewerId))
                allowedComments.push(comments[i]);

        return { comments: await this.formatComments(allowedComments, viewerId) };
    }

    async togglePostLike(
        likeId: PostLikeId
    ): Promise<LikeResultDao | NotFoundError | ForbiddenError> {
        const post = await this.canAccessPost(likeId.postId, likeId.userId);
        if (post instanceof ApplicationError) return post;

        const createLikeNotif: CreateLikeNotif = {
            emiterId: likeId.userId,
            receiverId: post.creatorId,
            postId: likeId.postId,
        };

        if (await this.postLikeRepo.doesLikeExists(likeId)) {
            await this.postLikeRepo.delete(createLikeNotif);
            return {
                message: 'unliked post',
                likeCount: await this.postLikeRepo.countLikesForPost(likeId.postId),
            };
        }

        await this.postLikeRepo.save(createLikeNotif);

        return {
            message: 'liked post',
            likeCount: await this.postLikeRepo.countLikesForPost(likeId.postId),
        };
    }

    async toggleCommentLike(
        commentLikeId: CommentLikeId
    ): Promise<LikeResultDao | NotFoundError | ForbiddenError> {
        const isAuthorized = await this.canAccessComment(
            commentLikeId.commentId,
            commentLikeId.userId
        );
        if (isAuthorized instanceof ApplicationError) return isAuthorized;

        if (await this.commentLikeRepo.doesLikeExists(commentLikeId)) {
            await this.commentLikeRepo.delete(commentLikeId);
            return {
                message: 'unliked comment',
                likeCount: await this.commentLikeRepo.countLikesForComment(commentLikeId.commentId),
            };
        }

        await this.commentLikeRepo.save(commentLikeId);

        return {
            message: 'liked comment',
            likeCount: await this.commentLikeRepo.countLikesForComment(commentLikeId.commentId),
        };
    }

    async explorePosts(
        username: string,
        { p: page, c: take }: PaginationDto
    ): Promise<ExplorePostsDto[]> {
        // all post creators
        const followings = (
            await this.followService.fetchRelations({
                followerId: [username],
                status: ['follow', 'friend'],
            })
        ).map((f) => f.followedId);

        if (followings.length === 0) return [];

        // creators that we're their friend
        const friends = (
            await this.followService.fetchRelations({
                followerId: followings,
                followedId: [username],
                status: ['friend'],
            })
        ).map((f) => f.followerId);

        const friendCreators = followings.filter((f) => friends.includes(f));
        const nonFriendCreators = followings.filter((f) => !friends.includes(f));

        const findExplorePostsData: FindExplorePosts = { friendCreators, nonFriendCreators };

        const skip = (page - 1) * take;

        const authorizedPosts = await this.postRepo.explorePosts(findExplorePostsData, {
            take,
            skip,
        });

        return this.formatExplorePost(authorizedPosts);
    }

    private formatComments(
        comments: PostCommentEntity[],
        viewerId: string
    ): Promise<GetCommentsDao[]> {
        return Promise.all(
            comments.map(async (c) => ({
                commentId: c.commentId,
                commentor: {
                    username: c.commenter.username,
                    imageUrl: c.commenter.imageUrl,
                },
                likeCount: await this.commentLikeRepo.countLikesForComment(c.commentId),
                isLiked: await this.commentLikeRepo.doesLikeExists({
                    commentId: c.commentId,
                    userId: viewerId,
                }),
                content: c.content,
                createDate: c.createdAt,
                replays: await Promise.all(
                    c.replays.map(async (r) => ({
                        commentId: r.commentId,
                        commentor: {
                            username: r.commenter.username,
                            imageUrl: r.commenter.imageUrl,
                        },
                        content: r.content,
                        createDate: r.createdAt,
                        likeCount: await this.commentLikeRepo.countLikesForComment(r.commentId),
                        isLiked: await this.commentLikeRepo.doesLikeExists({
                            commentId: r.commentId,
                            userId: viewerId,
                        }),
                    }))
                ),
            }))
        );
    }

    private formatSinglePost(post: Post): FormatedSinglePost {
        return {
            postId: post.postId,
            mentions: post.mentions.map((m) => m.username),
            creator: {
                username: post.creator.username,
                fName: post.creator.fName,
                lName: post.creator.lName,
                imageUrl: post.creator.imageUrl,
            },
            imageInfos: post.images.map((i) => ({
                url: i.url,
                imageId: i.imageId,
            })),
            caption: post.caption,
            tags: post.tags.map((t) => t.name),
            createdAt: post.createdAt,
        };
    }

    private formatExplorePost(posts: PostEntity[]): Promise<ExplorePostsDto[]> {
        return Promise.all(
            posts.map(async (p) => ({
                postId: p.postId,
                creator: {
                    username: p.creatorId,
                    imageUrl: p.creator.imageUrl,
                    followersCount: await this.followService.getFollowersCount(p.creator.username),
                },
                postImage: p.images[0].url,
                commentCount: await this.postCommentRepo.countCommentsForPost(p.postId),
                isLiked: await this.postLikeRepo.doesLikeExists({
                    postId: p.postId,
                    userId: p.creatorId,
                }),
                likeCount: await this.postLikeRepo.countLikesForPost(p.postId),
                isBookMarked: await this.bookmarkRepo.isItBookmarked({
                    postId: p.postId,
                    userId: p.creatorId,
                }),
                bookmarkCount: await this.bookmarkRepo.countBookmarksForPost(p.postId),
            }))
        );
    }

    private async canAccessCloseFriendPost(
        creatorId: string,
        viewerId: string
    ): Promise<boolean | NotFoundError | ForbiddenError> {
        if (creatorId === viewerId) return true;

        const creator = await this.userService.fetchUser({ username: creatorId });
        if (!creator)
            return new NotFoundError(
                GetUserPostsReason.NotFoundUser,
                'Targeted User was not found'
            );

        const creatorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: creatorId,
            followedId: viewerId,
        });
        const userStatusToCreator = await this.followService.fetchRelationStatus({
            followedId: creatorId,
            followerId: viewerId,
        });

        if (creatorStatusToUser === 'blocked' || creatorStatusToUser === 'gotBlocked')
            return new ForbiddenError(
                GetUserPostsReason.BlockedCreator,
                'you or creator have blocked eachother'
            );

        if (
            creator.isPrivate &&
            (userStatusToCreator === 'notFollowed' || userStatusToCreator === 'requestedFollow')
        )
            return new ForbiddenError(GetUserPostsReason.FollowerOnly, 'you have to be a follower');

        return creatorStatusToUser === 'friend';
    }

    private async canAccessComment(
        commentId: string,
        viewerId: string
    ): Promise<void | NotFoundError | ForbiddenError> {
        const comment = await this.postCommentRepo.findCommentById(commentId);
        if (!comment)
            return new NotFoundError(LikeCommentReason.NotFoundComment, 'Comment not found');

        const post = await this.postRepo.findPostById(comment.postId);
        if (!post) return new NotFoundError(LikeCommentReason.NotFoundPost, 'Post not found');

        if (post.creatorId === viewerId) return;

        const creatorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: comment.post.creatorId,
            followedId: viewerId,
        });
        const commentorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: comment.commenterId,
            followedId: viewerId,
        });
        const userStatusToCreator = await this.followService.fetchRelationStatus({
            followedId: comment.post.creatorId,
            followerId: viewerId,
        });

        if (creatorStatusToUser === 'blocked' || creatorStatusToUser === 'gotBlocked')
            return new ForbiddenError(
                LikeCommentReason.BlockedCreator,
                'you or creator have blocked eachother'
            );

        if (
            comment.post.creator.isPrivate &&
            (userStatusToCreator === 'notFollowed' || userStatusToCreator === 'requestedFollow')
        )
            return new ForbiddenError(LikeCommentReason.FollowerOnly, 'you have to be a follower');

        if (comment.post.isCloseFriend && creatorStatusToUser !== 'friend')
            return new ForbiddenError(
                LikeCommentReason.FriendOnly,
                'you have to be a friend of creator'
            );

        if (commentorStatusToUser === 'blocked' || commentorStatusToUser === 'gotBlocked')
            return new ForbiddenError(
                LikeCommentReason.BlockedCommentor,
                'you have to be a friend of creator'
            );
    }

    private async canReplayComment(
        commentId: string,
        postId: string,
        viewerId: string
    ): Promise<boolean | NotFoundError | ForbiddenError> {
        const post = await this.postRepo.findPostById(postId);
        if (!post) return new NotFoundError(CreateCommentReason.NotFoundPost, 'Post not found');

        if (post.creatorId === viewerId) return true;

        const comment = await this.postCommentRepo.findCommentById(commentId);
        if (!comment)
            return new NotFoundError(CreateCommentReason.NotFoundComment, 'Comment not found');

        const creatorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: post.creatorId,
            followedId: viewerId,
        });
        const commentorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: comment.commenterId,
            followedId: viewerId,
        });
        const userStatusToCreator = await this.followService.fetchRelationStatus({
            followedId: post.creatorId,
            followerId: viewerId,
        });

        if (creatorStatusToUser === 'blocked' || creatorStatusToUser === 'gotBlocked')
            return new ForbiddenError(
                CreateCommentReason.BlockedCreator,
                'you or creator have blocked eachother'
            );

        if (
            post.creator.isPrivate &&
            (userStatusToCreator === 'notFollowed' || userStatusToCreator === 'requestedFollow')
        )
            return new ForbiddenError(
                CreateCommentReason.FollowerOnly,
                'you have to be a follower'
            );

        if (post.isCloseFriend && creatorStatusToUser !== 'friend')
            return new ForbiddenError(
                CreateCommentReason.FriendOnly,
                'you have to be a friend of creator'
            );

        return commentorStatusToUser !== 'blocked' && commentorStatusToUser !== 'gotBlocked';
    }

    private async isReplayableComment(
        commentId: string,
        postId: string,
        viewerId: string
    ): Promise<boolean | never> {
        const post = await this.postRepo.findPostById(postId);
        if (!post) return false;

        if (post.creatorId === viewerId) return true;

        const comment = await this.postCommentRepo.findCommentById(commentId);
        if (!comment) return false;

        const creatorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: post.creatorId,
            followedId: viewerId,
        });
        const commentorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: comment.commenterId,
            followedId: viewerId,
        });
        const userStatusToCreator = await this.followService.fetchRelationStatus({
            followedId: post.creatorId,
            followerId: viewerId,
        });

        if (creatorStatusToUser === 'blocked' || creatorStatusToUser === 'gotBlocked') return false;

        if (
            post.creator.isPrivate &&
            (userStatusToCreator === 'notFollowed' || userStatusToCreator === 'requestedFollow')
        )
            return false;

        if (post.isCloseFriend && creatorStatusToUser !== 'friend') return false;

        return commentorStatusToUser !== 'blocked' && commentorStatusToUser !== 'gotBlocked';
    }

    private async canAccessPost(
        postId: string,
        viewerId: string
    ): Promise<Post | NotFoundError | ForbiddenError> {
        const post = await this.postRepo.findPostById(postId);
        if (!post) return new NotFoundError(GetPostReason.NotFoundPost, 'Post not found');

        if (post.creatorId === viewerId) return post;

        const creatorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: post.creatorId,
            followedId: viewerId,
        });
        const userStatusToCreator = await this.followService.fetchRelationStatus({
            followedId: post.creatorId,
            followerId: viewerId,
        });

        if (creatorStatusToUser === 'blocked' || creatorStatusToUser === 'gotBlocked')
            return new ForbiddenError(
                GetPostReason.BlockedCreator,
                'you or creator have blocked eachother'
            );

        if (
            post.creator.isPrivate &&
            (userStatusToCreator === 'notFollowed' || userStatusToCreator === 'requestedFollow')
        )
            return new ForbiddenError(GetPostReason.FollowerOnly, 'you have to be a follower');

        if (post.isCloseFriend && creatorStatusToUser !== 'friend')
            return new ForbiddenError(
                GetPostReason.FriendOnly,
                'you have to be a friend of creator'
            );

        return post;
    }

    private async CreatePostImageEnities(images: IFile[], postId: string) {
        return images.map((i) => {
            const image = new PostImageEntity();
            image.url = imageUrlPath(i.path);
            image.postId = postId;
            return image;
        });
    }

    private async makeCreateTags(caption: string) {
        const tags = this.extractTags(caption);
        const existingTags = await this.tagRepo.findTagsByNames(tags);

        let newTags: CreateTag[] = [];
        for (const tag of tags) {
            if (!existingTags.find((t) => t.name === tag)) newTags.push({ name: tag });
        }

        return [...newTags, ...existingTags];
    }

    private async makeUpdateTags(caption: string) {
        const tags = this.extractTags(caption);
        const existingTags = await this.tagRepo.findTagsByNames(tags);

        let newTags: CreateTag[] = [];
        for (const tag of tags) {
            if (!existingTags.find((t) => t.name === tag)) newTags.push({ name: tag });
        }
        const newTagEntities: Tag[] = await this.tagRepo.saveBulk(newTags);

        return [...newTagEntities, ...existingTags];
    }

    private extractTags(caption: string): string[] {
        return caption
            .split(' ')
            .filter((s) => s.includes('#'))
            .flatMap((s) => s.split('#'))
            .filter((s) => s !== '');
    }

    private async verifyMentionedExists(mentions: string[]): Promise<User[] | NotFoundError> {
        const mentionedUsers: (User | null)[] = await Promise.all(
            mentions.map((userId) => this.userService.fetchUser({ username: userId }))
        );

        if (!mentionedUsers.every((u) => u !== null))
            return new NotFoundError(
                CreatePostReason.NotFoundMentions,
                'couldnt find mentioned user'
            );

        return mentionedUsers as any;
    }

    async searchTags(
        searchPattern: string,
        { p: page, c: take }: PaginationDto
    ): Promise<GetSimilarTagsDao> {
        const skip = (page - 1) * take;
        const [tags, totalCount] = await Promise.all([
            this.tagRepo.searchTags(searchPattern, { take, skip }),
            this.tagRepo.getTagCountByPattern(searchPattern),
        ]);

        return {
            tags: tags.map((tag) => tag.name),
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / take),
        };
    }

    async getPostsByTag(
        tagName: string,
        viewerId: string,
        { p: page, c: take }: PaginationDto
    ): Promise<GetPostsByTagDao> {
        const skip = (page - 1) * take;
        const [posts, totalCount] = await Promise.all([
            this.postRepo.getPostsByTag(tagName, { take, skip }),
            this.postRepo.getPostCountByTag(tagName),
        ]);

        const accessiblePosts = await Promise.all(
            posts.map(async (post) => {
                try {
                    await this.canAccessPost(post.postId, viewerId);
                    return post;
                } catch (error) {
                    return null;
                }
            })
        );

        const filteredPosts: GetPostsDao[] = accessiblePosts
            .filter((post): post is PostWithImages => post !== null)
            .map((p) => ({
                postId: p.postId,
                imageInfo: {
                    imageId: p.images[0].imageId,
                    url: p.images[0].url,
                },
            }));

        return {
            posts: filteredPosts,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / take),
        };
    }
    async getBookmarkedPosts(
        userId: string,
        { p: page, c: take }: PaginationDto
    ): Promise<GetBookmarkedPostsDao[]> {
        const skip = (page - 1) * take;
        const posts = await this.bookmarkRepo.getBookmarkedPosts(userId, { take, skip });

        const formattedPosts: GetBookmarkedPostsDao[] = posts.map((post) => ({
            postId: post.postId,
            imageInfo: {
                url: post.images[0].url,
                imageId: post.images[0].imageId,
            },
        }));

        return formattedPosts;
    }
    async getMentionedPosts(
        username: string,
        { p: page, c: take }: PaginationDto
    ): Promise<GetBookmarkedPostsDao[]> {
        const skip = (page - 1) * take;
        const posts = await this.postRepo.getMentionedPosts(username, { take, skip });

        const formattedPosts: GetBookmarkedPostsDao[] = posts.map((post) => ({
            postId: post.postId,
            imageInfo: {
                url: post.images[0]?.url || '',
                imageId: post.images[0]?.imageId || '',
            },
        }));

        return formattedPosts;
    }
}
