import { HttpError } from '../../utility/errors';
import { IFile, IFiles } from '../../utility/file-parser';
import { imageUrlPath } from '../../utility/path-adjuster';
import { User } from '../User/model/user';
import { UserService } from '../User/user.service';
import { CreatePostDto } from './dto/create-post-dto';
import { CreatePostImage } from './model/image';
import { CreatePost } from './model/post';
import { CreateTag } from './model/tag';
import { PostRepository } from './post.repository';
import { PostEntity } from './entity/post.entity';
export class PostService {
    constructor(
        private postRepo: PostRepository,
        private userService: UserService
    ) {}

    async createPost(
        { mentions, caption }: CreatePostDto,
        images: IFile[],
        creatorId: string
    ) {
        const tags = this.extractTags(caption);

        const mentionedUsers: (User | null)[] = await Promise.all(
            mentions.map((userId) =>
                this.userService.fetchUser({ username: userId })
            )
        );
        if (!mentionedUsers.every((u) => u !== null))
            throw new HttpError(404, 'couldnt find mentioned user');

        const preparedImageUrls: CreatePostImage[] = images.map((i) => ({
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

    private extractTags(caption: string): CreateTag[] {
        return caption
            .split(' ')
            .filter((s) => s.includes('#'))
            .flatMap((s) => s.split('#'))
            .filter((s) => s !== '')
            .map((s) => ({ name: s }));
    }
    async getPostById(postId: number): Promise<PostEntity> {
        const post = await this.postRepo.findPostById(postId);
        if (!post) {
            throw new Error('Post not found');
        }
        return post;
    }
}


    
