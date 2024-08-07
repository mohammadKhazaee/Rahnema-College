import { HttpError } from '../../utility/errors';
import { User } from '../User/model/user';
import { UserRepository } from '../User/user.repository';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/logindto';

export class AuthService {
    constructor(
        private authRepo: AuthRepository,
        private userRepo: UserRepository
    ) {}

    async login(dto: LoginDto) {
        let user: User | null;
        if ('username' in dto)
            user = await this.userRepo.findByUsername(dto.username);
        else user = await this.userRepo.findByEmail(dto.email);

        if (!user) {
            throw new HttpError(401, ' username or password not found');
        }
        if (dto.password !== user.password) {
            throw new HttpError(401, 'passwort is wrong');
        }
        const token = this.authRepo.generateTokenForLogin(user);
        return token;
    }

    async signup(dto: { username: string; password: string; email: string }) {
        const user = await this.userRepo.findByUsername(dto.username);

        if (user)
            throw new HttpError(
                409,
                'account with this credential already exists'
            );

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
}
