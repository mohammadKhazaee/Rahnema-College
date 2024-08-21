import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';

export const profileRouter = (userService: UserService) => {
    const app = Router();
    app.get('/:username', (req, res, next) => {
        handleExpress(res, 200, next, () =>
            userService.getUserInfo(req.params.username)
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
