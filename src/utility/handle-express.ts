import { NextFunction, Response } from 'express';
import { HttpError } from './errors';

export const handleExpress = async <T>(
    res: Response,
    statusCode: number,
    next: NextFunction,
    cb: () => Promise<T>
) => {
    try {
        const data = await cb();
        res.status(statusCode).send(data);
    } catch (error) {
        next(error);
    }
};
