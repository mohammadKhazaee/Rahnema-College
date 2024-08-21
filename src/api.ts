import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.route';
import { HttpError } from './utility/errors';
import { AuthService } from './modules/Auth/auth.service';
import { DataSource } from 'typeorm';
import { UserRepository } from './modules/User/user.repository';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { GmailHandler } from './utility/gmail-handler';
import { UserService } from './modules/User/user.service';
import { profileRouter } from './routes/profile.route';
import { postRouter } from './routes/post.route';
import { PostRepository } from './modules/Post/post.repository';
import { PostService } from './modules/Post/post.service';
import { FileParser } from './utility/file-parser';
import { followRouter } from './routes/follow-unfollow.route';
import { TagRepository } from './modules/Post/tag.repository';

export const appFactory = (dataSource: DataSource) => {
    const app = express();
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

    const userRepo = new UserRepository(dataSource);
    const userService = new UserService(userRepo);
    const postRepo = new PostRepository(dataSource);
    // const postImageRepo = new PostImageRepository(dataSource);
    const tagRepo = new TagRepository(dataSource);
    const postService = new PostService(postRepo, tagRepo, userService);
    const authService = new AuthService(userService, new GmailHandler());

    app.use('/auth', authRouter(authService));
    app.use('/posts', postRouter(postService, userService, fileParser));
    app.use(profileRouter(userService));
    app.use(followRouter(userService));

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
