import { HttpError, NotFoundError } from '../../utility/errors';
import { FileParser, IFile } from '../../utility/file-parser';
import { imageUrlPath } from '../../utility/path-adjuster';
import { User } from '../User/model/user';
import { UserService } from '../User/user.service';
import { CreatePostDto } from './dto/create-post-dto';
import { CreatePost, Post } from './model/post';
import { CreateTag, Tag } from './model/tag';
import { PostRepository } from './post.repository';
import { EditImagesDto, EditPostDto } from './dto/edit-post-dto';
import { PostImageRepository } from './image.repository';
import { TagRepository } from './tag.repository';
import { CreateRelatedPostImage, PostImage } from './model/image';

export class PostService {
    constructor(
        private postRepo: PostRepository,
        private imageRepo: PostImageRepository,
        private tagRepo: TagRepository,
        private userService: UserService,
        private fileHandler: FileParser
    ) {}

    async updatePost(
        postId: number,
        { mentions, caption, oldImages: keepingImages = [] }: EditPostDto,
        images: IFile[]
    ) {
        const post: Post = await this.getPostById(postId);

        let tags: Tag[] | undefined;
        if (caption) tags = await this.prepareTagEntities(caption);

        let mentionedUsers: User[] | undefined;
        if (mentions)
            mentionedUsers = await this.verifyMentionedExists(mentions);

        const newImageEntities = await this.saveNewImages(images, postId);
        const [keptImages, deletedImageUrls] = this.splitDeletedImages(
            post.images,
            keepingImages
        );

        // post.images = [...newImageEntities, ...keptImages];
        // if (caption) post.caption = caption;
        // if (tags) post.tags = tags;
        // if (mentionedUsers) post.mentions = mentionedUsers;

        await this.postRepo.update(post);

        await this.fileHandler.deleteFiles(deletedImageUrls);

        return 'post updated successfully';
    }

    private async prepareTagEntities(caption: string) {
        const tags = this.extractTags(caption);
        const existingTags = await this.tagRepo.findTagsByNames(tags);
        let newTags: CreateTag[] = [];
        for (const tag of tags) {
            if (!existingTags.find((t) => t.name === tag))
                newTags.push({ name: tag });
        }
        const newTagsEntities = await this.tagRepo.saveBulk(newTags);
        return [...newTagsEntities, ...existingTags];
    }

    private saveNewImages(images: IFile[], postId: number) {
        const preparedImageUrls = images.map((i) => ({
            url: imageUrlPath(i.path),
            postId,
        }));
        return this.imageRepo.saveBulk(preparedImageUrls);
    }

    private splitDeletedImages(
        currentImages: PostImage[],
        keepingImages: EditImagesDto[]
    ): [PostImage[], string[]] {
        const [keptImages, deletedImageUrls]: [PostImage[], string[]] = [
            [],
            [],
        ];
        for (const image of currentImages) {
            if (keepingImages.find((i) => i.imageId === image.imageId))
                keptImages.push(image);
            else deletedImageUrls.push(image.url);
        }

        return [keptImages, deletedImageUrls];
    }

    private extractTags(caption: string): string[] {
        return caption
            .split(' ')
            .filter((s) => s.includes('#'))
            .flatMap((s) => s.split('#'))
            .filter((s) => s !== '');
    }

    async createPost(
        { mentions, caption }: CreatePostDto,
        images: IFile[],
        creatorId: string
    ) {
        const tags = this.extractTags(caption);

        const mentionedUsers: User[] = await this.verifyMentionedExists(
            mentions
        );

        const preparedImageUrls: CreateRelatedPostImage[] = images.map((i) => ({
            url: imageUrlPath(i.path),
        }));

        const newPost: CreatePost = {
            caption: caption,
            creatorId: creatorId,
            tags: tags.map((t) => ({ name: t })),
            images: preparedImageUrls,
            mentions: mentionedUsers,
        };

        await this.postRepo.create(newPost);

        return 'post created successfully';
    }

    private async verifyMentionedExists(mentions: string[]): Promise<User[]> {
        const mentionedUsers: (User | null)[] = await Promise.all(
            mentions.map((userId) =>
                this.userService.fetchUser({ username: userId })
            )
        );
        if (!mentionedUsers.every((u) => u !== null))
            throw new HttpError(404, 'couldnt find mentioned user');
        return mentionedUsers;
    }
    async getPostById(postId: string): Promise<Post> {
        const post = await this.postRepo.findPostById(postId);

        if (!post) throw new HttpError(404, 'Post not found');

        return post;
    }

    async getUserPosts(username: string): Promise<Post[] | null> {
        const posts = await this.postRepo.getPosts(username);
        if (!posts) throw new NotFoundError("This user doesn't have a post");

        return posts;
    }
}
