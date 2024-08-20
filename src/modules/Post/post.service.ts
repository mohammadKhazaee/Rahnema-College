import { HttpError, NotFoundError } from '../../utility/errors';
import { imageUrlPath } from '../../utility/path-adjuster';
import { User } from '../User/model/user';
import { UserService } from '../User/user.service';
import { CreatePostDto } from './dto/create-post-dto';
import { CreatePost, GetPostDao, GetPostsDao, Post } from './model/post';
import { CreateTag, Tag } from './model/tag';
import { PostRepository } from './post.repository';
import { EditPostDto } from './dto/edit-post-dto';
import { TagRepository } from './tag.repository';
import { CreateRelatedPostImage } from './model/image';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostCommentRepository } from './post-comment.repository';
import { PostCommentWithReplays } from './model/post-comment';

export class PostService {
    constructor(
        private postRepo: PostRepository,
        private postCommentRepo: PostCommentRepository,
        private tagRepo: TagRepository,
        private userService: UserService
    ) {}

    async getPostById(postId: string): Promise<GetPostDao> {
        const post = await this.postRepo.findPostById(postId);

        if (!post) throw new HttpError(404, 'Post not found');
        const postCount = await this.postRepo.countLikesForPost(postId);

        return { ...post, postCount };
    }

    async updatePost({
        postId,
        mentions,
        caption,
        deletedImages,
        images,
    }: EditPostDto) {
        const post: Post = await this.getPostById(postId);

        let tags: Tag[] | undefined;
        if (caption) tags = await this.makeUpdateTags(caption);

        let mentionedUsers: User[] | undefined;
        if (mentions)
            mentionedUsers = await this.verifyMentionedExists(mentions);

        // let newImageEntities: PostImageEntity[] = [];
        // if (images) newImageEntities = await this.saveNewImages(images, postId);
        // if (images)
        //     newImageEntities = images.map((i) => {
        //         const image = new PostImageEntity();
        //         image.url = imageUrlPath(i.path);
        //         image.postId = postId;
        //         return image;
        //     });
        // post.images = [
        //     ...post.images.filter(
        //         (i) => !deletedImages.find((di) => di.imageId === i.imageId)
        //     ),
        //     ...newImageEntities,
        // ];

        if (caption) post.caption = caption;
        if (tags) post.tags = tags;
        if (mentionedUsers) post.mentions = mentionedUsers;

        const updatedPost = await this.postRepo.update(post);

        // await this.fileHandler.deleteFiles(deletedImages.map((i) => i.url));

        return updatedPost;
    }

    async createPost(
        { mentions, caption, images }: CreatePostDto,
        creatorId: string
    ) {
        const tags = await this.makeCreateTags(caption);

        const mentionedUsers: User[] = await this.verifyMentionedExists(
            mentions
        );

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

        return this.postRepo.create(newPost);
    }

    private async makeCreateTags(caption: string) {
        const tags = this.extractTags(caption);
        const existingTags = await this.tagRepo.findTagsByNames(tags);

        let newTags: CreateTag[] = [];
        for (const tag of tags) {
            if (!existingTags.find((t) => t.name === tag))
                newTags.push({ name: tag });
        }

        return [...newTags, ...existingTags];
    }

    private async makeUpdateTags(caption: string) {
        const tags = this.extractTags(caption);
        const existingTags = await this.tagRepo.findTagsByNames(tags);

        let newTags: CreateTag[] = [];
        for (const tag of tags) {
            if (!existingTags.find((t) => t.name === tag))
                newTags.push({ name: tag });
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

    private async verifyMentionedExists(
        mentions: string[]
    ): Promise<User[] | never> {
        const mentionedUsers: (User | null)[] = await Promise.all(
            mentions.map((userId) =>
                this.userService.fetchUser({ username: userId })
            )
        );

        if (!mentionedUsers.every((u) => u !== null))
            throw new HttpError(404, 'couldnt find mentioned user');

        return mentionedUsers;
    }

    async getUserPosts(username: string): Promise<GetPostsDao[]> {
        const posts = await this.postRepo.getPosts(username);

        const resultPosts: GetPostsDao[] = posts.map((p) => ({
            postId: p.postId,
            imageInfo: { imageId: p.images[0].imageId, url: p.images[0].url },
        }));

        return resultPosts;
    }

    async createComment(
        { postId, content }: CreateCommentDto,
        commentor: string
    ): Promise<PostCommentWithReplays> {
        return this.postCommentRepo.save({
            commenterId: commentor,
            content,
            postId,
        });
    }

    async getPostLikesCount(postId: string): Promise<number> {
        return this.postRepo.countLikesForPost(postId);
    }
}
