import { Repository } from 'typeorm';
import { ForbiddenError, HttpError, NotFoundError } from '../../utility/errors';
import { EditProfileDto } from './dto/edit-profile-dto';
import { FollowingEntity } from './entity/following.entity';
import { Following } from './model/follow';
import { UpdateUser, userIdentifier, User, CreateUser } from './model/user';
import { UserRepository } from './user.repository';
import { AppDataSource } from '../../data-source';
import { PostEntity } from '../Post/entity/post.entity';

export class UserService {
    private followingRepo: Repository<FollowingEntity>;
    private postRepo: Repository<PostEntity>
    constructor(private userRepo: UserRepository) {
        this.followingRepo = AppDataSource.getRepository(FollowingEntity);
        this.postRepo = AppDataSource.getRepository(PostEntity)
    }

    async getProfileInfo(username: string) {
        const user = await this.fetchUser({ username });

        if (!user) throw new HttpError(401, 'Not authenticated');

        const followers = await this.getFollowersCount(username)
        const postCount = await this.getPostCount(username)
        const following = await this.getFollowingsCount(username)

        const returnUser = {
            email: user.email,
            username,
            imageUrl: user.imageUrl,
            fName: user.fName,
            lName: user.lName,
            isPrivate: user.isPrivate,
            bio: user.bio,
            followers,
            following,
            postCount,
        };

        return returnUser;
    }

    async editUser(
        username: string,
        dto: EditProfileDto
    ): Promise<string> | never {
        const dupEmail = await this.userRepo.findByEmail(dto.email);

        if (dupEmail && dupEmail.username !== username)
            throw new HttpError(409, 'the new email is already in use');

        const createUser: UpdateUser = {
            username,
            email: dto.email,
            fName: dto.fName || '',
            lName: dto.lName || '',
            imageUrl: dto.imageUrl || '',
            bio: dto.bio || '',
            isPrivate: dto.isPrivate,
        };
        if ('password' in dto) createUser.password = dto.password;

        await this.userRepo.upadte(createUser);

        return 'Profile Updated';
    }

    async getUser(userIds: userIdentifier): Promise<User> | never {
        const user = await this.fetchUser(userIds);

        if (!user) throw new HttpError(401, 'username or password not found');

        return user;
    }

    async fetchUser(userIds: userIdentifier): Promise<User | null> {
        let user: User | null;
        if ('username' in userIds)
            user = await this.userRepo.findByUsername(userIds.username);
        else user = await this.userRepo.findByEmail(userIds.email);
        return user;
    }

    async doesUserExists(userIds: userIdentifier): Promise<boolean> {
        const user = await this.fetchUser(userIds);
        return !!user;
    }

    async createUser(dto: CreateUser) {
        const createUser: User = {
            username: dto.username,
            email: dto.email,
            password: dto.password,
            fName: '',
            lName: '',
            imageUrl: '',
            bio: '',
            isPrivate: true,
            posts: [],
            followers: [],
            followings: [],
            mentions: [],
        };

        return this.userRepo.create(createUser);
    }

    async followUser(mainUsername: string, followedUsername: string) {
        if (mainUsername === followedUsername)
            throw new ForbiddenError('user cant follow themself');

        const follower = await this.fetchUser({ username: mainUsername });
        const followed = await this.fetchUser({ username: followedUsername });
        if (!follower || !followed) throw new NotFoundError();

        const following = this.createFollowing(follower, followed);
        const fetchedfollowing = await this.fetchFollowing(following);

        if (fetchedfollowing)
            throw new ForbiddenError('already following the user');

        await this.followingRepo.save(following);
        console.log('follower: ', follower);
        console.log('followed: ', followed);
        return `success`;
    }


    async unfollowUser(followerName: string, followedUsername: string) {
        if (followerName === followedUsername)
            throw new ForbiddenError('user cant unfollow themself');

        const follower = await this.fetchUser({ username: followerName });
        const followed = await this.fetchUser({ username: followedUsername });
        if (!follower || !followed) throw new NotFoundError();

        const following = this.createFollowing(follower, followed);
        const fetchedfollowing = await this.fetchFollowing(following);
        if (!fetchedfollowing)
            throw new ForbiddenError("user can't unfallow another user if didn't follow them first")


        await this.followingRepo.delete({
            followerId: follower.username,
            followedId: followed.username,
        })
        console.log('follower: ', follower);
        console.log('followed: ', followed);
        return 'success'
    }


    private async getFollowersCount(username: string) {
        const followers = await this.followingRepo.count({
            where: {
                followedId: username,
            }
        })
        return followers
    }


    private async getFollowingsCount(username: string) {
        const followers = await this.followingRepo.count({
            where: {
                followerId: username,
            }
        })
        return followers
    }


    private async getPostCount(username: string) {
        const posts = await this.postRepo.count({
            where: {
                creatorId: username,
            }
        })
        return posts
    }













    async fetchFollowing(following: Following) {
        const data = await this.followingRepo.findOne({
            where: {
                followerId: following.followerId,
                followedId: following.followedId,
            },
        });
        return data;
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

    updateUser(dto: UpdateUser) {
        return this.userRepo.upadte(dto);
    }
}
