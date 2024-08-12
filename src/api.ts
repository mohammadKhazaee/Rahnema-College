import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.route';
import { HttpError } from './utility/errors';
import { AuthService } from './modules/Auth/auth.service';
import { DataSource } from 'typeorm';
import { UserRepository } from './modules/User/user.repository';
import helmet from 'helmet';
import compression from 'compression';
import { GmailHandler } from './utility/gmail-handler';
import { UserService } from './modules/User/user.service';
import { profileRouter } from './routes/profile.route';

export const appFactory = (dataSource: DataSource) => {
    const app = express();

    app.use(express.json());
    app.use(helmet());
    app.use(compression());

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

    const userRepo = new UserRepository(dataSource);
    const userService = new UserService(userRepo);
    const authService = new AuthService(userService, new GmailHandler());

    app.use('/auth', authRouter(authService));
    app.use(profileRouter(userService));

    app.use((req, res) => {
        res.status(404).send({ message: 'Not Found' });
    });

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        if (err instanceof ZodError)
            return res.status(422).send({ message: err.format() });
        if (err instanceof HttpError)
            return res.status(err.statusCode).send({ message: err.message });
        res.status(500).send({ message: 'somethin went wrong' });
    };

    app.use(errorHandler);

    return app;
};
