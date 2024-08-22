import { ForbiddenError, NotFoundError } from "../../utility/errors";
import { User } from "../User/model/user";
import { UserService } from "../User/user.service";
import { FollowingEntity } from "./entity/following.entity";
import { FollowRepository } from "./follow.repository";
import { Following } from "./model/follow";

export class FollowService {
    constructor(private followRepo: FollowRepository) { }

    async followUser(follower: User, followed: User) {

        const following = this.createFollowing(follower, followed);
        const fetchedfollowing = await this.followRepo.fetchFollowing(following);

        if (fetchedfollowing)
            throw new ForbiddenError('already following the user');

        await this.followRepo.create(following);
        console.log('follower: ', follower);
        console.log('followed: ', followed);
        return `success`;
    }


    async unfollowUser(follower: User, followed: User) {
        const following = this.createFollowing(follower, followed);
        const fetchedfollowing = await this.followRepo.fetchFollowing(following);
        if (!fetchedfollowing)
            throw new ForbiddenError(
                "user can't unfallow another user if didn't follow them first"
            );

        await this.followRepo.delete(following);
        console.log('follower: ', follower);
        console.log('followed: ', followed);
        return 'success';
    }


    createFollowing(follower: User, followed: User) {
        const following: Following = {
            followerId: follower.username,
            follower,
            followedId: followed.username,
            followed,
        };
        return following;
    }


    async getFollowersCount(username: string): Promise<number> {
        const followersCount = await this.followRepo.followersCount(username)
        return followersCount;
    }

    async getFollowingsCount(username: string): Promise<number> {
        const followingsCount = await this.followRepo.followingsCount(username)
        return followingsCount
    }

    async getFollowersList(username: string): Promise<FollowingEntity[]> {
        const followers = await this.followRepo.getFollowers(username)
        if (followers.length === 0) throw new NotFoundError('This user has no followers')
        return followers
    }
}