import { Repository } from 'typeorm';
import { ForbiddenError, HttpError, NotFoundError } from '../../utility/errors';
import { EditProfileDto } from './dto/edit-profile-dto';
import { UpdateUser, userIdentifier, User, CreateUser } from './model/user';
import { UserRepository } from './user.repository';
import { AppDataSource } from '../../data-source';
import { PostEntity } from '../Post/entity/post.entity';
import { FollowService } from '../Follow/follow.service';
import { FollowingEntity } from '../Follow/entity/following.entity';

export class UserService {
    private postRepo: Repository<PostEntity>;
    private SALT_ROUNDS = 10;
    constructor(private userRepo: UserRepository, private followService: FollowService) {
        this.postRepo = AppDataSource.getRepository(PostEntity);
    }

    async getUserInfo(username: string) {
        const user = await this.fetchUser({ username });
        if (!user) throw new HttpError(404, 'Not Found');

        const followers = await this.followService.getFollowersCount(username);
        const postCount = await this.getPostCount(username);
        const following = await this.followService.getFollowingsCount(username);

        const returnUser = {
            email: user.email,
            username,
            imageUrl: user.imageUrl,
            fName: user.fName,
            lName: user.lName,
            isPrivate: user.isPrivate,
            bio: user.bio,
            followersCount: followers,
            followingsCount: following,
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

        await this.followService.followUser(follower, followed)
        return `success`;

    }

    async unfollowUser(followerName: string, followedUsername: string) {
        if (followerName === followedUsername)
            throw new ForbiddenError('user cant unfollow themself');

        const follower = await this.fetchUser({ username: followerName });
        const followed = await this.fetchUser({ username: followedUsername });
        if (!follower || !followed) throw new NotFoundError();

        await this.followService.unfollowUser(follower, followed)
        return 'success';
    }

    async getFollowers(username: string): Promise<FollowingEntity[]> {
        const user = await this.fetchUser({ username, })
        if (!user) throw new NotFoundError()
        const followersList = await this.followService.getFollowersList(username)
        return followersList
    }



    private async getPostCount(username: string) {
        const posts = await this.postRepo.count({
            where: {
                creatorId: username,
            },
        });
        return posts;
    }

    updateUser(dto: UpdateUser) {
        return this.userRepo.upadte(dto);
    }
}
