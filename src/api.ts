import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import * as path from 'path';

import { authRouter } from './routes/auth.route';
import { AuthService } from './modules/Auth/auth.service';
import { UserRepository } from './modules/User/user.repository';
import { GmailHandler } from './utility/gmail-handler';
import { UserService } from './modules/User/user.service';
import { dashboardRouter } from './routes/dashboard.route';
import { postRouter } from './routes/post.route';
import { PostRepository } from './modules/Post/post.repository';
import { PostService } from './modules/Post/post.service';
import { FileParser } from './utility/file-parser';
import { UserRelationRepository } from './modules/UserRelation/user-relation.repository';
import { UserRelationService } from './modules/UserRelation/user-relation.service';
import { TagRepository } from './modules/Post/tag.repository';
import { PostCommentRepository } from './modules/Post/post-comment.repository';
import { SocialService } from './modules/Common/social.service';
import { PostLikeRepository } from './modules/Post/post-like.repository';
import { CommentLikeRepository } from './modules/Post/comment-like.repository';
import { BookmarkRepository } from './modules/Post/bookmark.repository';
import { PostImageRepository } from './modules/Post/image.repository';
import { NotifService } from './modules/Notification/notif.service';
import { NotifRepository } from './modules/Notification/notif.repository';
import { PostNotifRepository } from './modules/Notification/post-notif.repository';
import { CommentNotifRepository } from './modules/Notification/comment-notif.repository';
import { RelationNotifRepository } from './modules/Notification/follow-notif.repository';
import { userRelationRouter } from './routes/user-relation.route';
import { MessageService } from './modules/Message/message.service';
import { MessageRepository } from './modules/Message/message.repository';
import { UserFacingError } from './utility/errors/userFacingError';
import { SessionStore } from './sessionStore';

export const appFactory = (dataSource: DataSource, sessionStore: SessionStore) => {
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
    morgan.token('authHeader', (req, res) => (req.headers['authorization'] ? 'true' : 'false'));
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
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });

    const fileParser = new FileParser();

    // initializing repositories
    const postImageRepo = new PostImageRepository(dataSource);
    const userRepo = new UserRepository(dataSource);
    const userRelationRepo = new UserRelationRepository(dataSource);
    const postRepo = new PostRepository(dataSource);
    const postCommentRepo = new PostCommentRepository(dataSource);
    const commentLikeRepo = new CommentLikeRepository(dataSource);
    const bookmarkRepo = new BookmarkRepository(dataSource);
    const postLikeRepo = new PostLikeRepository(dataSource);
    const tagRepo = new TagRepository(dataSource);
    const notifRepo = new NotifRepository(dataSource);
    const postNotifRepo = new PostNotifRepository(dataSource);
    const commentNotifRepo = new CommentNotifRepository(dataSource);
    const relationNotifRepo = new RelationNotifRepository(dataSource);
    const messageRepo = new MessageRepository(dataSource);

    // initializing services
    const userService = new UserService(userRepo);
    const authService = new AuthService(userService, new GmailHandler());
    const userRelationService = new UserRelationService(userRelationRepo, userService);
    const notifService = new NotifService(
        notifRepo,
        postNotifRepo,
        commentNotifRepo,
        relationNotifRepo,
        userRelationService
    );

    const postService = new PostService(
        postRepo,
        postCommentRepo,
        commentLikeRepo,
        postLikeRepo,
        tagRepo,
        userService,
        userRelationService,
        bookmarkRepo,
        postImageRepo
    );

    const messageService = new MessageService(
        messageRepo,
        userService,
        userRelationService,
        sessionStore
    );
    const socialService = new SocialService(
        userService,
        userRelationService,
        postService,
        notifService,
        messageService
    );

    app.use('/auth', authRouter(authService));
    app.use('/posts', postRouter(userService, postService, fileParser));
    app.use(
        '/dashboard',

        dashboardRouter(
            userService,
            socialService,
            postService,
            notifService,
            messageService,
            fileParser
        )
    );
    app.use('/user-relations', userRelationRouter(userService, userRelationService));

    app.use((req, res) => {
        res.status(404).send({ message: 'Not Found' });
    });

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        console.log(err);
        if (err instanceof UserFacingError)
            return res.status(err.statusCode).send({ reason: err.reason, message: err.message });
        res.status(500).send({ message: 'somethin went wrong' });
    };

    app.use(errorHandler);

    return app;
};
