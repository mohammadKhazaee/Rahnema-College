import { HttpError } from '../../utility/errors';
import { imageUrlPath } from '../../utility/path-adjuster';
import { User } from '../User/model/user';
import { UserService } from '../User/user.service';
import { CreatePostDto } from './dto/create-post-dto';
import {
    CreatePost,
    ExplorePostsDto,
    FindExplorePosts,
    FormatedSinglePost,
    GetPostDao,
    GetPostsDao,
    Post,
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

    async getPostById(postId: string, userId: string): Promise<GetPostDao> {
        const post = await this.postRepo.findPostById(postId);
        if (!post) throw new HttpError(404, 'Post not found');

        const creatorStatusToUser = await this.followService.fetchRelationStatus({
            followerId: post.creatorId,
            followedId: userId,
        });
        const userStatusToCreator = await this.followService.fetchRelationStatus({
            followedId: post.creatorId,
            followerId: userId,
        });

        if (creatorStatusToUser === 'blocked' || creatorStatusToUser === 'gotBlocked')
            throw new HttpError(403, 'you or creator have blocked eachother');

        if (post.creator.isPrivate && userStatusToCreator === 'notFollowed')
            throw new HttpError(403, 'you have to be a follower');

        if (post.isCloseFriend && creatorStatusToUser !== 'friend')
            throw new HttpError(403, 'you have to be a friend of creator');

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

    async togglePostBookmark({ userId, postId }: PostBookmarkId): Promise<BookmarkResultDao> {
        if (!this.postRepo.doesPostExist(postId)) throw new HttpError(404, 'Post was not found');

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
        { postId, mentions, caption, deletedImages, images }: EditPostDto,
        fileHandler: FileParser
    ): Promise<FormatedSinglePost> {
        const post = await this.postRepo.findPostById(postId);
        if (!post) throw new HttpError(404, 'Post not found');

        if (post.creatorId !== username)
            throw new HttpError(403, 'only creator of the post can edit it');

        const oldMentions = post.mentions;

        let tags: Tag[] | undefined;
        if (caption !== undefined) tags = await this.makeUpdateTags(caption);

        let mentionedUsers: User[] | undefined;
        if (mentions) mentionedUsers = await this.verifyMentionedExists(mentions);

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

        return this.formatSinglePost(updatedPost);
    }

    async createPost(
        { mentions, caption, images }: CreatePostDto,
        creatorId: string
    ): Promise<FormatedSinglePost> {
        const tags = await this.makeCreateTags(caption);

        const mentionedUsers: User[] = await this.verifyMentionedExists(mentions);

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

        return this.formatSinglePost(createdPost);
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

    private async verifyMentionedExists(mentions: string[]): Promise<User[] | never> {
        const mentionedUsers: (User | null)[] = await Promise.all(
            mentions.map((userId) => this.userService.fetchUser({ username: userId }))
        );

        if (!mentionedUsers.every((u) => u !== null))
            throw new HttpError(404, 'couldnt find mentioned user');

        return mentionedUsers as any;
    }

    async getUserPosts(
        username: string,
        { p: page, c: take }: PaginationDto
    ): Promise<GetPostsDao[]> {
        const skip = (page - 1) * take;
        const posts = await this.postRepo.getPosts(username, { take, skip });

        const resultPosts: GetPostsDao[] = posts.map((p) => ({
            postId: p.postId,
            imageInfo: { imageId: p.images[0].imageId, url: p.images[0].url },
        }));

        return resultPosts;
    }

    async getPostCount(username: string): Promise<number> {
        return this.postRepo.countPostsByUsername(username);
    }

    async createComment(dto: CreateCommentDto, commentor: string): Promise<PostCommentWithReplays> {
        if (!this.postRepo.doesPostExist(dto.postId))
            throw new HttpError(404, 'Post was not found');
        if (dto.type === 'replay' && !this.postCommentRepo.doesCommentExist(dto.parentId))
            throw new HttpError(404, 'Comment targeted to replay was not found');

        const { type, ...createCommentData } = dto;

        return this.postCommentRepo.save({
            commenterId: commentor,
            ...createCommentData,
        });
    }

    async getComments(
        postId: string,
        { p: page, c: count }: PaginationDto
    ): Promise<GetCommentsDao[]> {
        if (!this.postRepo.doesPostExist(postId)) throw new HttpError(404, 'Post was not found');

        const skip = (page - 1) * count;
        const comments = await this.postCommentRepo.getComments(postId, count, skip);

        const resultComments: GetCommentsDao[] = await Promise.all(
            comments.map(async (c) => ({
                commentId: c.commentId,
                commentor: {
                    username: c.commenter.username,
                    imageUrl: c.commenter.imageUrl,
                },
                likeCount: await this.commentLikeRepo.countLikesForComment(c.commentId),
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
                    }))
                ),
            }))
        );

        return resultComments;
    }

    async togglePostLike(likeId: PostLikeId): Promise<LikeResultDao> {
        const post = await this.postRepo.findPostById(likeId.postId);
        if (!post) throw new HttpError(404, 'Post was not found');

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

    async toggleCommentLike(commentLikeId: CommentLikeId): Promise<LikeResultDao> {
        if (!this.postCommentRepo.doesCommentExist(commentLikeId.commentId))
            throw new HttpError(404, 'Comment was not found');

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
        const friendCreators = (
            await this.followService.fetchRelations({
                followerId: followings,
                followedId: [username],
                status: ['friend'],
            })
        ).map((f) => f.followerId);

        const NonFriendCreators = followings.filter((f) => !friendCreators.includes(f));

        const findExplorePostsData: FindExplorePosts = { friendCreators, NonFriendCreators };
        const skip = (page - 1) * take;

        const authorizedPosts = await this.postRepo.explorePosts(findExplorePostsData, {
            take,
            skip,
        });

        return this.formatExplorePost(authorizedPosts);
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
}
