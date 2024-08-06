import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.route';
import { HttpError } from './utility/errors';

export const appFactory = () => {
    const app = express();

    app.use(express.json());

    app.use('/auth', authRouter());

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