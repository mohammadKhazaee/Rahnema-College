import { ForbiddenError, NotFoundError } from '../../utility/errors';
import { UserService } from '../User/user.service';
import { FollowListDto } from './dto/follow-list-dto';
import { UserRelationRepository } from './user-relation.repository';
import { FindUserRelation, GetFollowListDao, UserRelationId } from './model/user-relation';
import { NotifService } from '../Notification/notif.service';

export class UserRelationService {
    constructor(
        private followRepo: UserRelationRepository,
        private userService: UserService,
        private notifService: NotifService
    ) {}

    async followRequest({ followerId, followedId }: UserRelationId) {
        if (followerId === followedId) throw new ForbiddenError('user cant follow themself');

        const followed = await this.userService.doesUserExists({
            username: followedId,
        });
        if (!followed) throw new NotFoundError('Targeted user was not found');

        if (
            await this.followRepo.doesRelationExist({
                followerId: followedId,
                followedId: followerId,
                status: ['blocked'],
            })
        )
            throw new ForbiddenError('cant follow someone who has blocked you');

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
        };

        const fetchedfollowing = await this.followRepo.fetchRelation(followingIds);

        if (fetchedfollowing && fetchedfollowing.status === 'blocked')
            throw new ForbiddenError('cant follow a blokced user');
        if (fetchedfollowing && fetchedfollowing.status === 'requestedFollow')
            throw new ForbiddenError('already sent request');
        if (fetchedfollowing) throw new ForbiddenError('already following the user');

        const followEntity = this.followRepo.createEntity({
            ...followingIds,
            status: 'requestedFollow',
        });

        await this.followRepo.createFollowRequest(followEntity);

        return `follow request sent`;
    }

    async followCancel({ followerId, followedId }: UserRelationId) {
        if (followerId === followedId) throw new ForbiddenError();

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['requestedFollow'],
        };

        const existingFollowReq = await this.followRepo.fetchRelation(followingIds);
        if (!existingFollowReq) throw new ForbiddenError('no follow request exist');

        await this.followRepo.deleteRequestedFollow(existingFollowReq);

        return `follow request canceled`;
    }

    async followAccept({ followerId, followedId }: UserRelationId) {
        if (followerId === followedId) throw new ForbiddenError();

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['requestedFollow'],
        };

        const existingFollowReq = await this.followRepo.fetchRelation(followingIds);
        if (!existingFollowReq) throw new ForbiddenError('no follow request exist');

        // await this.followRepo.acceptRequestedFollow(followingIds);

        return `follow request accepted`;
    }

    async unfollowUser(followerId: string, followedId: string) {
        if (followerId === followedId) throw new ForbiddenError('user cant unfollow themself');

        const [follower, followed] = await Promise.all([
            this.userService.doesUserExists({ username: followerId }),
            this.userService.doesUserExists({ username: followedId }),
        ]);
        if (!follower || !followed) throw new NotFoundError();

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['follow', 'friend'],
        };

        const fetchedFollowing = await this.followRepo.fetchRelation(followingIds);
        if (!fetchedFollowing)
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
        const followersList = await this.followRepo.getFollowers(username, count, skip);

        return Promise.all(
            followersList.map(async (f) => ({
                username: f.followerId,
                imageUrl: f.follower.imageUrl,
                followersCount: await this.followRepo.followersCount(f.followerId),
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
        const followingsList = await this.followRepo.getFollowings(username, count, skip);
        return Promise.all(
            followingsList.map(async (f) => ({
                username: f.followedId,
                imageUrl: f.followed.imageUrl,
                followersCount: await this.followRepo.followersCount(f.followedId),
            }))
        );
    }

    async blockUser(blockedName: string, blockerName: string) {
        if (blockedName === blockerName) throw new ForbiddenError('user cant block themself');

        const relation = await this.followRepo.fetchRelation({
            followerId: blockerName,
            followedId: blockedName,
        });
        const secondRelation = await this.followRepo.fetchRelation({
            followerId: blockedName,
            followedId: blockerName,
        });

        if (relation) {
            if (relation.status === 'blocked')
                throw new ForbiddenError('You already blocked this user');

            relation.status = 'blocked';
            await this.followRepo.upadte(relation);
        }

        if (secondRelation) {
            secondRelation.status = 'blocked';
            await this.followRepo.upadte(secondRelation);
        }

        if (!relation) {
            await this.followRepo.create({
                followerId: blockerName,
                followedId: blockedName,
                status: 'blocked',
            });
        }
        return 'Targeted user is blocked';
    }

    async addToCloseFriends(username: string, friendUsername: string) {
        if (username === friendUsername)
            throw new ForbiddenError('User cannot add themselves as a close friend');

        const friend = await this.userService.doesUserExists({
            username: friendUsername,
        });

        if (!friend) throw new NotFoundError(' Friend not found');

        const relation = await this.followRepo.fetchRelation({
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
    async getCloseFriendsList(username: string): Promise<GetFollowListDao[]> {
        const closeFriends = await this.followRepo.getCloseFriends(username);
        return Promise.all(
            closeFriends.map(async (f) => ({
                username: f.followedId,
                imageUrl: f.followed.imageUrl,
                followersCount: await this.followRepo.followersCount(f.followedId),
            }))
        );
    }
}
