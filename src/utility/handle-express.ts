import { Response } from 'express';
import { HttpError } from './errors';

export const handleExpress = async <T>(
    res: Response,
    statusCode: number,
    cb: () => Promise<T>
) => {
    try {
        const data = await cb();
        res.status(statusCode).send(data);
    } catch (error) {
        if (error instanceof HttpError) {
            res.status(error.statusCode).send(error.message);
            return;
        }

        res.status(500).send();
    }
};
