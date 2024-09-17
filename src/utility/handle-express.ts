import { NextFunction, Response } from 'express';
import ApplicationError from './errors/applicationError';
import { UserFacingError } from './errors/userFacingError';

export const handleExpress = async <T>(
    res: Response,
    statusCode: number,
    next: NextFunction,
    cb: () => Promise<T>
) => {
    try {
        const data = await cb();
        if (data instanceof UserFacingError) throw data;
        res.status(statusCode).send(data);
    } catch (error) {
        next(error);
    }
};
