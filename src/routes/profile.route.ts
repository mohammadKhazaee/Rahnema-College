import { Router } from 'express';
import { handleExpress } from '../utility/handle-express';
import { isAuthenticated } from '../login-middleware';
import { editProfileDto } from '../modules/User/dto/edit-profile-dto';
import { UserService } from '../modules/User/user.service';
import { followListDto } from '../modules/Follow/dto/Lists-dto';

export const profileRouter = (userService: UserService) => {
    const app = Router();
    app.get('/:username', (req, res, next) => {
        handleExpress(res, 200, next, () =>
            userService.getUserInfo(req.params.username)
        );
    });

    app.put('/edit-profile', isAuthenticated(userService), (req, res, next) => {
        const dto = editProfileDto.parse(req.body);
        handleExpress(res, 200, next, async () => ({
            message: await userService.editUser(req.username, dto),
        }));
    });

    app.patch(
        '/follow/:username',
        isAuthenticated(userService),
        (req, res, next) => {
            const followerName = req.username;
            const followedUserName = req.params.username;
            handleExpress(res, 200, next, async () => ({
                message: await userService.followUser(
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
                message: await userService.unfollowUser(
                    followerName,
                    followedUserName
                ),
            }));
        }
    );

    app.get(
        '/:username/followers',
        (req, res, next) => {
            const dto = followListDto.parse(req.query)
            handleExpress(res, 200, next, async () =>
                await userService.getFollowers(
                    req.params.username,
                    dto,
                ))
        }
    )

    app.get(
        '/:username/followings',
        (req, res, next) => {
            const dto = followListDto.parse(req.query)
            handleExpress(res, 200, next, async () =>
                await userService.getFollowings(
                    req.params.username,
                    dto
                )
            )
        }
    )


    return app;
};
