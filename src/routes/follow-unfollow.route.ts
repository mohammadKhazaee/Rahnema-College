import { Router } from 'express';
import { isAuthenticated } from '../login-middleware';
import { handleExpress } from '../utility/handle-express';
import { UserService } from '../modules/User/user.service';

export const followRouter = (userService: UserService) => {
    const app = Router();

    app.patch(
        '/follow/:username',
        isAuthenticated(userService),
        (req, res, next) => {
            const followerName = req.username;
            const followedUserName = req.params.username;
            handleExpress(res, 200, next, async () => ({
                message: await userService.followUser(
                    followerName,
                    followedUserName
                ),
            }));
        }
    );

    return app;
};
