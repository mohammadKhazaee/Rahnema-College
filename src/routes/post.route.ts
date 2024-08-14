import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { PostService } from '../modules/Post/post.service';
import { createPostDto } from '../modules/Post/dto/create-post-dto';
import { FileParser, IFile } from '../utility/file-parser';
import { HttpError } from '../utility/errors';

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

    return app;
};
