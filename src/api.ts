import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as path from 'path';

import { authRouter } from './routes/auth.route';
import { HttpError } from './utility/errors';
import { AuthService } from './modules/Auth/auth.service';
import { UserRepository } from './modules/User/user.repository';
import { GmailHandler } from './utility/gmail-handler';
import { UserService } from './modules/User/user.service';
import { profileRouter } from './routes/profile.route';
import { postRouter } from './routes/post.route';
import { PostRepository } from './modules/Post/post.repository';
import { PostService } from './modules/Post/post.service';
import { FileParser } from './utility/file-parser';
import { FollowRepository } from './modules/Follow/follow.repository';
import { FollowService } from './modules/Follow/follow.service';
import { TagRepository } from './modules/Post/tag.repository';
import { PostCommentRepository } from './modules/Post/post-comment.repository';
import { SocialService } from './services/social.service';
import { PostLikeRepository } from './modules/Post/post-like.repository';
import { CommentLikeRepository } from './modules/Post/comment-like.repository';
import { BookmarkRepository } from './modules/Post/bookmark.repository';
import { PostImageRepository } from './modules/Post/image.repository';
import { NotifService } from './modules/Notification/notif.service';
import { NotifRepository } from './modules/Notification/notif.repository';
import { PostNotifRepository } from './modules/Notification/post-notif.repository';

export const appFactory = (dataSource: DataSource) => {
    const app = express();

    if (process.env.SERVE_IMAGE_LOCALY)
        app.use('/images', express.static(path.join(__dirname, 'images')));
    app.use(express.json());
    app.use(helmet());
    app.use(compression());

    morgan.token('date', function () {
        var p = new Date()
            .toString()
            .replace(/[A-Z]{3}\+/, '+')
            .split(/ /);
        return p[2] + '/' + p[1] + '/' + p[3] + ':' + p[4] + ' ' + p[5];
    });
    morgan.token('authHeader', (req, res) =>
        req.headers['authorization'] ? 'true' : 'false'
    );
    app.use(
        morgan(
            '[:date] ' +
                ':method::url :status ' +
                'length::res[content-length] - :response-time[1] ms ' +
                'authHeader::authHeader'
        )
    );

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
            'Access-Control-Allow-Methods',
            'OPTIONS, GET, POST, PUT, PATCH, DELETE'
        );
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization'
        );
        next();
    });

    const fileParser = new FileParser();

    // initializing repositories
    const postImageRepo = new PostImageRepository(dataSource);
    const userRepo = new UserRepository(dataSource);
    const followRepo = new FollowRepository(dataSource);
    const postRepo = new PostRepository(dataSource);
    const postCommentRepo = new PostCommentRepository(dataSource);
    const commentLikeRepo = new CommentLikeRepository(dataSource);
    const bookmarkRepo = new BookmarkRepository(dataSource);
    const postLikeRepo = new PostLikeRepository(dataSource);
    const tagRepo = new TagRepository(dataSource);
    const notifRepo = new NotifRepository(dataSource);
    const postNotifRepo = new PostNotifRepository(dataSource);

    // initializing services
    const userService = new UserService(userRepo);
    const notifService = new NotifService(notifRepo, postNotifRepo);
    const authService = new AuthService(userService, new GmailHandler());
    const followService = new FollowService(followRepo, userService);

    const postService = new PostService(
        postRepo,
        postCommentRepo,
        commentLikeRepo,
        postLikeRepo,
        tagRepo,
        userService,
        bookmarkRepo,
        postImageRepo,
        notifService
    );

    const socialService = new SocialService(
        userService,
        followService,
        postService
    );

    app.use('/auth', authRouter(authService));
    app.use('/posts', postRouter(postService, userService, fileParser));
    app.use(
        profileRouter(userService, socialService, followService, fileParser)
    );

    app.use((req, res) => {
        res.status(404).send({ message: 'Not Found' });
    });

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        console.log(err);
        if (err instanceof ZodError)
            return res.status(422).send({ message: err.format() });
        if (err instanceof HttpError)
            return res.status(err.statusCode).send({ message: err.message });
        res.status(500).send({ message: 'somethin went wrong' });
    };

    app.use(errorHandler);

    return app;
};
