import { HttpError } from '../../utility/errors';
import { EditProfileDto } from './dto/edit-profile-dto';
import { UpdateUser, userIdentifier, User, CreateUser } from './model/user';
import { UserRepository } from './user.repository';

export class UserService {
    constructor(private userRepo: UserRepository) {}

    async getProfileInfo(username: string) {
        const user = await this.fetchUser({ username });

        if (!user) throw new HttpError(401, 'Not authenticated');

        const returnUser = {
            email: user.email,
            username,
            imageUrl: user.imageUrl,
            fName: user.fName,
            lName: user.lName,
            isPrivate: user.isPrivate,
            bio: user.bio,
        };

        return returnUser;
    }

    async editUser(
        username: string,
        dto: EditProfileDto
    ): Promise<string> | never {
        const user = await this.userRepo.findByUsername(username);

        if (!user) throw new HttpError(401, 'Not authenticated');

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
        };

        return this.userRepo.create(createUser);
    }

    updateUser(dto: UpdateUser) {
        return this.userRepo.upadte(dto);
    }
}
