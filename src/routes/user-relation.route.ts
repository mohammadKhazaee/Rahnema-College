import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { UserRelationService } from '../modules/UserRelation/user-relation.service';
import { UserService } from '../modules/User/user.service';
import { isAuthenticated } from '../login-middleware';
import { paginationDto } from '../modules/Common/dto/pagination-dto';

export const userRelationRouter = (
    userService: UserService,
    followService: UserRelationService
) => {
    const app = Router();

    app.post('/follow/:username/req', isAuthenticated(userService), (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, () =>
            followService.followRequest({ followerId, followedId })
        );
    });

    app.delete('/follow/:username/req', isAuthenticated(userService), (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, () =>
            followService.followCancel({ followerId, followedId }, 'cancel')
        );
    });

    app.post('/follow/:username', isAuthenticated(userService), (req, res, next) => {
        const followedId = req.username;
        const followerId = req.params.username;
        handleExpress(res, 200, next, () => followService.followAccept({ followerId, followedId }));
    });

    app.delete('/follow/:username', isAuthenticated(userService), (req, res, next) => {
        const followedId = req.username;
        const followerId = req.params.username;
        handleExpress(res, 200, next, () =>
            followService.followCancel({ followerId, followedId }, 'reject')
        );
    });

    app.delete('/followers/:username', isAuthenticated(userService), (req, res, next) => {
        const followedName = req.username;
        const followerUserName = req.params.username;
        handleExpress(res, 200, next, () =>
            followService.removeFollower({
                followedId: followedName,
                followerId: followerUserName,
            })
        );
    });

    app.delete('/followings/:username', isAuthenticated(userService), (req, res, next) => {
        const followerName = req.username;
        const followedUserName = req.params.username;
        handleExpress(res, 200, next, () =>
            followService.unfollowUser({
                followedId: followedUserName,
                followerId: followerName,
            })
        );
    });

    app.get('/followers/:username', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, () =>
            followService.getFollowersList(req.params.username, dto)
        );
    });

    app.get('/followings/:username', isAuthenticated(userService), (req, res, next) => {
        const dto = paginationDto.parse(req.query);
        handleExpress(res, 200, next, () =>
            followService.getFollowingsList(req.params.username, dto)
        );
    });

    app.post('/blocks/:username', isAuthenticated(userService), (req, res, next) => {
        const related = req.params.username;
        handleExpress(res, 200, next, () => followService.blockUser(related, req.username));
    });

    app.delete('/blocks/:username', isAuthenticated(userService), (req, res, next) => {
        const related = req.params.username;
        handleExpress(res, 200, next, () => followService.removeBlockUser(related, req.username));
    });

    app.post('/friends/:username', isAuthenticated(userService), (req, res, next) => {
        const currentUser = req.username;
        const friendUsername = req.params.username;
        handleExpress(res, 200, next, () =>
            followService.addToCloseFriends(currentUser, friendUsername)
        );
    });

    app.delete('/friends/:username', isAuthenticated(userService), (req, res, next) => {
        const currentUser = req.username;
        const friendUsername = req.params.username;
        handleExpress(res, 200, next, () =>
            followService.removeCloseFriend(currentUser, friendUsername)
        );
    });

    app.get('/blocks', isAuthenticated(userService), (req, res, next) => {
        const username = req.username;
        handleExpress(res, 200, next, () => followService.getBlockList(username));
    });

    app.get('/friends', isAuthenticated(userService), (req, res, next) => {
        const username = req.username;
        handleExpress(res, 200, next, () => followService.getCloseFriendsList(username));
    });

    return app;
};
