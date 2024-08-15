import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { PostService } from '../modules/Post/post.service';
import { createPostDto } from '../modules/Post/dto/create-post-dto';
import { PostRepository } from '../modules/Post/post.repository';
import { FileParser, IFile } from '../utility/file-parser';
import { HttpError } from '../utility/errors';
import { z } from 'zod';

export const postRouter = (
    postService: PostService,
    fileParser: FileParser
) => {
    const app = Router();

    app.post(
        '/',
        isAuthenticated,
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
    app.get('/:postId', (req, res, next) => {
        const postId = z.coerce.number().parse(req.params.postId);
        handleExpress(
            res,
            200,
            next,
            async () => await postService.getPostById(postId)
        );
    });

    return app;
};
