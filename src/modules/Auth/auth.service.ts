import errorMap from 'zod/lib/locales/en';
import { AppDataSource } from '../../data-source';
import { User } from '../User/model/user';
import { UserRepository } from '../User/user.repository';
import { UserService } from '../User/user.service';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/logindto';
import { sign } from 'jsonwebtoken';

export class AuthService {
    constructor(
        private authRepo: AuthRepository,
        private userService: UserService
    ) { }
}
export class userService {
    private userRepo: UserRepository;
    constructor() {
        this.userRepo = new UserRepository(AppDataSource);
    }

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
        const token = this.generateToken(user);
        return token;
    }
    private generateToken(user: User, rememberMe?: boolean) {
        const expiresIn = rememberMe ? '30d' : '1w';
        const secret = 'Rebuilders';
        const payload = { username: user.username, email: user.email };
        return sign(payload, secret, { expiresIn });
    }
}
export class userService {
    private userRepo: UserRepository;
    constructor() {
        this.userRepo = new UserRepository(AppDataSource);
    }

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
        const token = this.generateToken(user);
        return token;
    }
    private generateToken(user: User, rememberMe?: boolean) {
        const expiresIn = rememberMe ? '30d' : '1w';
        const secret = 'Rebuilders';
        const payload = { username: user.username, email: user.email };
        return sign(payload, secret, { expiresIn });
    }
}
