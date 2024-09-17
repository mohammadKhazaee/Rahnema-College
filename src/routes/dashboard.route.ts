import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { editProfileValidator } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';
import { SocialService } from '../modules/Common/social.service';
import { FileParser } from '../utility/file-parser';
import { NotifService } from '../modules/Notification/notif.service';
import { paginationDto, searchDto } from '../modules/Common/dto/pagination-dto';
import { isAuthenticated } from '../login-middleware';
import { PostService } from '../modules/Post/post.service';
import { createMessageValidator } from '../modules/Message/dto/createMessageDto';
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
            const dto = editProfileValidator({ ...req.body, image: req.file })!;
            handleExpress(res, 200, next, async () =>
                userService.editUser(req.username, dto, fileParser)
            );
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
            const dto = createMessageValidator({ ...req.body, image: req.file })!;
            handleExpress(res, 200, next, async () =>
                messageService.addMessage(dto, req.params.username, req.username)
            );
        }
    );

    app.get('/messages', isAuthenticated(userService), (req, res, next) => {
        const pgDto = paginationDto.parse(req.query);
        const username = req.username;
        handleExpress(res, 200, next, () => messageService.chatHistory(username, pgDto));
    });
    app.get('/search-users', isAuthenticated(userService), (req, res, next) => {
        const { s: query, p: page, c: count } = searchDto.parse(req.query);
        handleExpress(res, 200, next, async () => {
            const users = await socialService.searchUsers(query, req.username, page, count);
            return { users };
        });
    });

    app.get('/search-tags', isAuthenticated(userService), (req, res, next) => {
        const dto = searchDto.parse(req.query);
        handleExpress(res, 200, next, async () => {
            const tags = await postService.searchTags(dto.s, { p: dto.p, c: dto.c });
            return { tags };
        });
    });

    app.get('/tag-posts/:tagName', isAuthenticated(userService), (req, res, next) => {
        const { tagName } = req.params;
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, async () => {
            const result = await postService.getPostsByTag(tagName, req.username, dto);
            return { posts: result.posts }; // Only return the posts array to match the API spec
        });
    });

    app.get('/bookmarks', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, () => postService.getBookmarkedPosts(req.username, dto));
    });

    app.get('/mentioned-posts', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, () => postService.getMentionedPosts(req.username, dto));
    });

    return app;
};
