import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { PostService } from '../modules/Post/post.service';
import { createPostDto } from '../modules/Post/dto/create-post-dto';
import { FileParser } from '../utility/file-parser';
import { z } from 'zod';
import { editPostDto } from '../modules/Post/dto/edit-post-dto';
import { createCommentDto } from '../modules/Post/dto/create-comment.dto';
import { paginationDto } from '../modules/Post/dto/get-posts-dto';

export const postRouter = (postService: PostService, fileParser: FileParser) => {
    const app = Router();

    app.post('/', fileParser.fileParser().array('images'), (req, res, next) => {
        const dto = createPostDto.parse({ ...req.body, images: req.files });
        handleExpress(res, 201, next, async () => ({
            message: 'post created successfully',
            createdPost: await postService.createPost(dto, req.username),
        }));
    });

    app.put('/:postId', fileParser.fileParser().array('images'), (req, res, next) => {
        const dto = editPostDto.parse({
            postId: req.params.postId,
            ...req.body,
            images: req.files,
        });

        handleExpress(res, 200, next, async () => ({
            message: 'post updated successfully',
            updatedPost: await postService.updatePost(dto, fileParser),
        }));
    });

    app.get('/:postId', (req, res, next) => {
        const postId = z.string().parse(req.params.postId);
        handleExpress(res, 200, next, () => postService.getPostById(postId, req.username));
    });

    app.get('/user/:username', (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            posts: await postService.getUserPosts(req.params.username, dto),
        }));
    });

    app.post('/:postId/comments', (req, res, next) => {
        const dto = createCommentDto.parse({
            ...req.body,
            postId: req.params.postId,
        });
        handleExpress(res, 201, next, () => postService.createComment(dto, req.username));
    });

    app.get('/:postId/comments', (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 201, next, async () => ({
            comments: await postService.getComments(req.params.postId, dto),
        }));
    });

    app.post('/:postId/like', (req, res, next) => {
        handleExpress(res, 201, next, () =>
            postService.togglePostLike({
                postId: req.params.postId,
                userId: req.username,
            })
        );
    });

    app.post('/:postId/bookmark', (req, res, next) => {
        handleExpress(res, 201, next, () =>
            postService.togglePostBookmark({
                postId: req.params.postId,
                userId: req.username,
            })
        );
    });

    app.post('/comments/:commentId/like', (req, res, next) => {
        handleExpress(res, 201, next, () =>
            postService.toggleCommentLike({
                commentId: req.params.commentId,
                userId: req.username,
            })
        );
    });

    return app;
};
