import { ForbiddenError, NotFoundError } from '../../utility/errors';
import { UserService } from '../User/user.service';
import { FollowListDto } from './dto/follow-list-dto';
import { FollowRepository } from './follow.repository';
import { FindFollowing, GetFollowListDao } from './model/follow';

export class FollowService {
    constructor(
        private followRepo: FollowRepository,
        private userService: UserService
    ) { }

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

        const follow = await this.followRepo.create(followingIds);
        follow.status = 'follow'
        await this.followRepo.upadte(follow)
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

    async blockUser(blockedName: string, blockerName: string) {
        if (blockedName === blockerName) throw new ForbiddenError('user cant block themself');

        const relation = await this.getRelations(blockerName, blockedName)
        const secondRelation = await this.getRelations(blockedName, blockerName)

        if (relation) {
            if (relation.status === 'blocked') throw new ForbiddenError('You already blocked this user')

            relation.status = 'blocked'
            await this.followRepo.upadte(relation)
        }

        if (secondRelation) {
            secondRelation.status = 'blocked'
            await this.followRepo.upadte(secondRelation)
        }

        if (!relation) {
            const relationToAdd = await this.followRepo.create({
                followerId: blockerName,
                followedId: blockedName,
            })

            relationToAdd.status = 'blocked'
            await this.followRepo.upadte(relationToAdd)
        }
        return 'Targeted user is blocked'
    }

    async getRelations(mainName: string, relatedName: string) {
        const relations = await this.followRepo.fetchFollowing({
            followerId: mainName,
            followedId: relatedName
        })
        return relations
    }
    async addToCloseFriends(username: string, friendUsername: string) {
        if (username === friendUsername)
            throw new ForbiddenError('User cannot add themselves as a close friend');

        const friend = await this.userService.doesUserExists({ username: friendUsername });

        if ( !friend) throw new NotFoundError(' Friend not found');

        const relation = await this.followRepo.fetchFollowing({
            followerId: username,
            followedId: friendUsername,
        });


        if (relation && relation.status === 'friend')
            throw new ForbiddenError('User is already a close friend');

        if (!relation || relation.status !== 'follow')
            throw new ForbiddenError('You can only add followers as close friends');

        

        relation.status = 'friend';
        await this.followRepo.upadte(relation);
        return 'Added to close friends';
    }
}

