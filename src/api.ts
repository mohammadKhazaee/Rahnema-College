import express, { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.route';

export const appFactory = () => {
    const app = express();

    app.use(express.json());

    app.use('/auth', authRouter());

    app.use((req, res) => {
        res.status(404).send({ message: 'Not Found' });
    });

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        if (err instanceof ZodError) {
            res.status(400).send({ message: err.message });
            return;
        }
        res.status(500);
    };

    app.use(errorHandler);

    return app;
};
