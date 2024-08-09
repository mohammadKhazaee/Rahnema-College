import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

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
        const decoded = verify(token, process.env.JWT_SECRET!);
        //@ts-ignore
        req.username = decoded.username;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
