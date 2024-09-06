import { ForbiddenError, NotFoundError } from '../../utility/errors';
import { UserService } from '../User/user.service';
import { FollowListDto } from './dto/follow-list-dto';
import { UserRelationRepository } from './user-relation.repository';
import { FindUserRelation, GetFollowBlockListDao, UserRelationId } from './model/user-relation';
import { FollowedByState } from '../Notification/model/notifications';

export class UserRelationService {
    constructor(
        private followRepo: UserRelationRepository,
        private userService: UserService
    ) {}

    async fetchRelationStatus({
        followerId,
        followedId,
    }: UserRelationId): Promise<FollowedByState> {
        const foundRelation = await this.followRepo.fetchRelation({ followerId, followedId });
        if (!foundRelation) return 'notFollowed';
        if (foundRelation.status === 'blocked') throw new Error();

        return foundRelation.status === 'requestedFollow' ? 'requested' : 'followed';
    }

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

    async followCancel({ followerId, followedId }: UserRelationId, type: 'cancel' | 'reject') {
        if (followerId === followedId) throw new ForbiddenError('user cant follow themself');

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['requestedFollow'],
        };

        const existingFollowReq = await this.followRepo.fetchRelation(followingIds);
        if (!existingFollowReq) throw new ForbiddenError('no follow request exist');

        await this.followRepo.deleteRequestedFollow(existingFollowReq);

        return `follow request ${type}ed`;
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

        await this.followRepo.acceptRequestedFollow(existingFollowReq);

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
    ): Promise<GetFollowBlockListDao[]> {
        const user = await this.userService.doesUserExists({ username });
        if (!user) throw new NotFoundError();

        const skip = (page - 1) * count;
        const followersList = await this.followRepo.getFollowers(username, count, skip);

        return Promise.all(
            followersList.map(async (f) => ({
                username: f.followerId,
                fName: f.followed.fName,
                lName: f.followed.lName,
                imageUrl: f.follower.imageUrl,
                followersCount: await this.followRepo.followersCount(f.followerId),
            }))
        );
    }

    async getFollowingsList(
        username: string,
        { p: page, c: count }: FollowListDto
    ): Promise<GetFollowBlockListDao[]> {
        const user = await this.userService.doesUserExists({ username });
        if (!user) throw new NotFoundError();

        const skip = (page - 1) * count;
        const followingsList = await this.followRepo.getFollowings(username, count, skip);
        return Promise.all(
            followingsList.map(async (f) => ({
                username: f.followedId,
                fName: f.followed.fName,
                lName: f.followed.lName,
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
            await this.followRepo.delete(secondRelation);
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

    async removeBlockUser(blockedName: string, blockerName: string) {
        const blockedUser = this.userService.doesUserExists({ username: blockedName });
        if (!blockedUser) throw new NotFoundError('User not found');

        const relation = await this.followRepo.fetchRelation({
            followerId: blockerName,
            followedId: blockedName,
        });

        if (!relation || (relation && relation.status !== 'blocked'))
            throw new ForbiddenError('This user is not blocked');

        await this.followRepo.delete({ followerId: blockerName, followedId: blockedName });

        return 'User removed from your blocks';
    }

    async addToCloseFriends(username: string, friendUsername: string) {
        if (username === friendUsername)
            throw new ForbiddenError('User cannot add themselves as a close friend');

        const friend = await this.userService.doesUserExists({
            username: friendUsername,
        });

        if (!friend) throw new NotFoundError('Friend not found');

        const relation = await this.followRepo.fetchRelation({
            followerId: username,
            followedId: friendUsername,
        });

        if (relation && relation.status === 'friend')
            throw new ForbiddenError('User is already a close friend');

        if (!relation || relation.status !== 'follow')
            throw new ForbiddenError('You can only add followers as close friends');

        await this.followRepo.updateRelationStatus(username, friendUsername, 'friend');
        return 'Added to close friends';
    }

    async getBlockList(username: string): Promise<GetFollowBlockListDao[]> {
        const blocks = await this.followRepo.getBlocks(username);
        return Promise.all(
            blocks.map(async (b) => ({
                username: b.followedId,
                fName: b.followed.fName,
                lName: b.followed.lName,
                imageUrl: b.followed.imageUrl,
                followersCount: await this.followRepo.followersCount(b.followedId),
            }))
        );
    }

    async getCloseFriendsList(username: string): Promise<GetFollowBlockListDao[]> {
        const closeFriends = await this.followRepo.getCloseFriends(username);
        return Promise.all(
            closeFriends.map(async (f) => ({
                username: f.followedId,
                fName: f.followed.fName,
                lName: f.followed.lName,
                imageUrl: f.followed.imageUrl,
                followersCount: await this.followRepo.followersCount(f.followedId),
            }))
        );
    }

    async removeCloseFriend(mainUserName: string, friendName: string) {
        const friend = this.userService.doesUserExists({ username: friendName });
        if (!friend) throw new NotFoundError('Friend not found');

        const relation = await this.followRepo.fetchRelation({
            followerId: mainUserName,
            followedId: friendName,
        });

        if (!relation || (relation && relation.status !== 'friend'))
            throw new ForbiddenError('This user is not your close friend');

        await this.followRepo.updateRelationStatus(mainUserName, friendName, 'follow');

        return 'User removed from your close friends';
    }
}
