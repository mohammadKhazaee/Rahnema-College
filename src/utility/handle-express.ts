import { Response } from 'express';
import { HttpError } from './errors';

export const handleExpress = async <T>(res: Response, cb: () => Promise<T>) => {
    try {
        const data = await cb();
        res.status(200).send(data);
    } catch (error) {
        if (error instanceof HttpError) {
            res.status(error.statusCode).send(error.message);
            return;
        }

        res.status(500).send();
    }
};
