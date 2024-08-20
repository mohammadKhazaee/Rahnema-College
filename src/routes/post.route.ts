import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { PostService } from '../modules/Post/post.service';
import { createPostDto } from '../modules/Post/dto/create-post-dto';
import { FileParser, IFile } from '../utility/file-parser';
import { UserService } from '../modules/User/user.service';
import { z } from 'zod';
import { editPostDto } from '../modules/Post/dto/edit-post-dto';

export const postRouter = (
    postService: PostService,
    userService: UserService,
    fileParser: FileParser
) => {
    const app = Router();

    app.post(
        '/',
        isAuthenticated(userService),
        fileParser.fileParser().array('imageUrls'),
        (req, res, next) => {
            const dto = createPostDto.parse(req.body);
            handleExpress(res, 201, next, async () => ({
                message: await postService.createPost(
                    dto,
                    req.files as IFile[],
                    req.username
                ),
            }));
        }
    );

    app.put(
        '/:postId',
        isAuthenticated(userService),
        fileParser.fileParser().array('imageUrls'),
        (req, res, next) => {
            const dto = editPostDto.parse(req.body);
            const postId = z.coerce.number().parse(req.params.postId);

            handleExpress(res, 201, next, async () => ({
                message: await postService.updatePost(
                    postId,
                    dto,
                    req.files as IFile[]
                ),
            }));
        }
    );
    app.get('/:postId', (req, res, next) => {
        const postId = z.string().parse(req.params.postId);
        handleExpress(res, 200, next, () => postService.getPostById(postId));
    });

    app.get('/', isAuthenticated(userService), (req, res, next) => {
        const name = req.username;
        handleExpress(res, 200, next, () => postService.getUserPosts(name));
    });

    return app;
};
