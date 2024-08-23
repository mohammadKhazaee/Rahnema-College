import { ForbiddenError, NotFoundError } from '../../utility/errors';
import { UserService } from '../User/user.service';
import { FollowListDto } from './dto/Lists-dto';
import { FollowRepository } from './follow.repository';
import { FindFollowing, GetFollowListDao } from './model/follow';

export class FollowService {
    constructor(
        private followRepo: FollowRepository,
        private userService: UserService
    ) {}

    async followUser(followerId: string, followedId: string) {
        if (followerId === followedId)
            throw new ForbiddenError('user cant follow themself');

        const [follower, followed] = await Promise.all([
            this.userService.doesUserExists({ username: followerId }),
            this.userService.doesUserExists({ username: followedId }),
        ]);
        if (!follower || !followed) throw new NotFoundError();

        const followingIds: FindFollowing = {
            followerId,
            followedId,
        };

        const fetchedfollowing = await this.followRepo.fetchFollowing(
            followingIds
        );

        if (fetchedfollowing)
            throw new ForbiddenError('already following the user');

        await this.followRepo.create(followingIds);
        console.log('follower: ', follower);
        console.log('followed: ', followed);
        return `success`;
    }

    async unfollowUser(followerId: string, followedId: string) {
        if (followerId === followedId)
            throw new ForbiddenError('user cant unfollow themself');

        const [follower, followed] = await Promise.all([
            this.userService.doesUserExists({ username: followerId }),
            this.userService.doesUserExists({ username: followedId }),
        ]);
        if (!follower || !followed) throw new NotFoundError();

        const followingIds: FindFollowing = {
            followerId,
            followedId,
        };

        const fetchedfollowing = await this.followRepo.fetchFollowing(
            followingIds
        );
        if (!fetchedfollowing)
            throw new ForbiddenError(
                "user can't unfallow another user if didn't follow them first"
            );

        await this.followRepo.delete(followingIds);
        console.log('follower: ', follower);
        console.log('followed: ', followed);
        return 'success';
    }

    async getFollowersCount(username: string): Promise<number> {
        const followersCount = await this.followRepo.followersCount(username);
        return followersCount;
    }

    async getFollowingsCount(username: string): Promise<number> {
        const followingsCount = await this.followRepo.followingsCount(username);
        return followingsCount;
    }

    async getFollowersList(
        username: string,
        { p: page, c: count }: FollowListDto
    ): Promise<GetFollowListDao[]> {
        const user = await this.userService.doesUserExists({ username });
        if (!user) throw new NotFoundError();

        const skip = (page - 1) * count;
        const followersList = await this.followRepo.getFollowers(
            username,
            count,
            skip
        );

        return Promise.all(
            followersList.map(async (f) => ({
                username: f.followerId,
                imageUrl: f.follower.imageUrl,
                followersCount: await this.followRepo.followersCount(
                    f.followerId
                ),
            }))
        );
    }

    async getFollowingsList(
        username: string,
        { p: page, c: count }: FollowListDto
    ): Promise<GetFollowListDao[]> {
        const user = await this.userService.doesUserExists({ username });
        if (!user) throw new NotFoundError();

        const skip = (page - 1) * count;
        const followingsList = await this.followRepo.getFollowings(
            username,
            count,
            skip
        );
        return Promise.all(
            followingsList.map(async (f) => ({
                username: f.followedId,
                imageUrl: f.followed.imageUrl,
                followersCount: await this.followRepo.followersCount(
                    f.followedId
                ),
            }))
        );
    }
}
