import { HttpError } from '../../utility/errors';
import { FileParser } from '../../utility/file-parser';
import { imageUrlPath } from '../../utility/path-adjuster';
import { EditProfileDto } from './dto/edit-profile-dto';
import { UserEntity } from './entity/user.entity';
import { UpdateUser, userIdentifier, User, CreateUser, UserSearchResult } from './model/user';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';

export class UserService {
    constructor(private userRepo: UserRepository) {}

    async editUser(
        username: string,
        dto: EditProfileDto,
        fileHandler: FileParser
    ): Promise<string> | never {
        const dupUser = await this.userRepo.findByEmail(dto.email);

        if (dupUser && dupUser.username !== username)
            throw new HttpError(409, 'the new email is already in use');

        const user = await this.getUser({ username });

        const updateData: UpdateUser = {
            username,
            email: dto.email,
            fName: dto.fName,
            lName: dto.lName,
            bio: dto.bio,
            isPrivate: dto.isPrivate,
        };
        if ('image' in dto && dto.image) updateData.imageUrl = imageUrlPath(dto.image.path);

        if ('password' in dto && dto.password)
            updateData.password = await bcrypt.hash(dto.password, 12);

        await this.userRepo.upadte(updateData);

        if ('image' in dto && dto.image) await fileHandler.deleteFiles([user.imageUrl]);

        return 'Profile Updated';
    }

    async getUser(userIds: userIdentifier): Promise<User> | never {
        const user = await this.fetchUser(userIds);

        if (!user) throw new HttpError(401, 'username or password not found');

        return user;
    }

    async fetchUser(userIds: userIdentifier): Promise<User | null> {
        let user: User | null;
        if ('username' in userIds) user = await this.userRepo.findByUsername(userIds.username);
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

    updateUser(dto: UpdateUser) {
        return this.userRepo.upadte(dto);
    }
    async searchUsers(
        query: string,
        currentUsername: string,
        page: number,
        count: number
    ): Promise<{ users: UserEntity[]; followersCount: number[] }> {
        const result = await this.userRepo.searchUsers(query, currentUsername, page, count);

        const users = result.entities;
        const followersCount = result.raw.map((r: any) => parseInt(r.followersCount, 10));

        return { users, followersCount };
    }
}
