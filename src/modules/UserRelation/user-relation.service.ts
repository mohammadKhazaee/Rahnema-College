import { UserService } from '../User/user.service';
import { UserRelationRepository } from './user-relation.repository';
import {
    FindOneWayRelations,
    FindUserRelation,
    FollowedByState,
    GetFollowBlockListDao,
    UserRelationId,
} from './model/user-relation';
import { ForbiddenError, NotFoundError } from '../../utility/errors/userFacingError';
import {
    AcceptFollowReason,
    AddFriendReason,
    BlockReason,
    CancelFollowReason,
    FollowReqReason,
    GetFollowersReason,
    GetFollowingsReason,
    RejectFollowReason,
    RemoveFollowerReason,
    RemoveFriendReason,
    UnblockReason,
    UnfollowReason,
} from '../../utility/errors/error-reason';
import { PaginationDto } from '../Common/dto/pagination-dto';

export class UserRelationService {
    constructor(private followRepo: UserRelationRepository, private userService: UserService) {}

    fetchRelations(findObject: FindOneWayRelations) {
        return this.followRepo.fetchRelations(findObject);
    }

    async fetchRelationStatus({
        followerId,
        followedId,
    }: UserRelationId): Promise<FollowedByState> {
        const foundRelation = await this.followRepo.fetchRelation({ followedId, followerId });
        if (!foundRelation) return 'notFollowed';

        return foundRelation.status;
    }

    async followRequest({
        followerId,
        followedId,
    }: UserRelationId): Promise<{ message: string } | ForbiddenError | NotFoundError> {
        if (followerId === followedId)
            return new ForbiddenError(FollowReqReason.SelfFollow, 'user cant follow themself');

        const followed = await this.userService.doesUserExists({
            username: followedId,
        });
        if (!followed)
            return new NotFoundError(FollowReqReason.NotFoundUser, 'Targeted user was not found');

        if (
            await this.followRepo.doesRelationExist({
                followerId: followedId,
                followedId: followerId,
                status: ['blocked'],
            })
        )
            return new ForbiddenError(
                FollowReqReason.Blocked,
                'cant follow someone who has blocked you'
            );

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
        };

        const fetchedfollowing = await this.followRepo.fetchRelation(followingIds);

        if (fetchedfollowing && fetchedfollowing.status === 'blocked')
            return new ForbiddenError(FollowReqReason.Blocked, 'cant follow a blokced user');
        if (fetchedfollowing && fetchedfollowing.status === 'requestedFollow')
            return new ForbiddenError(FollowReqReason.DupRequest, 'already sent request');
        if (fetchedfollowing)
            return new ForbiddenError(
                FollowReqReason.AlreadyFollowed,
                'already following the user'
            );

        const followEntity = this.followRepo.createEntity({
            ...followingIds,
            status: 'requestedFollow',
        });

        await this.followRepo.createFollowRequest(followEntity);

        return { message: `follow request sent` };
    }

    async followCancel(
        { followerId, followedId }: UserRelationId,
        type: 'cancel' | 'reject'
    ): Promise<{ message: string } | NotFoundError | ForbiddenError> {
        if (followerId === followedId)
            return new ForbiddenError(
                type === 'cancel' ? CancelFollowReason.SelfCancel : RejectFollowReason.SelfReject,
                'user cant follow themself'
            );

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['requestedFollow'],
        };

        const existingFollowReq = await this.followRepo.fetchRelation(followingIds);
        if (!existingFollowReq)
            return new ForbiddenError(
                CancelFollowReason.NotFoundRequest,
                'no follow request exist'
            );

        await this.followRepo.deleteRequestedFollow(existingFollowReq);

        return { message: `follow request ${type}ed` };
    }

    async followAccept({
        followerId,
        followedId,
    }: UserRelationId): Promise<{ message: string } | NotFoundError | ForbiddenError> {
        if (followerId === followedId) return new ForbiddenError(AcceptFollowReason.SelfAccept);

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['requestedFollow'],
        };

        const existingFollowReq = await this.followRepo.fetchRelation(followingIds);
        if (!existingFollowReq)
            return new ForbiddenError(
                AcceptFollowReason.NotFoundRequest,
                'no follow request exist'
            );

        await this.followRepo.acceptRequestedFollow(existingFollowReq);

        return { message: `follow request accepted` };
    }

    async removeFollower({
        followedId,
        followerId,
    }: UserRelationId): Promise<{ message: string } | NotFoundError | ForbiddenError> {
        if (followerId === followedId)
            return new ForbiddenError(
                RemoveFollowerReason.SelfUnfollow,
                'user cant unfollow themself'
            );

        const follower = await this.userService.doesUserExists({ username: followerId });

        if (!follower)
            return new NotFoundError(RemoveFollowerReason.NotFoundUser, 'follower was not found');

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['follow', 'friend'],
        };

        const fetchedFollowing = await this.followRepo.fetchRelation(followingIds);
        if (!fetchedFollowing)
            return new ForbiddenError(
                RemoveFollowerReason.NotFollower,
                'this user is not follower'
            );

        await this.followRepo.delete(fetchedFollowing);

        return { message: 'success' };
    }

    async unfollowUser({
        followedId,
        followerId,
    }: UserRelationId): Promise<{ message: string } | NotFoundError | ForbiddenError> {
        if (followerId === followedId)
            return new ForbiddenError(UnfollowReason.SelfUnfollow, 'user cant unfollow themself');

        const followed = await this.userService.doesUserExists({ username: followedId });

        if (!followed)
            return new NotFoundError(UnfollowReason.NotFoundUser, 'followed user was not found');

        const followingIds: FindUserRelation = {
            followerId,
            followedId,
            status: ['follow', 'friend'],
        };

        const fetchedFollowing = await this.followRepo.fetchRelation(followingIds);
        if (!fetchedFollowing)
            return new ForbiddenError(
                UnfollowReason.NotFollowing,
                "user can't unfallow another user if didn't follow them first"
            );

        await this.followRepo.delete(fetchedFollowing);

        return { message: 'success' };
    }

    getFollowersCount(username: string): Promise<number> {
        return this.followRepo.followersCount(username);
    }

    async getFollowingsCount(username: string): Promise<number> {
        const followingsCount = await this.followRepo.followingsCount(username);
        return followingsCount;
    }

    async getFollowersList(
        username: string,
        { p: page, c: count }: PaginationDto
    ): Promise<
        | {
              followers: GetFollowBlockListDao[];
          }
        | NotFoundError
    > {
        const user = await this.userService.doesUserExists({ username });
        if (!user) return new NotFoundError(GetFollowersReason.NotFoundUser);

        const skip = (page - 1) * count;
        const followersList = await this.followRepo.getFollowers(username, count, skip);

        return {
            followers: await Promise.all(
                followersList.map(async (f) => ({
                    username: f.followerId,
                    fName: f.follower.fName,
                    lName: f.follower.lName,
                    imageUrl: f.follower.imageUrl,
                    followersCount: await this.followRepo.followersCount(f.followerId),
                }))
            ),
        };
    }

    async getFollowingsList(
        username: string,
        { p: page, c: count }: PaginationDto
    ): Promise<{ followings: GetFollowBlockListDao[] } | NotFoundError> {
        const user = await this.userService.doesUserExists({ username });
        if (!user) return new NotFoundError(GetFollowingsReason.NotFoundUser);

        const skip = (page - 1) * count;
        const followingsList = await this.followRepo.getFollowings(username, count, skip);

        return {
            followings: await Promise.all(
                followingsList.map(async (f) => ({
                    username: f.followedId,
                    fName: f.followed.fName,
                    lName: f.followed.lName,
                    imageUrl: f.followed.imageUrl,
                    followersCount: await this.followRepo.followersCount(f.followedId),
                }))
            ),
        };
    }

    async blockUser(
        blockedId: string,
        blockerId: string
    ): Promise<{ message: string } | ForbiddenError> {
        if (blockedId === blockerId)
            return new ForbiddenError(BlockReason.SelfBlock, 'user cant block themself');

        const relation = await this.followRepo.fetchRelation({
            followerId: blockerId,
            followedId: blockedId,
        });
        const secondRelation = await this.followRepo.fetchRelation({
            followerId: blockedId,
            followedId: blockerId,
        });

        if (relation && relation.status === 'blocked')
            return new ForbiddenError(BlockReason.AlreadyBlocked, 'You already blocked this user');

        if (relation) {
            relation.status = relation.status === 'gotBlocked' ? 'twoWayBlocked' : 'blocked';
            await this.followRepo.update(relation);
        } else
            await this.followRepo.create({
                followerId: blockerId,
                followedId: blockedId,
                status: 'blocked',
            });

        if (secondRelation) {
            secondRelation.status =
                secondRelation.status === 'blocked' ? 'twoWayBlocked' : 'gotBlocked';
            await this.followRepo.update(secondRelation);
        } else {
            await this.followRepo.create({
                followerId: blockedId,
                followedId: blockerId,
                status: 'gotBlocked',
            });
        }

        return { message: 'Targeted user is blocked' };
    }

    async removeBlockUser(
        blockedId: string,
        blockerId: string
    ): Promise<{ message: string } | ForbiddenError> {
        if (blockedId === blockerId)
            return new ForbiddenError(UnblockReason.SelfUnblock, 'user cant unblock themself');

        const relation = await this.followRepo.fetchRelation({
            followerId: blockerId,
            followedId: blockedId,
        });
        const secondRelation = await this.followRepo.fetchRelation({
            followerId: blockedId,
            followedId: blockerId,
        });

        if (
            !secondRelation ||
            (secondRelation &&
                secondRelation.status !== 'gotBlocked' &&
                secondRelation &&
                secondRelation.status !== 'twoWayBlocked')
        )
            return new ForbiddenError(UnblockReason.NotBlocked, 'the user is not blocker');

        if (
            !relation ||
            (relation &&
                relation.status !== 'blocked' &&
                relation &&
                relation.status !== 'twoWayBlocked')
        )
            return new ForbiddenError(UnblockReason.NotBlocked, 'This user is not blocked');

        if (relation.status === 'blocked') await this.followRepo.delete(relation);
        else {
            relation.status = 'gotBlocked';
            await this.followRepo.update(relation);
        }

        if (secondRelation.status === 'gotBlocked') await this.followRepo.delete(secondRelation);
        else {
            secondRelation.status = 'blocked';
            await this.followRepo.update(secondRelation);
        }

        return { message: 'User removed from your blocks' };
    }

    async addToCloseFriends(
        username: string,
        friendUsername: string
    ): Promise<{ message: string } | NotFoundError | ForbiddenError> {
        if (username === friendUsername)
            return new ForbiddenError(
                AddFriendReason.SelfFriend,
                'User cannot add themselves as a close friend'
            );

        const friend = await this.userService.doesUserExists({
            username: friendUsername,
        });

        if (!friend) return new NotFoundError(AddFriendReason.NotFoundUser, 'User not found');

        const relation = await this.followRepo.fetchRelation({
            followerId: username,
            followedId: friendUsername,
        });

        if (relation && relation.status === 'friend')
            return new ForbiddenError(
                AddFriendReason.AlreadyFriend,
                'User is already a close friend'
            );

        if (!relation || relation.status !== 'follow')
            return new ForbiddenError(
                AddFriendReason.NotFollowing,
                'You can only add followers as close friends'
            );

        relation.status = 'friend';

        await this.followRepo.update(relation);

        return { message: 'Added to close friends' };
    }

    async getBlockList(username: string): Promise<{
        blocks: GetFollowBlockListDao[];
    }> {
        const blocks = await this.followRepo.getBlocks(username);
        return {
            blocks: await Promise.all(
                blocks.map(async (b) => ({
                    username: b.followedId,
                    fName: b.followed.fName,
                    lName: b.followed.lName,
                    imageUrl: b.followed.imageUrl,
                    followersCount: await this.followRepo.followersCount(b.followedId),
                }))
            ),
        };
    }

    async getCloseFriendsList(username: string): Promise<{
        friends: GetFollowBlockListDao[];
    }> {
        const closeFriends = await this.followRepo.getCloseFriends(username);
        return {
            friends: await Promise.all(
                closeFriends.map(async (f) => ({
                    username: f.followedId,
                    fName: f.followed.fName,
                    lName: f.followed.lName,
                    imageUrl: f.followed.imageUrl,
                    followersCount: await this.followRepo.followersCount(f.followedId),
                }))
            ),
        };
    }

    async removeCloseFriend(
        mainUserName: string,
        friendName: string
    ): Promise<NotFoundError | ForbiddenError | { message: string }> {
        const friend = this.userService.doesUserExists({ username: friendName });
        if (!friend) return new NotFoundError(RemoveFriendReason.NotFoundUser, 'Friend not found');

        const relation = await this.followRepo.fetchRelation({
            followerId: mainUserName,
            followedId: friendName,
        });

        if (!relation || (relation && relation.status !== 'friend'))
            return new ForbiddenError(
                RemoveFriendReason.NotFriend,
                'This user is not your close friend'
            );

        relation.status = 'follow';

        await this.followRepo.update(relation);

        return { message: 'User removed from your close friends' };
    }
}
