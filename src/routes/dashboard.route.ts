import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';
import { SocialService } from '../modules/Common/social.service';
import { FileParser } from '../utility/file-parser';
import { NotifService } from '../modules/Notification/notif.service';
import { paginationDto } from '../modules/Common/dto/pagination-dto';
import { isAuthenticated } from '../login-middleware';
import { PostService } from '../modules/Post/post.service';
import { createMessageDto } from '../modules/Message/dto/createMessageDto';
import { MessageService } from '../modules/Message/message.service';

export const dashboardRouter = (
    userService: UserService,
    socialService: SocialService,
    postService: PostService,
    notifService: NotifService,
    messageService: MessageService,
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
        handleExpress(res, 200, next, () => postService.explorePosts(username, dto));
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

    app.post(
        '/message/send/:username',
        fileParser.fileParser().single('image'),
        isAuthenticated(userService),
        (req, res, next) => {
            const dto = createMessageDto.parse({ ...req.body, image: req.file });
            handleExpress(res, 200, next, async () => ({
                message: await messageService.addMessage(dto, req.params.username, req.username),
            }));
        }
    );

    app.get('/search-users', isAuthenticated(userService), (req, res, next) => {
        const { s: query, p: page = '1', c: count = '5' } = req.query;
        if (typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }
        handleExpress(res, 200, next, async () => {
            const users = await socialService.searchUsers(
                query,
                req.username,
                parseInt(page as string),
                parseInt(count as string)
            );
            return { users };
        });
    });
    return app;
};
