import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.route';
import { HttpError } from './utility/errors';
import { AuthService } from './modules/Auth/auth.service';
import { AuthRepository } from './modules/Auth/auth.repository';
import { DataSource } from 'typeorm';
import { UserRepository } from './modules/User/user.repository';

export const appFactory = (dataSource: DataSource) => {
    const app = express();

    app.use(express.json());

    const authRepo = new AuthRepository(dataSource);
    const userRepo = new UserRepository(dataSource);
    const authService = new AuthService(authRepo, userRepo);

    app.use('/auth', authRouter(authService));

    app.use((req, res) => {
        res.status(404).send({ message: 'Not Found' });
    });

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        if (err instanceof ZodError)
            return res.status(422).send({ message: err.message });
        if (err instanceof HttpError)
            return res.status(err.statusCode).send({ message: err.message });
        res.status(500);
    };

    app.use(errorHandler);

    return app;
};
