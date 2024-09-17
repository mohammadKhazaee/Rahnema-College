import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { PostService } from '../modules/Post/post.service';
import { createPostValidator } from '../modules/Post/dto/create-post-dto';
import { FileParser } from '../utility/file-parser';
import { z, ZodError } from 'zod';
import { editPostValidator } from '../modules/Post/dto/edit-post-dto';
import { createCommentValidator } from '../modules/Post/dto/create-comment.dto';
import { paginationDto } from '../modules/Common/dto/pagination-dto';
import { isAuthenticated } from '../login-middleware';
import { UserService } from '../modules/User/user.service';
import { GetPostReason } from '../utility/errors/error-reason';
import { ValidationError } from '../utility/errors/userFacingError';

export const postRouter = (
    userService: UserService,
    postService: PostService,
    fileParser: FileParser
) => {
    const app = Router();

    app.post(
        '/',
        isAuthenticated(userService),
        fileParser.fileParser().array('images'),
        (req, res, next) => {
            const dto = createPostValidator({ ...req.body, images: req.files })!;
            handleExpress(res, 201, next, () => postService.createPost(dto, req.username));
        }
    );

    app.put(
        '/:postId',
        isAuthenticated(userService),
        fileParser.fileParser().array('images'),
        (req, res, next) => {
            const dto = editPostValidator({
                postId: req.params.postId,
                ...req.body,
                images: req.files,
            })!;

            handleExpress(res, 200, next, () =>
                postService.updatePost(req.username, dto, fileParser)
            );
        }
    );

    app.get('/:postId', isAuthenticated(userService), (req, res, next) => {
        let postId: string;
        try {
            postId = z.string().parse(req.params.postId);
        } catch (error) {
            if (error instanceof ZodError)
                throw new ValidationError(GetPostReason.InvalidPostId, error.format());
        }
        handleExpress(res, 200, next, () => postService.getPostById(postId, req.username));
    });

    app.get('/user/:username', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, () =>
            postService.getUserPosts(req.params.username, req.username, dto)
        );
    });

    app.post('/:postId/comments', isAuthenticated(userService), (req, res, next) => {
        const dto = createCommentValidator({
            ...req.body,
            postId: req.params.postId,
        })!;
        handleExpress(res, 201, next, () => postService.createComment(dto, req.username));
    });

    app.get('/:postId/comments', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 201, next, () =>
            postService.getComments(req.params.postId, req.username, dto)
        );
    });

    app.post('/:postId/like', isAuthenticated(userService), (req, res, next) => {
        handleExpress(res, 201, next, () =>
            postService.togglePostLike({
                postId: req.params.postId,
                userId: req.username,
            })
        );
    });

    app.post('/:postId/bookmark', isAuthenticated(userService), (req, res, next) => {
        handleExpress(res, 201, next, () =>
            postService.togglePostBookmark({
                postId: req.params.postId,
                userId: req.username,
            })
        );
    });

    app.post('/comments/:commentId/like', isAuthenticated(userService), (req, res, next) => {
        handleExpress(res, 201, next, () =>
            postService.toggleCommentLike({
                commentId: req.params.commentId,
                userId: req.username,
            })
        );
    });

    return app;
};
