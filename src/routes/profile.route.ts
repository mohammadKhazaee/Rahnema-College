import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';
import { SocialService } from '../services/social.service';
import { UserRelationService } from '../modules/UserRelation/user-relation.service';
import { followListDto } from '../modules/UserRelation/dto/follow-list-dto';
import { FileParser } from '../utility/file-parser';

export const profileRouter = (
    userService: UserService,
    socialService: SocialService,
    followService: UserRelationService,
    fileParser: FileParser
) => {
    const app = Router();

    app.get('/:username', (req, res, next) => {
        handleExpress(res, 200, next, () => socialService.getUserInfo(req.params.username));
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

    app.post('/:username/follow/req', isAuthenticated(userService), (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followRequest({ followerId, followedId }),
        }));
    });

    app.post('/:username/follow/cancel', isAuthenticated(userService), (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followCancel({ followerId, followedId }),
        }));
    });

    app.patch('/unfollow/:username', isAuthenticated(userService), (req, res, next) => {
        const followerName = req.username;
        const followedUserName = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.unfollowUser(followerName, followedUserName),
        }));
    });

    app.get('/:username/followers', (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followers: await followService.getFollowersList(req.params.username, dto),
        }));
    });

    app.get('/:username/followings', (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followings: await followService.getFollowingsList(req.params.username, dto),
        }));
    });

    app.post('/:username/block', isAuthenticated(userService), (req, res, next) => {
        const related = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.blockUser(related, req.username),
        }));
    });
    app.post('/:username/friend', isAuthenticated(userService), (req, res, next) => {
        const currentUser = req.username;
        const friendUsername = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.addToCloseFriends(currentUser, friendUsername),
        }));
    });

    return app;
};
