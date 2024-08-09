import { HttpError } from '../../utility/errors';
import { EditProfileDto } from './dto/edit-profile-dto';
import { UpdateUser } from './model/update-user';
import { UserRepository } from './user.repository';

export class UserService {
    constructor(private userRepo: UserRepository) {}

    async editUser(username: string, dto: EditProfileDto): Promise<string> {
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

        const res = await this.userRepo.upadte(createUser);

        return 'Profile Updated';
    }
}
