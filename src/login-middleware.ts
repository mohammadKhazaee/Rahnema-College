import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { string } from 'zod';

const secret = 'gmtrkhrthmthktmhthmtklhmth';

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    try {
        const decoded = verify(token, secret);
        if (typeof decoded === 'string') req.username = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
