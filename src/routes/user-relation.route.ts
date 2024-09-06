import { Router } from 'express';
import { followListDto } from '../modules/UserRelation/dto/follow-list-dto';
import { handleExpress } from '../utility/handle-express';
import { UserRelationService } from '../modules/UserRelation/user-relation.service';

export const userRelationRouter = (followService: UserRelationService) => {
    const app = Router();

    app.post('/follow/:username/req', (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followRequest({ followerId, followedId }),
        }));
    });

    app.delete('/follow/:username/req', (req, res, next) => {
        const followerId = req.username;
        const followedId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followCancel({ followerId, followedId }, 'cancel'),
        }));
    });

    app.post('/follow/:username', (req, res, next) => {
        const followedId = req.username;
        const followerId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followAccept({ followerId, followedId }),
        }));
    });

    app.delete('/follow/:username', (req, res, next) => {
        const followedId = req.username;
        const followerId = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.followCancel({ followerId, followedId }, 'reject'),
        }));
    });

    app.delete('/followers/:username', (req, res, next) => {
        const followerName = req.username;
        const followedUserName = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: 'not implemented yet',
        }));
    });

    app.delete('/followings/:username', (req, res, next) => {
        const followerName = req.username;
        const followedUserName = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: 'not implemented yet',
        }));
    });

    app.get('/followers/:username', (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followers: await followService.getFollowersList(req.params.username, dto),
        }));
    });

    app.get('/followings/:username', (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followings: await followService.getFollowingsList(req.params.username, dto),
        }));
    });

    app.post('/blocks/:username', (req, res, next) => {
        const related = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.blockUser(related, req.username),
        }));
    });

    app.post('/friends/:username', (req, res, next) => {
        const currentUser = req.username;
        const friendUsername = req.params.username;
        handleExpress(res, 200, next, async () => ({
            message: await followService.addToCloseFriends(currentUser, friendUsername),
        }));
    });

    app.get('/friends', (req, res, next) => {
        const username = req.username;
        handleExpress(res, 200, next, async () => ({
            friends: await followService.getCloseFriendsList(username),
        }));
    });

    return app;
};
