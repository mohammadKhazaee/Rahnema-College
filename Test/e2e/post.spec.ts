import * as path from 'path';

import request from 'supertest';

import { AppDataSource } from '../../src/data-source';
import { appFactory } from '../../src/api';
import { createCommentTest, createPostTest, loginTest, singupTest } from './utility';
import { SignupDto } from '../../src/modules/Auth/dto/signup-dto';
import { CreatePostDto } from '../../src/modules/Post/dto/create-post-dto';
import { EditPostDto } from '../../src/modules/Post/dto/edit-post-dto';
import { UserEntity } from '../../src/modules/User/entity/user.entity';
import { PostEntity } from '../../src/modules/Post/entity/post.entity';
import { CreateCommentDto } from '../../src/modules/Post/dto/create-comment.dto';
import { PostCommentEntity } from '../../src/modules/Post/entity/post-comment.entity';

describe.skip('Post route test suite', () => {
    // @ts-ignore
    let app: Express;

    beforeAll(async () => {
        const dataSource = await AppDataSource.initialize();
        app = appFactory(dataSource);
    });

    beforeEach(async () => {
        await AppDataSource.getRepository(UserEntity).delete({});
        await AppDataSource.getRepository(PostEntity).delete({});
        await AppDataSource.getRepository(PostCommentEntity).delete({});
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('Create post', () => {
        it('should create a post for right input', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };
            const dummyUser2: SignupDto = {
                username: 'test2',
                email: 'tes2t@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [dummyUser2.username],
            };

            await singupTest(app, dummyUser, 201);
            await singupTest(app, dummyUser2, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const resultPost = await createPostTest(app, dummyPost, token, 201);

            expect(resultPost.createdPost.caption).toBe(dummyPost.caption);
        });
    });

    describe('Update post', () => {
        it('should update a post for right input', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };
            const dummyUser2: SignupDto = {
                username: 'test2',
                email: 'tes2t@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);
            await singupTest(app, dummyUser2, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const { createdPost: resultPost } = await createPostTest(app, dummyPost, token, 201);

            const updatePostDto: EditPostDto = {
                caption: '',
                mentions: [dummyUser2.username],
                postId: resultPost.postId,
                deletedImages: resultPost.images.map((i: { url: any; imageId: any }) => ({
                    url: i.url,
                    imageId: i.imageId,
                })),
            };

            const partialRequest = request(app)
                .put('/posts/' + updatePostDto.postId)
                .set('Authorization', 'Bearer ' + token)
                .field('caption', updatePostDto.caption);
            for (let i = 0; i < updatePostDto.mentions.length; i++) {
                partialRequest.field(`mentions[${i}]`, updatePostDto.mentions[i]);
            }
            for (let i = 0; i < updatePostDto.deletedImages.length; i++) {
                partialRequest.field(
                    `deletedImages[${i}]`,
                    JSON.stringify(updatePostDto.deletedImages[i]) as any
                );
            }

            const {
                body: { updatedPost },
            } = await partialRequest.expect(200);

            expect(updatedPost.caption).toBe(updatePostDto.caption);
            expect(updatedPost.tags).toHaveLength(0);
        });
    });

    describe('Get a post', () => {
        it('should retrieve a post successfully', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const { createdPost } = await createPostTest(app, dummyPost, token, 201);

            const { body: post } = await request(app)
                .get('/posts/' + createdPost.postId)
                .expect(200);

            expect(post.caption).toBe(dummyPost.caption);
        });
    });

    describe('Get user posts', () => {
        it('should retrieve a post successfully', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            await createPostTest(app, dummyPost, token, 201);
            await createPostTest(app, dummyPost, token, 201);

            const {
                body: { posts },
            } = await request(app).get('/posts/user/' + dummyUser.username);

            expect(posts).toHaveLength(2);
        });
    });

    describe('Create comment or replay', () => {
        it('should submit a comment for a post', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const { createdPost } = await createPostTest(app, dummyPost, token, 201);

            const dummyComment: CreateCommentDto = {
                type: 'comment',
                content: 'dummy content',
                postId: createdPost.postId,
            };

            const createdComment = await createCommentTest(app, dummyComment, token, 201);

            expect(createdComment.content).toBe(dummyComment.content);
            expect(createdComment.commenterId).toBe(dummyUser.username);
        });

        it('should submit a replay for a comment', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const { createdPost } = await createPostTest(app, dummyPost, token, 201);

            const dummyComment: CreateCommentDto = {
                type: 'comment',
                content: 'dummy content',
                postId: createdPost.postId,
            };

            const createdComment = await createCommentTest(app, dummyComment, token, 201);

            const dummyReplay: CreateCommentDto = {
                type: 'replay',
                content: 'dummy replay content',
                postId: createdPost.postId,
                parentId: createdComment.commentId,
            };

            const createdReplay = await createCommentTest(app, dummyReplay, token, 201);

            expect(createdReplay.content).toBe(dummyReplay.content);
            expect(createdReplay.commenterId).toBe(dummyUser.username);
        });
    });

    describe('Get post comments', () => {
        it('should response with list of comments', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const { createdPost } = await createPostTest(app, dummyPost, token, 201);

            const dummyComment: CreateCommentDto = {
                type: 'comment',
                content: 'dummy content',
                postId: createdPost.postId,
            };

            const createdComment = await createCommentTest(app, dummyComment, token, 201);

            const createdComment2 = await createCommentTest(app, dummyComment, token, 201);

            const dummyReplay: CreateCommentDto = {
                type: 'replay',
                content: 'dummy replay content',
                postId: createdPost.postId,
                parentId: createdComment.commentId,
            };

            const createdReplay = await createCommentTest(app, dummyReplay, token, 201);

            const {
                body: { comments },
            } = await request(app).get('/posts/' + createdPost.postId + '/comments');

            expect(comments).toHaveLength(2);
            expect(comments[0].replays).toHaveLength(1);
        });
    });

    describe('Like post', () => {
        it('should like the post', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const { createdPost } = await createPostTest(app, dummyPost, token, 201);

            await request(app)
                .post('/posts/' + createdPost.postId + '/like')
                .set('Authorization', 'Bearer ' + token)
                .expect(201);

            const { body: post } = await request(app)
                .get('/posts/' + createdPost.postId)
                .expect(200);

            expect(post.likeCount).toBe(1);
        });
    });

    describe('Like comment', () => {
        it('should like the comment', async () => {
            const dummyUser: SignupDto = {
                username: 'test',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678',
            };

            const dummyPost: CreatePostDto = {
                caption: 'dummy #caption this is',
                images: [],
                mentions: [],
            };

            await singupTest(app, dummyUser, 201);

            const token = await loginTest(app, {
                username: dummyUser.username,
                password: dummyUser.password,
                rememberMe: false,
            });

            const { createdPost } = await createPostTest(app, dummyPost, token, 201);

            const dummyComment: CreateCommentDto = {
                type: 'comment',
                content: 'dummy content',
                postId: createdPost.postId,
            };

            const createdComment = await createCommentTest(app, dummyComment, token, 201);

            const dummyReplay: CreateCommentDto = {
                type: 'replay',
                content: 'dummy replay content',
                postId: createdPost.postId,
                parentId: createdComment.commentId,
            };

            const createdReplay = await createCommentTest(app, dummyReplay, token, 201);

            await request(app)
                .post('/posts/comments/' + createdComment.commentId + '/like')
                .set('Authorization', 'Bearer ' + token)
                .expect(201);
            console.log(createdComment);

            await request(app)
                .post('/posts/comments/' + createdReplay.commentId + '/like')
                .set('Authorization', 'Bearer ' + token)
                .expect(201);

            const {
                body: { comments },
            } = await request(app).get('/posts/' + createdPost.postId + '/comments');
            console.log(comments);

            expect(comments[0].likeCount).toBe(1);
            expect(comments[0].replays[0].likeCount).toBe(1);
        });
    });
});
