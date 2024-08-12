import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';

export const profileRouter = (userService: UserService) => {
    const app = Router();

    app.get('/user-info', isAuthenticated, (req, res, next) => {
        handleExpress(res, 200, next, async () =>
            userService.getProfileInfo(req.username)
        );
    });

    app.put('/edit-profile', isAuthenticated, (req, res, next) => {
        const dto = editProfileDto.parse(req.body);
        handleExpress(res, 200, next, async () => ({
            message: userService.editUser(req.username, dto),
        }));
    });

    return app;
};
