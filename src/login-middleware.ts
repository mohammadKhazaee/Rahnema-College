import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { UserService } from './modules/User/user.service';

export const isAuthenticated =
    (userService: UserService) => async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res
                .status(401)
                .json({ reason: 'Unauthenticated', message: 'Authorization header is missing' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ reason: 'Unauthenticated', message: 'Token is missing' });
        }

        try {
            const decoded = verify(token, process.env.JWT_SECRET!);
            //@ts-ignore
            req.username = decoded.username;

            const user = await userService.fetchUser({
                username: req.username,
            });

            if (!user)
                return res
                    .status(401)
                    .json({ reason: 'Unauthenticated', message: 'Not authenticated' });

            next();
        } catch (error) {
            return res.status(401).json({ reason: 'Unauthenticated', message: 'Invalid token' });
        }
    };
