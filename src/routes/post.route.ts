import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { PostService } from '../modules/Post/post.service';
import { createPostDto } from '../modules/Post/dto/create-post-dto';
import { FileParser } from '../utility/file-parser';
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
            const dto = createPostDto.parse({ ...req.body, images: req.files });
            handleExpress(res, 201, next, async () => ({
                message: 'post created successfully',
                createdPost: await postService.createPost(dto, req.username),
            }));
        }
    );

    app.put(
        '/:postId',
        isAuthenticated(userService),
        fileParser.fileParser().array('images'),
        (req, res, next) => {
            const dto = editPostDto.parse({
                postId: req.params.postId,
                ...req.body,
                images: req.files,
            });

            handleExpress(res, 200, next, async () => ({
                message: 'post updated successfully',
                updatedPost: await postService.updatePost(dto),
            }));
        }
    );

    app.get('/:postId', (req, res, next) => {
        const postId = z.string().parse(req.params.postId);
        handleExpress(res, 200, next, () => postService.getPostById(postId));
    });

    app.get('/user/:username', (req, res, next) => {
        handleExpress(res, 200, next, async () => ({
            posts: await postService.getUserPosts(req.params.username),
        }));
    });

    return app;
};
