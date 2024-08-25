import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';
import { SocialService } from '../services/social.service';
import { FollowService } from '../modules/Follow/follow.service';
import { followListDto } from '../modules/Follow/dto/Lists-dto';
import { FileParser } from '../utility/file-parser';

export const profileRouter = (
    userService: UserService,
    socialService: SocialService,
    followService: FollowService,
    fileParser: FileParser
) => {
    const app = Router();
    app.get('/:username', (req, res, next) => {
        handleExpress(res, 200, next, () =>
            socialService.getUserInfo(req.params.username)
        );
    });

    app.put(
        '/edit-profile',
        isAuthenticated(userService),
        fileParser.fileParser().single('image'),
        (req, res, next) => {
            const dto = editProfileDto.parse({ ...req.body, image: req.file });
            handleExpress(res, 200, next, async () => ({
                message: await userService.editUser(
                    req.username,
                    dto,
                    fileParser
                ),
            }));
        }
    );

    app.patch(
        '/follow/:username',
        isAuthenticated(userService),
        (req, res, next) => {
            const followerName = req.username;
            const followedUserName = req.params.username;
            handleExpress(res, 200, next, async () => ({
                message: await followService.followUser(
                    followerName,
                    followedUserName
                ),
            }));
        }
    );

    app.patch(
        '/unfollow/:username',
        isAuthenticated(userService),
        (req, res, next) => {
            const followerName = req.username;
            const followedUserName = req.params.username;
            handleExpress(res, 200, next, async () => ({
                message: await followService.unfollowUser(
                    followerName,
                    followedUserName
                ),
            }));
        }
    );

    app.get('/:username/followers', (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followers: await followService.getFollowersList(
                req.params.username,
                dto
            ),
        }));
    });

    app.get('/:username/followings', (req, res, next) => {
        const dto = followListDto.parse(req.query);
        handleExpress(res, 200, next, async () => ({
            followings: await followService.getFollowingsList(
                req.params.username,
                dto
            ),
        }));
    });

    return app;
};
