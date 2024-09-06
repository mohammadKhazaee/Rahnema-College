import { Router } from 'express';
import { followListDto } from '../modules/UserRelation/dto/follow-list-dto';
import { handleExpress } from '../utility/handle-express';
import { UserRelationService } from '../modules/UserRelation/user-relation.service';
import { UserService } from '../modules/User/user.service';
import { isAuthenticated } from '../login-middleware';

export const userRelationRouter = (
    userService: UserService,
    followService: UserRelationService
) => {
    const app = Router();

    app.post('/follow/:username/req', isAuthenticated(userService), (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followRequest({ followerId, followedId }),
        }));
    });

    app.delete('/follow/:username/req', isAuthenticated(userService), (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followCancel({ followerId, followedId }, 'cancel'),
        }));
    });

    app.post('/follow/:username', isAuthenticated(userService), (req, res, next) => {
        const followedId = req.username;
        const followerId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followAccept({ followerId, followedId }),
        }));
    });

    app.delete('/follow/:username', isAuthenticated(userService), (req, res, next) => {
        const followedId = req.username;
        const followerId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followCancel({ followerId, followedId }, 'reject'),
        }));
    });

    app.delete('/followers/:username', isAuthenticated(userService), (req, res, next) => {
        const followedName = req.username;
        const followerUserName = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.removeFollower({
                followedId: followedName,
                followerId: followerUserName,
            }),
        }));
    });

    app.delete('/followings/:username', isAuthenticated(userService), (req, res, next) => {
        const followerName = req.username;
        const followedUserName = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.unfollowUser({
                followedId: followedUserName,
                followerId: followerName,
            }),
        }));
    });

    app.get('/followers/:username', isAuthenticated(userService), (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followers: await followService.getFollowersList(req.params.username, dto),
        }));
    });

    app.get('/followings/:username', isAuthenticated(userService), (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followings: await followService.getFollowingsList(req.params.username, dto),
        }));
    });

    app.post('/blocks/:username', isAuthenticated(userService), (req, res, next) => {
        const related = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.blockUser(related, req.username),
        }));
    });

    app.delete('/blocks/:username', isAuthenticated(userService), (req, res, next) => {
        const related = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.removeBlockUser(related, req.username),
        }));
    });

    app.post('/friends/:username', isAuthenticated(userService), (req, res, next) => {
        const currentUser = req.username;
        const friendUsername = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.addToCloseFriends(currentUser, friendUsername),
        }));
    });

    app.delete('/friends/:username', isAuthenticated(userService), (req, res, next) => {
        const currentUser = req.username;
        const friendUsername = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.removeCloseFriend(currentUser, friendUsername),
        }));
    });

    app.get('/blocks', isAuthenticated(userService), (req, res, next) => {
        const username = req.username;
        handleExpress(res, 200, next, async () => ({
            blocks: await followService.getBlockList(username),
        }));
    });

    app.get('/friends', isAuthenticated(userService), (req, res, next) => {
        const username = req.username;
        handleExpress(res, 200, next, async () => ({
            friends: await followService.getCloseFriendsList(username),
        }));
    });

    return app;
};
