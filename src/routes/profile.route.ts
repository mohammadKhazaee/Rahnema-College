import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';

export const profileRouter = (userService: UserService) => {
    const app = Router();
    app.get('/:username', isAuthenticated(userService), (req, res, next) => {
        const { username } = req.params;
        if (username === req.username) {
            res.redirect('/user-info');
        } else {
            handleExpress(res, 200, next, async () => {
                return userService.getProfileInfo(username);
            });
        }
    });

    app.get('/user-info', isAuthenticated(userService), (req, res, next) => {
        handleExpress(res, 200, next, async () =>
            userService.getProfileInfo(req.username)
        );
    });

    app.put('/edit-profile', isAuthenticated(userService), (req, res, next) => {
        const dto = editProfileDto.parse(req.body);
        handleExpress(res, 200, next, async () => ({
            message: await userService.editUser(req.username, dto),
        }));
    });

    return app;
};
