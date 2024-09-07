import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';
import { SocialService } from '../modules/Common/social.service';
import { FileParser } from '../utility/file-parser';
import { NotifService } from '../modules/Notification/notif.service';
import { paginationDto } from '../modules/Post/dto/get-posts-dto';
import { isAuthenticated } from '../login-middleware';

export const dashboardRouter = (
    userService: UserService,
    socialService: SocialService,
    notifService: NotifService,
    fileParser: FileParser
) => {
    const app = Router();

    app.get('/profile-info/:username', isAuthenticated(userService), (req, res, next) => {
        handleExpress(res, 200, next, () =>
            socialService.getUserInfo(req.params.username, req.username)
        );
    });

    app.put(
        '/edit-profile',
        isAuthenticated(userService),
        fileParser.fileParser().single('image'),
        (req, res, next) => {
            const dto = editProfileDto.parse({ ...req.body, image: req.file });
            handleExpress(res, 200, next, async () => ({
                message: await userService.editUser(req.username, dto, fileParser),
            }));
        }
    );

    app.get('/explore', isAuthenticated(userService), (req, res, next) => {
        const username = req.username;
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, () => socialService.getSocialExplore(username, dto));
    });

    app.get('/notif', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            notifs: await notifService.followingList(req.username, dto),
        }));
    });

    app.get('/friend-notif', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            notifs: await notifService.friendList(req.username, dto),
        }));
    });

    return app;
};
