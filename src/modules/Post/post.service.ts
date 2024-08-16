import { HttpError, NotFoundError } from '../../utility/errors';
import { FileParser, IFile } from '../../utility/file-parser';
import { imageUrlPath } from '../../utility/path-adjuster';
import { User } from '../User/model/user';
import { UserService } from '../User/user.service';
import { CreatePostDto } from './dto/create-post-dto';
import { CreateRelatedPostImage } from './model/image';
import { CreatePost, Post, UpdatePost } from './model/post';
import { CreateTag, Tag } from './model/tag';
import { PostRepository } from './post.repository';
import { PostEntity } from './entity/post.entity';
import { EditImagesDto, EditPostDto } from './dto/edit-post-dto';
import { PostImageRepository } from './image.repository';
import { PostImageEntity } from './entity/post-image.entity';

export class PostService {
    constructor(
        private postRepo: PostRepository,
        private imageRepo: PostImageRepository,
        private userService: UserService,
        private fileHandler: FileParser
    ) {}

    async updatePost(
        postId: number,
        { mentions, caption, oldImages: keepingImages }: EditPostDto,
        images: IFile[]
    ) {
        let tags: Tag[] | undefined;
        if (caption) tags = this.extractTags(caption);

        let mentionedUsers: User[] | undefined;
        if (mentions)
            mentionedUsers = await this.verifyMentionedExists(mentions);

        const post: Post = await this.getPostById(postId);

        if (caption) post.caption = caption;
        if (tags) post.tags = tags;
        if (mentionedUsers) post.mentions = mentionedUsers;

        const newImageEntities = await this.saveNewImages(images);
        console.log('newImageEntities: ********************************');
        console.log(newImageEntities, images);

        const currentImages = await this.imageRepo.getPostImages(postId);

        const [keptImages, deletedImageUrls] = this.splitDeletedImages(
            currentImages,
            keepingImages
        );
        console.log('result:*****************************************');
        console.log([...newImageEntities, ...keptImages]);
        console.log(postId);

        await this.postRepo.update(post);

        await this.fileHandler.deleteFiles(deletedImageUrls);

        return 'post updated successfully';
    }

    private saveNewImages(images: IFile[]) {
        const preparedImageUrls = images.map((i) => ({
            url: imageUrlPath(i.path),
            postId: 1,
        }));
        return this.imageRepo.saveBulk(preparedImageUrls);
    }

    private splitDeletedImages(
        currentImages: PostImageEntity[],
        keepingImages: EditImagesDto[]
    ): [PostImageEntity[], string[]] {
        const [keptImages, deletedImageUrls]: [PostImageEntity[], string[]] = [
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

    private extractTags(caption: string): CreateTag[] {
        return caption
            .split(' ')
            .filter((s) => s.includes('#'))
            .flatMap((s) => s.split('#'))
            .filter((s) => s !== '')
            .map((s) => ({ name: s }));
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
            tags,
            images: preparedImageUrls || [],
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
    async getPostById(postId: string): Promise<PostEntity> {
        const post = await this.postRepo.findPostById(postId);

        if (!post) throw new HttpError(404, 'Post not found');

        return post;
    }

    async getUserPosts(username: string): Promise<PostEntity[] | null> {
        const posts = await this.postRepo.getPosts(username);
        if (!posts) throw new NotFoundError("This user doesn't have a post");

        return posts;
    }
}
