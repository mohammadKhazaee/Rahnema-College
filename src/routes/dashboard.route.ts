import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';
import { SocialService } from '../modules/Common/social.service';
import { FileParser } from '../utility/file-parser';
import { NotifService } from '../modules/Notification/notif.service';
import { paginationDto } from '../modules/Post/dto/get-posts-dto';

export const dashboardRouter = (
    userService: UserService,
    socialService: SocialService,
    notifService: NotifService,
    fileParser: FileParser
) => {
    const app = Router();

    app.get('/profile-info/:username', (req, res, next) => {
        handleExpress(res, 200, next, () => socialService.getUserInfo(req.params.username));
    });

    app.put('/edit-profile', fileParser.fileParser().single('image'), (req, res, next) => {
        const dto = editProfileDto.parse({ ...req.body, image: req.file });
        handleExpress(res, 200, next, async () => ({
            message: await userService.editUser(req.username, dto, fileParser),
        }));
    });

    app.get('/explore', (req, res, next) => {
        const username = req.username;
        console.log(username);
        handleExpress(res, 200, next, () => socialService.getSocialExplore(username));
    });

    app.get('/notif', (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            notifs: await notifService.followingList(req.username, dto),
        }));
    });

    app.get('/friend-notif', (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            notifs: await notifService.friendList(req.username, dto),
        }));
    });

    return app;
};
