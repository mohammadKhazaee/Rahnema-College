import { User } from '../User/model/user';
import { UserRepository } from '../User/user.repository';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/logindto';

export class AuthService {

    constructor(private authRepo: AuthRepository, private userRepo: UserRepository) { }

    async login(dto: LoginDto) {
        let user: User | null;
        if ('username' in dto)
            user = await this.userRepo.findByUsername(dto.username);
        else user = await this.userRepo.findByEmail(dto.email);

        if (!user) {
            throw new Error('401 , username or password not found');
        }
        if (dto.password !== user.password) {
            throw new Error('401, passwort is wrong');
        }
        const token = this.authRepo.generateTokenForLogin(user);
        return token;
    }
}
